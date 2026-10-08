import { userRepository, customerRepository, providerRepository, availabilityRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { nowIso } from '../utils/time.js';
import { toUserProfile, toPrivateProvider } from '../utils/serializers.js';
import { ACCOUNT_STATUS, ERROR_CODES, ROLES, VERIFICATION_STATUS } from '../constants/index.js';
import { buildDefaultAvailability } from './availability.service.js';

/*
 * Registration flow:
 *   client creates the Firebase Auth account → calls POST /api/auth/register with its ID token
 *   → this service creates users/{uid} (+ customers/{uid} or providers/{uid}).
 * The role is accepted only once, at registration, and only as customer/provider.
 */
export async function registerProfile(firebaseUser, { role, displayName, phone = '', city = '' }) {
  const existing = await userRepository.findById(firebaseUser.uid);
  if (existing) {
    throw ApiError.conflict('This account is already registered. Please sign in.', ERROR_CODES.ALREADY_EXISTS);
  }
  if (!firebaseUser.email) throw ApiError.badRequest('An email address is required to register');

  const timestamp = nowIso();
  const user = await userRepository.create(
    {
      uid: firebaseUser.uid,
      email: firebaseUser.email.toLowerCase(),
      displayName,
      role,
      status: ACCOUNT_STATUS.ACTIVE,
      phone,
      city,
      address: '',
      photoURL: '',
      defaultAreaId: '',
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLoginAt: timestamp,
    },
    firebaseUser.uid,
  );

  if (role === ROLES.CUSTOMER) {
    await customerRepository.create(
      { userId: firebaseUser.uid, savedProviderIds: [], createdAt: timestamp, updatedAt: timestamp },
      firebaseUser.uid,
    );
  }

  if (role === ROLES.PROVIDER) {
    await providerRepository.create(
      {
        userId: firebaseUser.uid,
        displayName,
        businessName: '',
        bio: '',
        phone,
        whatsapp: '',
        showPhonePublicly: false,
        photoURL: '',
        experienceYears: 0,
        categoryIds: [],
        areaIds: [],
        postalCodes: [],
        cities: [],
        serviceAreas: [],
        // BR: every new provider starts unverified and hidden from search.
        verificationStatus: VERIFICATION_STATUS.PENDING,
        verificationNote: '',
        verificationDocuments: [],
        accountActive: true,
        ratingAverage: 0,
        ratingCount: 0,
        ratingTotal: 0,
        completedBookings: 0,
        minPrice: null,
        activeServiceCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      firebaseUser.uid,
    );
    await availabilityRepository.create(buildDefaultAvailability(firebaseUser.uid), firebaseUser.uid);
  }

  return getSession(user.id);
}

/** Returns the signed-in user's profile + role-specific record. Used after every login. */
export async function getSession(uid, { touchLogin = false } = {}) {
  const user = await userRepository.findById(uid);
  if (!user) throw ApiError.forbidden('Account profile not found. Please complete registration.', ERROR_CODES.PROFILE_NOT_FOUND);
  if (touchLogin) await userRepository.update(uid, { lastLoginAt: nowIso() });

  const session = { user: toUserProfile(user), provider: null };
  if (user.role === ROLES.PROVIDER) {
    session.provider = toPrivateProvider(await providerRepository.findById(uid));
  }
  return session;
}
