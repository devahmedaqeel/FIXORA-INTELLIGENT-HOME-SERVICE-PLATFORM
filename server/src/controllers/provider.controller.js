import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as providerService from '../services/provider.service.js';
import * as offeringService from '../services/serviceOffering.service.js';
import * as availabilityService from '../services/availability.service.js';
import * as reviewService from '../services/review.service.js';
import { toPublicService } from '../utils/serializers.js';

/* ---------- Public ---------- */

export const search = asyncHandler(async (req, res) => {
  const { items, meta, context } = await providerService.searchProviders(req.query);
  sendSuccess(res, {
    data: { items, context },
    meta,
    message: items.length ? `${meta.total} provider(s) found` : 'No providers found for this search',
  });
});

export const featured = asyncHandler(async (_req, res) =>
  sendSuccess(res, { data: await providerService.getFeaturedProviders(6) }),
);

export const recentReviews = asyncHandler(async (_req, res) =>
  sendSuccess(res, { data: await reviewService.listRecentPublicReviews(6) }),
);

export const getById = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await providerService.getPublicProfile(req.params.id, req.user) }),
);

export const reviews = asyncHandler(async (req, res) => {
  const { items, meta, summary } = await providerService.getProviderReviews(req.params.id, req.query);
  sendSuccess(res, { data: { items, summary }, meta });
});

export const availability = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await availabilityService.getPublicSchedule(req.params.id) }),
);

export const slots = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await availabilityService.getAvailableSlots(req.params.id, req.query) }),
);

/* ---------- Own (provider) ---------- */

export const getOwnProfile = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await providerService.getOwnProfile(req.user.uid) }),
);

export const updateOwnProfile = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await providerService.updateOwnProfile(req.user.uid, req.body), message: 'Profile updated' }),
);

export const dashboard = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await providerService.getDashboard(req.user.uid) }),
);

export const earnings = asyncHandler(async (req, res) => {
  const { items, meta, ...rest } = await providerService.getEarnings(req.user.uid, req.query);
  sendSuccess(res, { data: { items, ...rest }, meta });
});

export const ownReviews = asyncHandler(async (req, res) => {
  const { items, meta } = await reviewService.listProviderOwnReviews(req.user.uid, req.query);
  sendSuccess(res, { data: items, meta });
});

export const listOwnServices = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: (await offeringService.listProviderServices(req.user.uid)).map(toPublicService) }),
);

export const getOwnService = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: toPublicService(await offeringService.getOwnedService(req.user.uid, req.params.id)) }),
);

export const createService = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    data: toPublicService(await offeringService.createService(req.user.uid, req.body)),
    message: 'Service created',
    statusCode: 201,
  }),
);

export const updateService = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    data: toPublicService(await offeringService.updateService(req.user.uid, req.params.id, req.body)),
    message: 'Service updated',
  }),
);

export const deleteService = asyncHandler(async (req, res) => {
  const result = await offeringService.deleteService(req.user.uid, req.params.id);
  sendSuccess(res, {
    data: result,
    message: result.archived ? 'Service has bookings, so it was deactivated and archived' : 'Service deleted',
  });
});

export const getOwnAvailability = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await availabilityService.getAvailability(req.user.uid) }),
);

export const updateOwnAvailability = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await availabilityService.updateAvailability(req.user.uid, req.body), message: 'Availability saved' }),
);
