/*
 * Mock data layer for offline/demo mode.
 * Returns realistic UK home-service data when the backend is unavailable.
 * Every mock function signature matches what the apiClient returns.
 */

// ─── Categories ─────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES = [
  { id: 'cat-plumbing', name: 'Plumbing', icon: 'droplet', description: 'Leaks, taps, pipes, cylinders and bathroom plumbing.', status: 'active', order: 1 },
  { id: 'cat-electrical', name: 'Electrical', icon: 'zap', description: 'Wiring, sockets, consumer unit upgrades and fault finding.', status: 'active', order: 2 },
  { id: 'cat-heating', name: 'Heating & Boiler Repair', icon: 'wrench', description: 'Boiler servicing and repair, central heating faults and Gas Safe engineers.', status: 'active', order: 3 },
  { id: 'cat-cleaning', name: 'Cleaning', icon: 'sparkles', description: 'Regular home cleaning, end-of-tenancy and office cleaning.', status: 'active', order: 4 },
  { id: 'cat-gardening', name: 'Gardening', icon: 'home', description: 'Lawn care, hedge trimming, garden tidy-ups and landscaping.', status: 'active', order: 5 },
  { id: 'cat-handyman', name: 'Handyman', icon: 'wrench', description: 'General repairs, fixture installation and odd jobs around the home.', status: 'active', order: 6 },
  { id: 'cat-carpentry', name: 'Carpentry', icon: 'hammer', description: 'Furniture repair, fitted wardrobes, doors and custom woodwork.', status: 'active', order: 7 },
  { id: 'cat-painting', name: 'Painting & Decorating', icon: 'paintbrush', description: 'Interior and exterior painting, wallpapering and finishing.', status: 'active', order: 8 },
  { id: 'cat-appliance', name: 'Appliance Repair', icon: 'washer', description: 'Washing machines, fridges, ovens, dishwashers and tumble dryers.', status: 'active', order: 9 },
  { id: 'cat-pest', name: 'Pest Control', icon: 'bug', description: 'Mice, rats, wasps, bed bugs and other pest treatments.', status: 'active', order: 10 },
  { id: 'cat-tutoring', name: 'Tutoring', icon: 'book', description: 'Home tutors for GCSE, A-Level and primary school subjects.', status: 'active', order: 11 },
  { id: 'cat-beauty', name: 'Beauty & Salon', icon: 'scissors', description: 'Hairdressing, barbering, nails and beauty treatments at home.', status: 'active', order: 12 },
];

