#!/usr/bin/env node
/*
 * Fixora Firestore seed.
 *   npm run seed        → categories, Pakistan areas, platform settings (safe to re-run)
 *   npm run seed:demo   → the above + demo admin/customers/providers/services/reviews
 * Run from the repository root (or `cd server && npm run seed`). Uses server/.env credentials.
 */
import { AREAS } from './data/areas.mjs';
import { CATEGORIES } from './data/categories.mjs';
import { DEMO_ADMIN, DEMO_CUSTOMERS, DEMO_HISTORY, DEMO_PASSWORD, DEMO_PROVIDERS } from './data/demo.mjs';
import { areaId, assertServerConfig, categoryId, ensureAuthUser, getDb, nowIso, ukDate, writeInBatches } from './seedUtils.mjs';

const withDemo = process.argv.includes('--demo');

const DEFAULT_SETTINGS = {
  bookingCancellationCutoffMinutes: 120,
  lateCancellationPolicy: 'warn',
  lateCancellationFeePercent: 0,
  slotIntervalMinutes: 30,
  maxAdvanceBookingDays: 60,
  supportEmail: 'support@fixora.pk',
  supportPhone: '+92 300 0000000',
  platformName: 'Fixora',
};

async function seedCatalogue(db) {
  const ts = nowIso();
  await writeInBatches([
    ...CATEGORIES.map((c) => ({
      ref: db.collection('categories').doc(categoryId(c.name)),
      data: { ...c, slug: categoryId(c.name), createdAt: ts, updatedAt: ts },
    })),
    ...AREAS.map((area) => ({
      ref: db.collection('areas').doc(areaId(area)),
      data: { ...area, country: 'Pakistan', active: true, createdAt: ts, updatedAt: ts },
    })),
  ]);

  const settingsRef = db.collection('settings').doc('platform');
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists) await settingsRef.set({ ...DEFAULT_SETTINGS, updatedAt: ts });

  console.log(`✔ ${CATEGORIES.length} categories, ${AREAS.length} areas, platform settings`);
}

const areaByKey = Object.fromEntries(AREAS.map((a) => [`${a.city}|${a.areaName}`, a]));
const resolveArea = (key) => {
  const area = areaByKey[key];
  if (!area) throw new Error(`Unknown demo area "${key}"`);
  return { id: areaId(area), ...area };
};

const weekly = (start = '09:00', end = '18:00') =>
  Object.fromEntries(
    ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => [
      day,
      { enabled: day !== 'sunday', start, end },
    ]),
  );

const addMinutes = (time, minutes) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

