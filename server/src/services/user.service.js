import { getAuth } from '../config/firebase.js';
import {
  userRepository,
  customerRepository,
  providerRepository,
  serviceRepository,
  reviewRepository,
  bookingRepository,
} from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { nowIso } from '../utils/time.js';
import { toUserProfile } from '../utils/serializers.js';
import { ACCOUNT_STATUS, ROLES, VERIFICATION_STATUS } from '../constants/index.js';
import { cancelActiveBookingsForAccountClosure } from './booking.service.js';
import { getArea } from './area.service.js';

export async function getMe(uid) {
  const user = await userRepository.findById(uid);
  if (!user) throw ApiError.notFound('User not found');
  return toUserProfile(user);
}

export async function updateMe(uid, changes) {
  if (changes.defaultAreaId) await getArea(changes.defaultAreaId);
  const updated = await userRepository.update(uid, { ...changes, updatedAt: nowIso() });

  // Providers have a public record with the same name/phone/photo.
  if (updated.role === ROLES.PROVIDER) {
    const sync = {};
    if (changes.displayName) sync.displayName = changes.displayName;
    if (changes.phone !== undefined) sync.phone = changes.phone;
    if (changes.photoURL !== undefined) sync.photoURL = changes.photoURL;
    if (Object.keys(sync).length) await providerRepository.update(uid, { ...sync, updatedAt: nowIso() });
  }
  return toUserProfile(updated);
}

/**
 * Account deletion keeps booking/report integrity:
 *  - future active bookings are cancelled and the other party notified
 *  - booking & review records are retained but personal data in them is anonymised
 *  - the user profile is anonymised and marked deleted; the Firebase Auth account is removed
 */
export async function deleteMe(user) {
  if (user.role === ROLES.ADMIN) {
    throw ApiError.forbidden('Administrator accounts must be removed by another administrator.');
  }
  const uid = user.uid;
  const timestamp = nowIso();

  await cancelActiveBookingsForAccountClosure(user);

  if (user.role === ROLES.CUSTOMER) {
    const [bookings, reviews] = await Promise.all([bookingRepository.findByCustomer(uid), reviewRepository.findByCustomer(uid)]);
    await Promise.all([
      ...bookings.map((b) =>
        bookingRepository.update(b.id, { customerName: 'Deleted user', customerPhone: '', customerAddress: '[removed]', updatedAt: timestamp }),
      ),
      ...reviews.map((r) => reviewRepository.update(r.id, { customerName: 'Former customer', updatedAt: timestamp })),
    ]);
    await customerRepository.upsert(uid, { savedProviderIds: [], deletedAt: timestamp, updatedAt: timestamp });
  }

  if (user.role === ROLES.PROVIDER) {
    const services = await serviceRepository.findByProvider(uid);
    await Promise.all(services.map((s) => serviceRepository.update(s.id, { active: false, updatedAt: timestamp })));
    await providerRepository.update(uid, {
      displayName: 'Deleted provider',
      businessName: '',
      bio: '',
      phone: '',
      whatsapp: '',
      photoURL: '',
      verificationDocuments: [],
      verificationStatus: VERIFICATION_STATUS.SUSPENDED,
      accountActive: false,
      activeServiceCount: 0,
      deletedAt: timestamp,
      updatedAt: timestamp,
    });
  }

  await userRepository.update(uid, {
    displayName: 'Deleted user',
    email: null,
    phone: '',
    address: '',
    city: '',
    photoURL: '',
    status: ACCOUNT_STATUS.DELETED,
    deletedAt: timestamp,
    updatedAt: timestamp,
  });

  try {
    await getAuth().deleteUser(uid);
  } catch (error) {
    // Profile is already anonymised; auth removal can be retried from the console.
    logger.warn(`Could not delete Firebase Auth user ${uid}: ${error.message}`);
  }
  return { deleted: true };
}