// ─── Providers ──────────────────────────────────────────────────────────────
export const MOCK_PROVIDERS = [
  {
    id: 'prov-001',
    displayName: 'Daniel Harris',
    businessName: 'London Plumbing Experts',
    photoURL: null,
    bio: 'Gas Safe registered plumber with 14 years of experience in residential plumbing across London.',
    phone: '020 7946 0958',
    city: 'London',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.8,
    ratingCount: 124,
    minPrice: 70,
    categoryIds: ['cat-plumbing'],
    areaIds: ['area-westminster-ldn', 'area-camden-ldn'],
    serviceAreas: [
      { areaName: 'Westminster', city: 'London' },
      { areaName: 'Camden', city: 'London' },
    ],
    cities: ['London'],
    activeServiceCount: 5,
  },
  {
    id: 'prov-002',
    displayName: 'Hannah Taylor',
    businessName: 'West London Cleaning Co.',
    photoURL: null,
    bio: 'Leading cleaning service provider in London. Deep cleaning, end-of-tenancy and regular cleans for homes and offices.',
    phone: '07700 900234',
    city: 'London',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.9,
    ratingCount: 203,
    minPrice: 55,
    categoryIds: ['cat-cleaning'],
    areaIds: ['area-kensington-ldn', 'area-canarywharf-ldn'],
    serviceAreas: [
      { areaName: 'Kensington', city: 'London' },
      { areaName: 'Canary Wharf', city: 'London' },
    ],
    cities: ['London'],
    activeServiceCount: 4,
  },
  {
    id: 'prov-003',
    displayName: 'Liam Walker',
    businessName: 'Manchester Electrical Services',
    photoURL: null,
    bio: 'NICEIC-registered electrician covering Greater Manchester. Rewiring, consumer unit upgrades and fault finding.',
    phone: '0161 123 4567',
    city: 'Manchester',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.7,
    ratingCount: 89,
    minPrice: 65,
    categoryIds: ['cat-electrical'],
    areaIds: ['area-citycentre-man', 'area-didsbury-man'],
    serviceAreas: [
      { areaName: 'City Centre', city: 'Manchester' },
      { areaName: 'Didsbury', city: 'Manchester' },
    ],
    cities: ['Manchester'],
    activeServiceCount: 3,
  },
  {
    id: 'prov-004',
    displayName: 'Sarah Patel',
    businessName: 'Birmingham Plumbing & Heating',
    photoURL: null,
    bio: 'Gas Safe heating engineer. Boiler servicing, repairs and central heating installation across Birmingham.',
    phone: '0121 234 5678',
    city: 'Birmingham',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.6,
    ratingCount: 67,
    minPrice: 85,
    categoryIds: ['cat-heating'],
    areaIds: ['area-citycentre-bhm', 'area-edgbaston-bhm'],
    serviceAreas: [
      { areaName: 'City Centre', city: 'Birmingham' },
      { areaName: 'Edgbaston', city: 'Birmingham' },
    ],
    cities: ['Birmingham'],
    activeServiceCount: 4,
  },
  {
    id: 'prov-005',
    displayName: 'Grace Campbell',
    businessName: '',
    photoURL: null,
    bio: 'MSc Mathematics, Edinburgh. Home tutor for GCSE and A-Level maths and physics for 9 years.',
    phone: '0131 123 4567',
    city: 'Edinburgh',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 5.0,
    ratingCount: 42,
    minPrice: 28,
    categoryIds: ['cat-tutoring'],
    areaIds: ['area-oldtown-edi', 'area-leith-edi'],
    serviceAreas: [
      { areaName: 'Old Town', city: 'Edinburgh' },
      { areaName: 'Leith', city: 'Edinburgh' },
    ],
    cities: ['Edinburgh'],
    activeServiceCount: 3,
  },
  {
    id: 'prov-006',
    displayName: 'Robert Stewart',
    businessName: 'Stewart Carpentry Works',
    photoURL: null,
    bio: 'Experienced carpenter specialising in fitted wardrobes, doors and custom woodwork across Glasgow.',
    phone: '0141 234 5678',
    city: 'Glasgow',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.5,
    ratingCount: 55,
    minPrice: 60,
    categoryIds: ['cat-carpentry'],
    areaIds: ['area-citycentre-gla', 'area-westend-gla'],
    serviceAreas: [
      { areaName: 'City Centre', city: 'Glasgow' },
      { areaName: 'West End', city: 'Glasgow' },
    ],
    cities: ['Glasgow'],
    activeServiceCount: 3,
  },
  {
    id: 'prov-007',
    displayName: 'Megan Davies',
    businessName: 'Welsh Cleaning Services',
    photoURL: null,
    bio: 'Home and office cleaning across Cardiff. Deep cleans, regular cleans and end-of-tenancy specialists.',
    phone: '029 2012 3456',
    city: 'Cardiff',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.6,
    ratingCount: 38,
    minPrice: 50,
    categoryIds: ['cat-cleaning'],
    areaIds: ['area-citycentre-car', 'area-canton-car'],
    serviceAreas: [
      { areaName: 'City Centre', city: 'Cardiff' },
      { areaName: 'Canton', city: 'Cardiff' },
    ],
    cities: ['Cardiff'],
    activeServiceCount: 2,
  },
  {
    id: 'prov-008',
    displayName: 'Ryan Murphy',
    businessName: 'Belfast Home Repairs',
    photoURL: null,
    bio: 'General handyman and small repairs across Belfast. Fixtures, flat-pack assembly and odd jobs.',
    phone: '028 9024 6609',
    city: 'Belfast',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.4,
    ratingCount: 21,
    minPrice: 40,
    categoryIds: ['cat-handyman'],
    areaIds: ['area-citycentre-bel'],
    serviceAreas: [{ areaName: 'City Centre', city: 'Belfast' }],
    cities: ['Belfast'],
    activeServiceCount: 2,
  },
  {
    id: 'prov-009',
    displayName: 'Jack Edwards',
    businessName: 'Edwards Appliance Repair',
    photoURL: null,
    bio: 'Washing machine, fridge and oven repair across Bristol. Same-day service for most appliance faults.',
    phone: '0117 123 4567',
    city: 'Bristol',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.7,
    ratingCount: 29,
    minPrice: 75,
    categoryIds: ['cat-appliance'],
    areaIds: ['area-citycentre-bri'],
    serviceAreas: [{ areaName: 'City Centre', city: 'Bristol' }],
    cities: ['Bristol'],
    activeServiceCount: 3,
  },
  {
    id: 'prov-010',
    displayName: 'Chloe Wright',
    businessName: '',
    photoURL: null,
    bio: 'Mobile hairdresser and beauty therapist visiting clients at home across Leeds.',
    phone: '0113 234 5678',
    city: 'Leeds',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.5,
    ratingCount: 14,
    minPrice: 25,
    categoryIds: ['cat-beauty'],
    areaIds: ['area-citycentre-lee'],
    serviceAreas: [{ areaName: 'City Centre', city: 'Leeds' }],
    cities: ['Leeds'],
    activeServiceCount: 2,
  },
];