async function seedDemo(db) {
  const ts = nowIso();
  const uids = {};

  // Admin
  const adminAuth = await ensureAuthUser({ email: DEMO_ADMIN.email, password: DEMO_PASSWORD, displayName: DEMO_ADMIN.displayName });
  await db.collection('users').doc(adminAuth.uid).set(
    { uid: adminAuth.uid, email: DEMO_ADMIN.email, displayName: DEMO_ADMIN.displayName, role: 'admin', status: 'active', phone: DEMO_ADMIN.phone, city: '', address: '', photoURL: '', defaultAreaId: '', createdAt: ts, updatedAt: ts },
    { merge: true },
  );

  // Customers
  for (const c of DEMO_CUSTOMERS) {
    const user = await ensureAuthUser({ email: c.email, password: DEMO_PASSWORD, displayName: c.displayName });
    uids[c.key] = user.uid;
    await db.collection('users').doc(user.uid).set(
      { uid: user.uid, email: c.email, displayName: c.displayName, role: 'customer', status: 'active', phone: c.phone, city: c.city, address: '', photoURL: '', defaultAreaId: resolveArea(c.defaultArea).id, createdAt: ts, updatedAt: ts },
      { merge: true },
    );
    await db.collection('customers').doc(user.uid).set({ userId: user.uid, savedProviderIds: [], createdAt: ts, updatedAt: ts }, { merge: true });
  }

  // Providers, services, availability
  const serviceIds = {};
  for (const p of DEMO_PROVIDERS) {
    const user = await ensureAuthUser({ email: p.email, password: DEMO_PASSWORD, displayName: p.displayName });
    uids[p.key] = user.uid;
    const areas = p.areas.map(resolveArea);
    const categoryIds = [...new Set(p.services.map((s) => categoryId(s.category)))];

    await db.collection('users').doc(user.uid).set(
      { uid: user.uid, email: p.email, displayName: p.displayName, role: 'provider', status: 'active', phone: p.phone, city: areas[0].city, address: '', photoURL: '', defaultAreaId: '', createdAt: ts, updatedAt: ts },
      { merge: true },
    );

    for (const s of p.services) {
      const ref = db.collection('services').doc(`${user.uid}-${categoryId(s.title)}`);
      serviceIds[`${p.key}|${s.title}`] = ref.id;
      await ref.set({
        providerId: user.uid,
        categoryId: categoryId(s.category),
        categoryName: s.category,
        title: s.title,
        description: s.description,
        price: s.price,
        pricingType: s.pricingType,
        duration: s.duration,
        active: true,
        imageURL: '',
        createdAt: ts,
        updatedAt: ts,
      });
    }

    await db.collection('providers').doc(user.uid).set({
      userId: user.uid,
      displayName: p.displayName,
      businessName: p.businessName,
      bio: p.bio,
      phone: p.phone,
      whatsapp: p.phone,
      showPhonePublicly: true,
      photoURL: '',
      experienceYears: p.experienceYears,
      categoryIds,
      areaIds: areas.map((a) => a.id),
      postalCodes: [...new Set(areas.map((a) => a.postalCode))],
      cities: [...new Set(areas.map((a) => a.city))],
      serviceAreas: areas.map((a) => ({ id: a.id, areaName: a.areaName, city: a.city, postalCode: a.postalCode })),
      verificationStatus: p.verificationStatus,
      verificationNote: '',
      verificationDocuments: [],
      accountActive: true,
      ratingAverage: 0,
      ratingCount: 0,
      ratingTotal: 0,
      completedBookings: 0,
      minPrice: Math.min(...p.services.map((s) => s.price)),
      activeServiceCount: p.services.length,
      verifiedAt: p.verificationStatus === 'verified' ? ts : null,
      createdAt: ts,
      updatedAt: ts,
    });

    await db.collection('availability').doc(user.uid).set({
      providerId: user.uid,
      weekly: weekly(),
      exceptions: [],
      slotIntervalMinutes: 30,
      bufferMinutes: 0,
      updatedAt: ts,
    });
  }

  // Completed bookings + reviews (deterministic IDs so re-running does not duplicate).
  const ratingTotals = {};
  for (const h of DEMO_HISTORY) {
    const provider = DEMO_PROVIDERS.find((p) => p.key === h.provider);
    const customer = DEMO_CUSTOMERS.find((c) => c.key === h.customer);
    const service = provider.services.find((s) => s.title === h.service);
    const bookingId = `demo-${h.customer}-${h.provider}-${Math.abs(h.dayOffset)}`;
    const bookingDate = ukDate(h.dayOffset);
    const area = resolveArea(provider.areas[0]);

    await db.collection('bookings').doc(bookingId).set({
      customerId: uids[h.customer],
      customerName: customer.displayName,
      customerPhone: customer.phone,
      providerId: uids[h.provider],
      providerName: provider.businessName || provider.displayName,
      serviceId: serviceIds[`${h.provider}|${h.service}`],
      serviceTitle: service.title,
      categoryId: categoryId(service.category),
      categoryName: service.category,
      bookingDate,
      startTime: h.startTime,
      endTime: addMinutes(h.startTime, service.duration),
      duration: service.duration,
      price: service.price,
      pricingType: service.pricingType,
      areaId: area.id,
      areaName: `${area.areaName}, ${area.city}`,
      customerAddress: `House 12, ${area.areaName}, ${area.city}`,
      customerNotes: '',
      providerNotes: 'Job completed.',
      status: 'completed',
      paymentStatus: 'cash',
      paymentMethod: 'cash',
      reviewed: true,
      statusHistory: [{ status: 'pending', at: ts, by: uids[h.customer] }, { status: 'completed', at: ts, by: uids[h.provider] }],
      completedAt: ts,
      createdAt: ts,
      updatedAt: ts,
    });

    await db.collection('reviews').doc(bookingId).set({
      bookingId,
      customerId: uids[h.customer],
      customerName: customer.displayName,
      providerId: uids[h.provider],
      serviceId: serviceIds[`${h.provider}|${h.service}`],
      serviceTitle: service.title,
      rating: h.rating,
      comment: h.comment,
      status: 'published',
      createdAt: ts,
      updatedAt: ts,
    });

    ratingTotals[h.provider] ||= { total: 0, count: 0 };
    ratingTotals[h.provider].total += h.rating;
    ratingTotals[h.provider].count += 1;
  }

  for (const [key, { total, count }] of Object.entries(ratingTotals)) {
    await db.collection('providers').doc(uids[key]).update({
      ratingTotal: total,
      ratingCount: count,
      ratingAverage: Math.round((total / count) * 100) / 100,
      completedBookings: count,
    });
  }

  console.log(`✔ demo data: 1 admin, ${DEMO_CUSTOMERS.length} customers, ${DEMO_PROVIDERS.length} providers, ${DEMO_HISTORY.length} reviewed bookings`);
  console.log(`  All demo accounts use the password: ${DEMO_PASSWORD}`);
  console.log(`  Admin: ${DEMO_ADMIN.email} · Customer: ${DEMO_CUSTOMERS[0].email} · Provider: ${DEMO_PROVIDERS[0].email}`);
}

async function main() {
  assertServerConfig();
  const db = getDb();
  await seedCatalogue(db);
  if (withDemo) await seedDemo(db);
  console.log('Seeding complete.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});
