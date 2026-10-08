import { getDb } from '../config/firebase.js';
import { bookingRepository, providerRepository, reviewRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate } from '../utils/http.js';
import { nowIso } from '../utils/time.js';
import { toPublicReview } from '../utils/serializers.js';
import { BOOKING_STATUS, ERROR_CODES, NOTIFICATION_TYPES, REVIEW_STATUS } from '../constants/index.js';
import * as notificationService from './notification/notification.service.js';

/*
 * Ratings are kept as running totals on the provider (ratingTotal / ratingCount) and the
 * average is derived from them inside the same transaction as the review write, so the
 * displayed average can never drift from the published reviews.
 */

const ratingStats = (total, count) => ({
  ratingTotal: total,
  ratingCount: count,
  ratingAverage: count > 0 ? Math.round((total / count) * 100) / 100 : 0,
});

/** Applies a delta to a provider's rating totals inside an existing transaction. */
async function adjustProviderRating(tx, providerId, { totalDelta, countDelta }) {
  const ref = providerRepository.ref(providerId);
  const snap = await tx.get(ref);
  if (!snap.exists) return null;
  const data = snap.data();
  const total = Math.max((data.ratingTotal || 0) + totalDelta, 0);
  const count = Math.max((data.ratingCount || 0) + countDelta, 0);
  const stats = ratingStats(total, count);
  return () => tx.update(ref, { ...stats, updatedAt: nowIso() });
}

/** BR-2: only the customer of a completed booking can review it — once (review ID = booking ID). */
export async function createReview(customer, { bookingId, rating, comment }) {
  const reviewRef = reviewRepository.ref(bookingId);
  const bookingRef = bookingRepository.ref(bookingId);

  const review = await getDb().runTransaction(async (tx) => {
    const [bookingSnap, existingSnap] = [await tx.get(bookingRef), await tx.get(reviewRef)];
    if (!bookingSnap.exists) throw ApiError.notFound('Booking not found');
    const booking = { id: bookingSnap.id, ...bookingSnap.data() };

    if (booking.customerId !== customer.uid) throw ApiError.notFound('Booking not found');
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      throw ApiError.badRequest('You can review a provider only after the booking is completed', ERROR_CODES.REVIEW_NOT_ALLOWED);
    }
    if (existingSnap.exists) throw ApiError.conflict('You have already reviewed this booking', ERROR_CODES.DUPLICATE_REVIEW);

    const applyRating = await adjustProviderRating(tx, booking.providerId, { totalDelta: rating, countDelta: 1 });
    const timestamp = nowIso();
    const record = {
      bookingId,
      customerId: customer.uid,
      customerName: booking.customerName,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      serviceTitle: booking.serviceTitle,
      rating,
      comment: comment || '',
      status: REVIEW_STATUS.PUBLISHED,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    tx.set(reviewRef, record);
    tx.update(bookingRef, { reviewed: true, updatedAt: timestamp });
    applyRating?.();
    return { id: bookingId, ...record };
  });

  await notificationService.notify(review.providerId, {
    type: NOTIFICATION_TYPES.NEW_REVIEW,
    title: 'New review received',
    message: `${review.customerName} rated you ${review.rating}/5 for ${review.serviceTitle}.`,
    link: '/provider/reviews',
    data: { reviewId: review.id },
  });
  return review;
}

export async function updateOwnReview(customer, reviewId, { rating, comment }) {
  const ref = reviewRepository.ref(reviewId);
  return getDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.data().customerId !== customer.uid) throw ApiError.notFound('Review not found');
    const review = snap.data();
    if (review.status !== REVIEW_STATUS.PUBLISHED) throw ApiError.badRequest('This review has been removed by moderators');

    const update = { updatedAt: nowIso() };
    if (comment !== undefined) update.comment = comment;
    let applyRating = null;
    if (rating !== undefined && rating !== review.rating) {
      update.rating = rating;
      applyRating = await adjustProviderRating(tx, review.providerId, { totalDelta: rating - review.rating, countDelta: 0 });
    }
    tx.update(ref, update);
    applyRating?.();
    return { id: reviewId, ...review, ...update };
  });
}

/** Admin moderation: removing a review takes it out of the provider's average; restoring adds it back. */
export async function moderateReview(admin, reviewId, { status, moderationNote = '' }) {
  const ref = reviewRepository.ref(reviewId);
  return getDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw ApiError.notFound('Review not found');
    const review = snap.data();
    let applyRating = null;
    if (review.status !== status) {
      const sign = status === REVIEW_STATUS.REMOVED ? -1 : 1;
      applyRating = await adjustProviderRating(tx, review.providerId, { totalDelta: sign * review.rating, countDelta: sign });
    }
    const update = { status, moderationNote, moderatedBy: admin.uid, moderatedAt: nowIso(), updatedAt: nowIso() };
    tx.update(ref, update);
    applyRating?.();
    return { id: reviewId, ...review, ...update };
  });
}

export async function listMyReviews(customer) {
  const [reviews, bookings] = await Promise.all([
    reviewRepository.findByCustomer(customer.uid),
    bookingRepository.findByCustomer(customer.uid),
  ]);
  const awaitingReview = bookings
    .filter((b) => b.status === BOOKING_STATUS.COMPLETED && !b.reviewed)
    .map((b) => ({ bookingId: b.id, providerId: b.providerId, providerName: b.providerName, serviceTitle: b.serviceTitle, bookingDate: b.bookingDate }));
  return { reviews: reviews.map((r) => ({ ...toPublicReview(r), status: r.status })), awaitingReview };
}

export async function listProviderOwnReviews(providerId, query) {
  const reviews = await reviewRepository.findPublishedByProvider(providerId);
  return paginate(reviews.map(toPublicReview), query);
}

export async function listAllReviews({ status, page, limit } = {}) {
  const reviews = await reviewRepository.findAll(status);
  return paginate(
    reviews.map((r) => ({ ...toPublicReview(r), status: r.status, customerId: r.customerId, moderationNote: r.moderationNote || '' })),
    { page, limit },
  );
}

/** Latest published reviews across the platform (home page testimonials). */
export async function listRecentPublicReviews(limit = 6) {
  const reviews = await reviewRepository.findAll(REVIEW_STATUS.PUBLISHED);
  return reviews
    .filter((r) => r.rating >= 4 && r.comment)
    .slice(0, limit)
    .map(toPublicReview);
}