// ─── Reviews ────────────────────────────────────────────────────────────────
const now = Date.now();
const day = 86400000;
export const MOCK_REVIEWS = [
  {
    id: 'rev-001',
    providerId: 'prov-001',
    providerName: 'London Plumbing Experts',
    customerId: 'cust-001',
    customerName: 'James Wilson',
    rating: 5,
    comment: 'Daniel fixed our leaking kitchen pipe within an hour. Very professional and reasonably priced. Highly recommended!',
    serviceTitle: 'Leak detection & repair',
    status: 'active',
    createdAt: new Date(now - 2 * day).toISOString(),
  },
  {
    id: 'rev-002',
    providerId: 'prov-002',
    providerName: 'West London Cleaning Co.',
    customerId: 'cust-002',
    customerName: 'Sophie Williams',
    rating: 5,
    comment: 'Absolutely amazing deep clean. My flat looks brand new! The team was punctual, thorough and well-equipped.',
    serviceTitle: 'End-of-tenancy deep clean',
    status: 'active',
    createdAt: new Date(now - 3 * day).toISOString(),
  },
  {
    id: 'rev-003',
    providerId: 'prov-003',
    providerName: 'Manchester Electrical Services',
    customerId: 'cust-003',
    customerName: 'Emily Smith',
    rating: 4,
    comment: 'Good work rewiring the kitchen sockets. Liam was on time and explained everything clearly.',
    serviceTitle: 'Socket & lighting installation',
    status: 'active',
    createdAt: new Date(now - 5 * day).toISOString(),
  },
  {
    id: 'rev-004',
    providerId: 'prov-005',
    providerName: 'Grace Campbell',
    customerId: 'cust-004',
    customerName: 'Oliver Brown',
    rating: 5,
    comment: "Grace is an exceptional tutor. My daughter's GCSE maths grade improved from a 5 to an 8 in four months.",
    serviceTitle: 'Maths & Physics tuition',
    status: 'active',
    createdAt: new Date(now - 1 * day).toISOString(),
  },
  {
    id: 'rev-005',
    providerId: 'prov-004',
    providerName: 'Birmingham Plumbing & Heating',
    customerId: 'cust-005',
    customerName: 'Jack Thompson',
    rating: 5,
    comment: 'Sarah serviced our boiler and found a fault before it became a breakdown. Very knowledgeable.',
    serviceTitle: 'Boiler service',
    status: 'active',
    createdAt: new Date(now - 7 * day).toISOString(),
  },
  {
    id: 'rev-006',
    providerId: 'prov-006',
    providerName: 'Stewart Carpentry Works',
    customerId: 'cust-006',
    customerName: 'Amelia Reid',
    rating: 4,
    comment: 'Got a custom wardrobe fitted by Robert. Beautiful finish and sturdy construction. Slightly delayed but worth the wait.',
    serviceTitle: 'Fitted wardrobe',
    status: 'active',
    createdAt: new Date(now - 4 * day).toISOString(),
  },
  {
    id: 'rev-007',
    providerId: 'prov-007',
    providerName: 'Welsh Cleaning Services',
    customerId: 'cust-007',
    customerName: 'Dylan Evans',
    rating: 5,
    comment: 'Megan and her team deep cleaned our whole house safely and quickly. Fair pricing for Cardiff.',
    serviceTitle: 'One-off home clean',
    status: 'active',
    createdAt: new Date(now - 6 * day).toISOString(),
  },
  {
    id: 'rev-008',
    providerId: 'prov-009',
    providerName: 'Edwards Appliance Repair',
    customerId: 'cust-008',
    customerName: 'Erin Murphy',
    rating: 5,
    comment: 'Fridge was fixed same day. Jack explained the issue clearly before charging anything.',
    serviceTitle: 'Washing machine repair',
    status: 'active',
    createdAt: new Date(now - 8 * day).toISOString(),
  },
];

