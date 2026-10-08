import './env.js';
import request from 'supertest';
import { FakeFirestore, FakeAuth } from './fakeFirebase.js';
import { setFirebaseOverrides } from '../../src/config/firebase.js';
import { createApp } from '../../src/app.js';
import { clearSettingsCache } from '../../src/services/settings.service.js';
import { clearAreaCache } from '../../src/services/area.service.js';
import { setClock } from '../../src/utils/time.js';
import { setAiProvider, createAiProvider } from '../../src/chatbot/providers/aiProvider.js';
import { WEEKDAYS } from '../../src/constants/index.js';

/** Monday 2030-01-07 03:00 GMT. Bookings in tests use Tuesday 2030-01-08. */
export const FIXED_NOW = '2030-01-07T03:00:00.000Z';
export const BOOKING_DATE = '2030-01-08';

const TS = '2030-01-01T00:00:00.000Z';

export function createTestContext() {
  const db = new FakeFirestore();
  const auth = new FakeAuth();
  setFirebaseOverrides({ db, auth });
  clearSettingsCache();
  clearAreaCache();
  setClock(FIXED_NOW);
  setAiProvider(createAiProvider({ provider: 'none', apiKey: '' }));
  const app = createApp();

  const as = (uid) => {
    const withAuth = (req) => (uid ? req.set('Authorization', `Bearer token-${uid}`) : req);
    return {
      get: (url) => withAuth(request(app).get(url)),
      post: (url, body) => withAuth(request(app).post(url)).send(body ?? {}),
      put: (url, body) => withAuth(request(app).put(url)).send(body ?? {}),
      patch: (url, body) => withAuth(request(app).patch(url)).send(body ?? {}),
      delete: (url, body) => withAuth(request(app).delete(url)).send(body ?? {}),
    };
  };

  const seedUser = (uid, role, extra = {}) => {
    auth.addUser(uid, `${uid}@test.pk`);
    db.seed('users', uid, {
      uid,
      email: `${uid}@test.pk`,
      displayName: extra.displayName || uid,
      role,
      status: 'active',
      phone: '03001234567',
      city: '',
      address: '',
      photoURL: '',
      defaultAreaId: '',
      createdAt: TS,
      updatedAt: TS,
      ...extra,
    });
    if (role === 'customer') db.seed('customers', uid, { userId: uid, savedProviderIds: [], createdAt: TS, updatedAt: TS });
  };

  const seedCategory = (id, extra = {}) =>
    db.seed('categories', id, { name: id, slug: id, description: '', icon: 'wrench', active: true, createdAt: TS, updatedAt: TS, ...extra });

  const seedArea = (id, extra = {}) =>
    db.seed('areas', id, {
      areaName: 'Camden',
      city: 'London',
      district: 'Greater London',
      province: 'England',
      postalCode: 'NW1 6XE',
      country: 'United Kingdom',
      active: true,
      createdAt: TS,
      updatedAt: TS,
      ...extra,
    });

  const seedProvider = (uid, { verificationStatus = 'verified', areaIds = ['mirpur'], postalCodes = ['NW1 6XE'], categoryIds = ['plumbing'], ...extra } = {}) => {
    seedUser(uid, 'provider', { displayName: extra.displayName || uid });
    db.seed('providers', uid, {
      userId: uid,
      displayName: extra.displayName || uid,
      businessName: '',
      bio: '',
      phone: '07911123456',
      showPhonePublicly: false,
      photoURL: '',
      categoryIds,
      areaIds,
      postalCodes,
      cities: ['London'],
      serviceAreas: [],
      verificationStatus,
      verificationDocuments: [],
      accountActive: true,
      ratingAverage: 0,
      ratingCount: 0,
      ratingTotal: 0,
      completedBookings: 0,
      minPrice: 1000,
      activeServiceCount: 1,
      createdAt: TS,
      updatedAt: TS,
      ...extra,
    });
    db.seed('availability', uid, {
      providerId: uid,
      weekly: Object.fromEntries(WEEKDAYS.map((d) => [d, { enabled: true, start: '09:00', end: '17:00' }])),
      exceptions: [],
      slotIntervalMinutes: 30,
      bufferMinutes: 0,
      updatedAt: TS,
    });
  };

  const seedService = (id, providerId, extra = {}) =>
    db.seed('services', id, {
      providerId,
      categoryId: 'plumbing',
      categoryName: 'Plumbing',
      title: 'Leak repair',
      description: '',
      price: 1000,
      pricingType: 'fixed',
      duration: 60,
      active: true,
      createdAt: TS,
      updatedAt: TS,
      ...extra,
    });

  /** Standard marketplace: one area, one category, a verified provider with a service, a customer, an admin. */
  const seedMarketplace = () => {
    seedArea('mirpur');
    seedCategory('plumbing', { name: 'Plumbing' });
    seedProvider('prov1', { displayName: 'Usman Plumbing' });
    seedService('svc1', 'prov1');
    seedUser('cust1', 'customer', { displayName: 'Ayesha' });
    seedUser('cust2', 'customer', { displayName: 'Bilal' });
    seedUser('admin1', 'admin');
  };

  const bookingBody = (overrides = {}) => ({
    providerId: 'prov1',
    serviceId: 'svc1',
    bookingDate: BOOKING_DATE,
    startTime: '10:00',
    customerAddress: '1 Camden High Street, London, NW1 6XE',
    ...overrides,
  });

  return { app, db, auth, as, seedUser, seedCategory, seedArea, seedProvider, seedService, seedMarketplace, bookingBody, setClock };
}
