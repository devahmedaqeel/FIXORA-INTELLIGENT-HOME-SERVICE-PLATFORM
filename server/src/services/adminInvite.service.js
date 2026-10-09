import crypto from 'node:crypto';
import { getDb } from '../config/firebase.js';
import { adminInviteRepository, userRepository } from '../repositories/index.js';
import { env } from '../config/environment.js';
import { ApiError } from '../utils/ApiError.js';
import { now, nowIso } from '../utils/time.js';
import { ACCOUNT_STATUS, ADMIN_INVITE_EXPIRY_HOURS, AUDIT_ACTIONS, ERROR_CODES, ROLES } from '../constants/index.js';
import * as auditLogService from './auditLog.service.js';

/*
 * Admin accounts are never self-assignable. The FIRST admin is created out-of-band with the
 * trusted `npm run create-admin` CLI script (direct Admin SDK access). Every admin after that
 * is onboarded through a one-time, single-use, expiring invite that an existing admin
 * generates and shares out-of-band (email/Slack/etc) — /admin/signup only ever grants the
 * admin role when it is handed a valid token for the matching email.
 */

export async function createInvite(admin, email) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userRepository.findOneWhere([['email', '==', normalizedEmail]]);
  if (existingUser) {
    throw ApiError.conflict('This email already has a Fixora account. Promote an existing trusted admin manually if needed.');
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const timestamp = nowIso();
  const expiresAt = new Date(now().getTime() + ADMIN_INVITE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  await adminInviteRepository.create(
    {
      email: normalizedEmail,
      invitedBy: admin.uid,
      invitedByName: admin.displayName,
      used: false,
      usedAt: '',
      usedByUid: '',
      createdAt: timestamp,
      expiresAt,
    },
    token,
  );

  await auditLogService.record({
    action: AUDIT_ACTIONS.ADMIN_INVITE_CREATED,
    actorId: admin.uid,
    actorRole: admin.role,
    actorName: admin.displayName,
    details: `Admin invite created for ${normalizedEmail}, expires ${expiresAt}`,
  });

  return {
    email: normalizedEmail,
    expiresAt,
    signupUrl: `${env.clientUrls[0]}/admin/signup?token=${token}&email=${encodeURIComponent(normalizedEmail)}`,
  };
}

export async function listPendingInvites() {
  const invites = await adminInviteRepository.findPending();
  return invites.filter((i) => i.expiresAt > nowIso());
}

/**
 * Redeems an invite for the already-authenticated Firebase user (their account was just
 * created client-side). Validates token existence, expiry, single-use, and that it was
 * issued for this exact email — then grants the admin role. Wrapped in a transaction so a
 * token can never be redeemed twice even under concurrent requests.
 */
export async function redeemInvite(firebaseUser, token) {
  if (!firebaseUser.email) throw ApiError.badRequest('An email address is required to sign up');

  const existingProfile = await userRepository.findById(firebaseUser.uid);
  if (existingProfile) throw ApiError.conflict('This account is already registered.', ERROR_CODES.ALREADY_EXISTS);

  const timestamp = nowIso();
  const inviteRef = adminInviteRepository.ref(token);

  await getDb().runTransaction(async (tx) => {
    const snap = await tx.get(inviteRef);
    if (!snap.exists) throw ApiError.badRequest('This invite link is invalid.');
    const invite = snap.data();
    if (invite.used) throw ApiError.badRequest('This invite link has already been used.');
    if (invite.expiresAt < timestamp) throw ApiError.badRequest('This invite link has expired.');
    if (invite.email !== firebaseUser.email.toLowerCase()) {
      throw ApiError.badRequest('This invite was issued for a different email address.');
    }
    tx.update(inviteRef, { used: true, usedAt: timestamp, usedByUid: firebaseUser.uid });
  });

  const user = await userRepository.create(
    {
      uid: firebaseUser.uid,
      email: firebaseUser.email.toLowerCase(),
      displayName: firebaseUser.name || 'Fixora Admin',
      role: ROLES.ADMIN,
      status: ACCOUNT_STATUS.ACTIVE,
      phone: '',
      city: '',
      address: '',
      photoURL: '',
      defaultAreaId: '',
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLoginAt: timestamp,
    },
    firebaseUser.uid,
  );

  await auditLogService.record({
    action: AUDIT_ACTIONS.ADMIN_INVITE_REDEEMED,
    actorId: firebaseUser.uid,
    actorRole: ROLES.ADMIN,
    actorName: user.displayName,
    details: `New admin account created via invite (${user.email})`,
  });

  return { user: { uid: user.id, email: user.email, displayName: user.displayName, role: user.role, status: user.status }, provider: null };
}