// ─── Quick Replies (chatbot) ────────────────────────────────────────────────
export const MOCK_QUICK_REPLIES = [
  'How do I book a service?',
  'Which areas do you cover?',
  'How are providers verified?',
  'Can I cancel a booking?',
  'How do payments work?',
];

// ─── Platform Config ────────────────────────────────────────────────────────
export const MOCK_PLATFORM_CONFIG = {
  platformName: 'Fixora',
  supportEmail: 'support@fixora.com',
  supportPhone: '+44 20 7946 0000',
  cancellationCutoffHours: 2,
  maxBookingsPerDay: 10,
};

// ─── Area facets ────────────────────────────────────────────────────────────
export const MOCK_AREA_FACETS = {
  provinces: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Cardiff', 'Belfast', 'Bristol', 'Leeds'],
};

// ─── Mock Areas for search ──────────────────────────────────────────────────
export const MOCK_AREAS = [
  { id: 'area-westminster-ldn', areaName: 'Westminster', city: 'London', district: 'Greater London', province: 'England', postalCode: 'SW1A 1AA' },
  { id: 'area-camden-ldn', areaName: 'Camden', city: 'London', district: 'Greater London', province: 'England', postalCode: 'NW1 6XE' },
  { id: 'area-kensington-ldn', areaName: 'Kensington', city: 'London', district: 'Greater London', province: 'England', postalCode: 'W8 7RG' },
  { id: 'area-canarywharf-ldn', areaName: 'Canary Wharf', city: 'London', district: 'Greater London', province: 'England', postalCode: 'E14 5AB' },
  { id: 'area-citycentre-man', areaName: 'City Centre', city: 'Manchester', district: 'Greater Manchester', province: 'England', postalCode: 'M1 1AE' },
  { id: 'area-didsbury-man', areaName: 'Didsbury', city: 'Manchester', district: 'Greater Manchester', province: 'England', postalCode: 'M20 2YR' },
  { id: 'area-citycentre-bhm', areaName: 'City Centre', city: 'Birmingham', district: 'West Midlands', province: 'England', postalCode: 'B1 1AA' },
  { id: 'area-edgbaston-bhm', areaName: 'Edgbaston', city: 'Birmingham', district: 'West Midlands', province: 'England', postalCode: 'B15 2TT' },
  { id: 'area-citycentre-bri', areaName: 'City Centre', city: 'Bristol', district: 'Bristol', province: 'England', postalCode: 'BS1 4DJ' },
  { id: 'area-citycentre-lee', areaName: 'City Centre', city: 'Leeds', district: 'West Yorkshire', province: 'England', postalCode: 'LS1 1UR' },
  { id: 'area-oldtown-edi', areaName: 'Old Town', city: 'Edinburgh', district: 'City of Edinburgh', province: 'Scotland', postalCode: 'EH1 1YZ' },
  { id: 'area-leith-edi', areaName: 'Leith', city: 'Edinburgh', district: 'City of Edinburgh', province: 'Scotland', postalCode: 'EH6 7EA' },
  { id: 'area-citycentre-gla', areaName: 'City Centre', city: 'Glasgow', district: 'Glasgow City', province: 'Scotland', postalCode: 'G1 1AA' },
  { id: 'area-westend-gla', areaName: 'West End', city: 'Glasgow', district: 'Glasgow City', province: 'Scotland', postalCode: 'G12 8QQ' },
  { id: 'area-citycentre-car', areaName: 'City Centre', city: 'Cardiff', district: 'South Glamorgan', province: 'Wales', postalCode: 'CF10 1EP' },
  { id: 'area-canton-car', areaName: 'Canton', city: 'Cardiff', district: 'South Glamorgan', province: 'Wales', postalCode: 'CF5 1JA' },
  { id: 'area-citycentre-bel', areaName: 'City Centre', city: 'Belfast', district: 'County Antrim', province: 'Northern Ireland', postalCode: 'BT1 1AA' },
];

