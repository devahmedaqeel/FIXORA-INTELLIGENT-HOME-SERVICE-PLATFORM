/*
 * Shape documents for API responses. Public serializers strip private fields so the
 * same endpoint can safely serve anonymous visitors and the future mobile app.
 */

import { DEFAULT_NOTIFICATION_PREFERENCES } from '../constants/index.js';

export const toPublicProvider = (provider) => {
  if (!provider) return null;
  return {
    id: provider.id,
    displayName: provider.displayName,
    businessName: provider.businessName || '',
    title: provider.title || '',
    bio: provider.bio || '',
    photoURL: provider.photoURL || '',
    experienceYears: provider.experienceYears ?? null,
    languages: provider.languages || [],
    specializations: provider.specializations || [],
    responseTime: provider.responseTime || '',
    serviceRadiusKm: provider.serviceRadiusKm ?? null,
    phone: provider.showPhonePublicly ? provider.phone || '' : '',
    whatsapp: provider.showPhonePublicly ? provider.whatsapp || '' : '',
    categoryIds: provider.categoryIds || [],
    areaIds: provider.areaIds || [],
    cities: provider.cities || [],
    serviceAreas: provider.serviceAreas || [],
    verificationStatus: provider.verificationStatus,
    isVerified: provider.verificationStatus === 'verified',
    ratingAverage: provider.ratingAverage || 0,
    ratingCount: provider.ratingCount || 0,
    completedBookings: provider.completedBookings || 0,
    minPrice: provider.minPrice ?? null,
    memberSince: provider.createdAt,
  };
};

/** Full provider record for the owner and admins. */
export const toPrivateProvider = (provider) => {
  if (!provider) return null;
  const { ratingTotal: _ratingTotal, ...rest } = provider;
  return { ...toPublicProvider(provider), ...rest };
};

export const toPublicService = (service) =>
  service && {
    id: service.id,
    providerId: service.providerId,
    categoryId: service.categoryId,
    categoryName: service.categoryName || '',
    title: service.title,
    description: service.description || '',
    price: service.price,
    pricingType: service.pricingType,
    duration: service.duration,
    imageURL: service.imageURL || '',
    active: service.active,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };

export const toPublicReview = (review) =>
  review && {
    id: review.id,
    bookingId: review.bookingId,
    providerId: review.providerId,
    customerName: review.customerName || 'Fixora customer',
    serviceTitle: review.serviceTitle || '',
    rating: review.rating,
    comment: review.comment || '',
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };

export const toUserProfile = (user) =>
  user && {
    uid: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    phone: user.phone || '',
    city: user.city || '',
    address: user.address || '',
    defaultAreaId: user.defaultAreaId || '',
    photoURL: user.photoURL || '',
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(user.notificationPreferences || {}) },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