// ─── Mock Search Results ────────────────────────────────────────────────────
function buildSearchResults(categoryId) {
  let providers = MOCK_PROVIDERS;
  if (categoryId) {
    providers = providers.filter((p) => p.categoryIds.includes(categoryId));
  }
  const categoryMap = Object.fromEntries(MOCK_CATEGORIES.map((c) => [c.id, c.name]));
  return providers.map((provider) => ({
    provider,
    startingPrice: provider.minPrice,
    pricingType: 'fixed',
    primaryService: { title: categoryMap[provider.categoryIds[0]] || 'Service' },
    serviceCount: provider.activeServiceCount,
    categoryNames: provider.categoryIds.map((id) => categoryMap[id] || 'Other'),
  }));
}

// ─── Mock chatbot reply ─────────────────────────────────────────────────────
const FAQ_ANSWERS = {
  'how do i book': 'To book a service: 1) Search by category and area, 2) Choose a verified provider, 3) Pick an available time slot, 4) Confirm your booking. You can track everything from your dashboard!',
  'which areas': 'Fixora covers towns, cities and postcodes across England, Scotland, Wales and Northern Ireland. Just enter your area name or postcode to find local providers.',
  'how are providers verified': 'Every new provider starts as "pending" and is hidden from search. Our team reviews their profile, documents and qualifications. Once approved, they get a green ✓ Verified badge.',
  'can i cancel': 'Yes! You can cancel any booking for free up to 2 hours before the scheduled time. After that, a cancellation fee may apply depending on the provider\'s policy.',
  'how do payments work': 'Currently, Fixora supports cash payment. You pay the provider directly once the job is completed. Prices are shown upfront in GBP before you book.',
  'default': 'I can help with booking services, finding providers, cancellations, and more. Try asking about our services or how to get started!',
};

function mockChatReply(message) {
  const lower = message.toLowerCase();
  for (const [key, answer] of Object.entries(FAQ_ANSWERS)) {
    if (key !== 'default' && lower.includes(key)) {
      return { reply: answer, resolved: true, links: [] };
    }
  }
  return { reply: FAQ_ANSWERS.default, resolved: true, links: [] };
}

// ─── Route handler ──────────────────────────────────────────────────────────
// Returns { matched: true, data } or { matched: false }
export function handleMockRequest(method, path, { body } = {}) {
  // GET /categories
  if (method === 'GET' && path === '/categories') {
    return { matched: true, data: MOCK_CATEGORIES };
  }

  // GET /providers/featured
  if (method === 'GET' && path === '/providers/featured') {
    return { matched: true, data: MOCK_PROVIDERS.slice(0, 4) };
  }

  // GET /providers/recent-reviews
  if (method === 'GET' && path === '/providers/recent-reviews') {
    return { matched: true, data: MOCK_REVIEWS.slice(0, 4) };
  }

  // GET /providers (search) — return as paginated envelope
  if (method === 'GET' && path === '/providers') {
    const results = buildSearchResults();
    return {
      matched: true,
      raw: true,
      data: {
        success: true,
        data: results,
        meta: { page: 1, pageSize: 20, total: results.length, totalItems: results.length, totalPages: 1 },
        context: {},
      },
    };
  }

  // GET /providers/:id
  const providerMatch = path.match(/^\/providers\/([^/]+)$/);
  if (method === 'GET' && providerMatch) {
    const provider = MOCK_PROVIDERS.find((p) => p.id === providerMatch[1]);
    if (provider) {
      return {
        matched: true,
        data: {
          ...provider,
          services: [
            { id: 'svc-1', title: MOCK_CATEGORIES.find((c) => c.id === provider.categoryIds[0])?.name || 'General Service', price: provider.minPrice, pricingType: 'fixed', durationMinutes: 60, description: 'Standard service' },
            { id: 'svc-2', title: 'Premium Service', price: provider.minPrice * 2, pricingType: 'fixed', durationMinutes: 120, description: 'Comprehensive service with warranty' },
          ],
        },
      };
    }
  }

  // GET /providers/:id/reviews
  const reviewMatch = path.match(/^\/providers\/([^/]+)\/reviews$/);
  if (method === 'GET' && reviewMatch) {
    const reviews = MOCK_REVIEWS.filter((r) => r.providerId === reviewMatch[1]);
    return {
      matched: true,
      raw: true,
      data: {
        success: true,
        data: reviews,
        meta: { page: 1, pageSize: 20, totalItems: reviews.length, totalPages: 1 },
      },
    };
  }

  // GET /providers/:id/slots
  const slotsMatch = path.match(/^\/providers\/([^/]+)\/slots$/);
  if (method === 'GET' && slotsMatch) {
    return {
      matched: true,
      data: [
        { start: '09:00', end: '10:00', available: true },
        { start: '10:00', end: '11:00', available: true },
        { start: '11:00', end: '12:00', available: false },
        { start: '14:00', end: '15:00', available: true },
        { start: '15:00', end: '16:00', available: true },
        { start: '16:00', end: '17:00', available: true },
      ],
    };
  }

  // GET /chatbot/quick-replies
  if (method === 'GET' && path === '/chatbot/quick-replies') {
    return { matched: true, data: MOCK_QUICK_REPLIES };
  }

  // POST /chatbot/message
  if (method === 'POST' && path === '/chatbot/message') {
    return { matched: true, data: mockChatReply(body?.message || '') };
  }

  // GET /config
  if (method === 'GET' && path === '/config') {
    return { matched: true, data: MOCK_PLATFORM_CONFIG };
  }

  // GET /areas/search
  if (method === 'GET' && path === '/areas/search') {
    return {
      matched: true,
      raw: true,
      data: {
        success: true,
        data: MOCK_AREAS,
        meta: { page: 1, pageSize: 50, totalItems: MOCK_AREAS.length, totalPages: 1 },
      },
    };
  }

  // GET /areas/facets
  if (method === 'GET' && path === '/areas/facets') {
    return { matched: true, data: MOCK_AREA_FACETS };
  }

  // GET /areas/:id
  const areaMatch = path.match(/^\/areas\/([^/]+)$/);
  if (method === 'GET' && areaMatch) {
    const area = MOCK_AREAS.find((a) => a.id === areaMatch[1]);
    if (area) return { matched: true, data: area };
  }

  // POST /auth/verify — return guest state
  if (method === 'POST' && path === '/auth/verify') {
    return { matched: false }; // let it fail naturally for auth
  }

  return { matched: false };
}
