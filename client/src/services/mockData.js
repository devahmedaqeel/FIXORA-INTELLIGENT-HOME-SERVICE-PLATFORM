/*
 * Mock data layer for offline/demo mode.
 * Returns realistic Pakistani home-service data when the backend is unavailable.
 * Every mock function signature matches what the apiClient returns.
 */

// ─── Categories ─────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES = [
  { id: 'cat-plumbing', name: 'Plumbing', icon: 'droplet', description: 'Pipe repairs, tap fitting, drain cleaning, water tank installation and bathroom fixtures.', status: 'active', order: 1 },
  { id: 'cat-electrical', name: 'Electrical', icon: 'zap', description: 'Wiring, switchboard repair, fan installation, UPS setup and safety inspections.', status: 'active', order: 2 },
  { id: 'cat-cleaning', name: 'Cleaning', icon: 'sparkles', description: 'Deep cleaning, sofa washing, kitchen degreasing, water tank cleaning and office cleaning.', status: 'active', order: 3 },
  { id: 'cat-ac', name: 'AC & Cooling', icon: 'snowflake', description: 'AC installation, gas refill, servicing, duct cleaning and inverter repair.', status: 'active', order: 4 },
  { id: 'cat-carpentry', name: 'Carpentry', icon: 'hammer', description: 'Furniture repair, cabinet making, door fitting, wood polishing and custom shelves.', status: 'active', order: 5 },
  { id: 'cat-painting', name: 'Painting', icon: 'paintbrush', description: 'Interior and exterior painting, wall texture, POP work and waterproofing.', status: 'active', order: 6 },
  { id: 'cat-tutoring', name: 'Home Tutoring', icon: 'book', description: 'Matric, Inter, O/A-Level tutoring in science, maths, English and computer subjects.', status: 'active', order: 7 },
  { id: 'cat-pest', name: 'Pest Control', icon: 'bug', description: 'Termite treatment, fumigation, bed bug removal, cockroach spray and rodent control.', status: 'active', order: 8 },
  { id: 'cat-appliance', name: 'Appliance Repair', icon: 'washer', description: 'Washing machine, fridge, microwave, geyser and oven repair by certified technicians.', status: 'active', order: 9 },
  { id: 'cat-renovation', name: 'Home Renovation', icon: 'home', description: 'Bathroom remodelling, kitchen renovation, false ceiling, tiling and complete makeovers.', status: 'active', order: 10 },
  { id: 'cat-computer', name: 'Computer & IT', icon: 'laptop', description: 'Laptop repair, data recovery, network setup, CCTV installation and printer service.', status: 'active', order: 11 },
  { id: 'cat-general', name: 'General Maintenance', icon: 'wrench', description: 'Handyman services, minor fixes, assembly, shifting helpers and odd jobs around the house.', status: 'active', order: 12 },
];

// ─── Providers ──────────────────────────────────────────────────────────────
export const MOCK_PROVIDERS = [
  {
    id: 'prov-001',
    displayName: 'Usman Ali',
    businessName: 'Usman Plumbing Solutions',
    photoURL: null,
    bio: 'Professional plumber with 12 years of experience in residential and commercial plumbing across Rawalpindi and Islamabad.',
    phone: '0311-2345678',
    city: 'Rawalpindi',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.8,
    ratingCount: 124,
    minPrice: 800,
    categoryIds: ['cat-plumbing'],
    areaIds: ['area-saddar-rwp', 'area-bahria-rwp'],
    serviceAreas: [
      { areaName: 'Saddar', city: 'Rawalpindi' },
      { areaName: 'Bahria Town', city: 'Rawalpindi' },
    ],
    cities: ['Rawalpindi'],
    activeServiceCount: 5,
  },
  {
    id: 'prov-002',
    displayName: 'Ayesha Khan',
    businessName: 'SparkClean Services',
    photoURL: null,
    bio: 'Leading cleaning service provider in Lahore. We specialise in deep cleaning, sofa washing, and move-in/move-out cleaning for homes and offices.',
    phone: '0300-9876543',
    city: 'Lahore',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.9,
    ratingCount: 203,
    minPrice: 1500,
    categoryIds: ['cat-cleaning'],
    areaIds: ['area-dha-lhr', 'area-gulberg-lhr'],
    serviceAreas: [
      { areaName: 'DHA Phase 5', city: 'Lahore' },
      { areaName: 'Gulberg III', city: 'Lahore' },
    ],
    cities: ['Lahore'],
    activeServiceCount: 4,
  },
  {
    id: 'prov-003',
    displayName: 'Bilal Ahmed',
    businessName: 'CoolTech AC Services',
    photoURL: null,
    bio: 'Certified HVAC technician. AC installation, gas refill, and servicing for all brands including Gree, Haier, Dawlance and Orient.',
    phone: '0321-5551234',
    city: 'Karachi',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.7,
    ratingCount: 89,
    minPrice: 1200,
    categoryIds: ['cat-ac'],
    areaIds: ['area-clifton-khi', 'area-gulshan-khi'],
    serviceAreas: [
      { areaName: 'Clifton', city: 'Karachi' },
      { areaName: 'Gulshan-e-Iqbal', city: 'Karachi' },
    ],
    cities: ['Karachi'],
    activeServiceCount: 3,
  },
  {
    id: 'prov-004',
    displayName: 'Hamza Tariq',
    businessName: '',
    photoURL: null,
    bio: 'Electrician with expertise in home wiring, UPS installation, solar panel setup and switchboard repairs. Serving Islamabad and surroundings.',
    phone: '0333-7778899',
    city: 'Islamabad',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.6,
    ratingCount: 67,
    minPrice: 600,
    categoryIds: ['cat-electrical'],
    areaIds: ['area-f8-isl', 'area-g11-isl'],
    serviceAreas: [
      { areaName: 'F-8', city: 'Islamabad' },
      { areaName: 'G-11', city: 'Islamabad' },
    ],
    cities: ['Islamabad'],
    activeServiceCount: 4,
  },
  {
    id: 'prov-005',
    displayName: 'Fatima Noor',
    businessName: 'BrightMinds Tutoring',
    photoURL: null,
    bio: 'MSc Mathematics from Punjab University. Teaching O-Level and A-Level maths and physics for 8 years. Home visits in DHA and Model Town.',
    phone: '0345-1112233',
    city: 'Lahore',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 5.0,
    ratingCount: 42,
    minPrice: 2000,
    categoryIds: ['cat-tutoring'],
    areaIds: ['area-dha-lhr', 'area-modeltown-lhr'],
    serviceAreas: [
      { areaName: 'DHA Phase 5', city: 'Lahore' },
      { areaName: 'Model Town', city: 'Lahore' },
    ],
    cities: ['Lahore'],
    activeServiceCount: 3,
  },
  {
    id: 'prov-006',
    displayName: 'Rizwan Malik',
    businessName: 'Malik Carpentry Works',
    photoURL: null,
    bio: 'Master carpenter specialising in custom furniture, kitchen cabinets, and door fitting. Using imported and local wood. 15 years experience.',
    phone: '0302-4445566',
    city: 'Faisalabad',
    isVerified: true,
    verificationStatus: 'verified',
    ratingAverage: 4.5,
    ratingCount: 55,
    minPrice: 1000,
    categoryIds: ['cat-carpentry'],
    areaIds: ['area-peoples-fsd', 'area-madina-fsd'],
    serviceAreas: [
      { areaName: 'Peoples Colony', city: 'Faisalabad' },
      { areaName: 'Madina Town', city: 'Faisalabad' },
    ],
    cities: ['Faisalabad'],
    activeServiceCount: 3,
  },
];

// ─── Reviews ────────────────────────────────────────────────────────────────
const now = Date.now();
const day = 86400000;
export const MOCK_REVIEWS = [
  {
    id: 'rev-001',
    providerId: 'prov-001',
    providerName: 'Usman Plumbing Solutions',
    customerId: 'cust-001',
    customerName: 'Ahmed Raza',
    rating: 5,
    comment: 'Usman bhai fixed our leaking kitchen pipe within an hour. Very professional and reasonable charges. Highly recommended!',
    serviceTitle: 'Pipe Repair',
    status: 'active',
    createdAt: new Date(now - 2 * day).toISOString(),
  },
  {
    id: 'rev-002',
    providerId: 'prov-002',
    providerName: 'SparkClean Services',
    customerId: 'cust-002',
    customerName: 'Sana Mahmood',
    rating: 5,
    comment: 'Absolutely amazing deep cleaning service. My apartment looks brand new! Their team was punctual, thorough and well-equipped.',
    serviceTitle: 'Deep Cleaning',
    status: 'active',
    createdAt: new Date(now - 3 * day).toISOString(),
  },
  {
    id: 'rev-003',
    providerId: 'prov-003',
    providerName: 'CoolTech AC Services',
    customerId: 'cust-003',
    customerName: 'Imran Sheikh',
    rating: 4,
    comment: 'Good AC servicing. Bilal was on time and explained everything clearly. The AC is running much cooler now. Will use again next summer.',
    serviceTitle: 'AC Servicing',
    status: 'active',
    createdAt: new Date(now - 5 * day).toISOString(),
  },
  {
    id: 'rev-004',
    providerId: 'prov-005',
    providerName: 'BrightMinds Tutoring',
    customerId: 'cust-004',
    customerName: 'Nadia Hussain',
    rating: 5,
    comment: 'Fatima ma\'am is an exceptional tutor. My son\'s O-Level maths grade improved from D to A* in just 4 months. She makes complex topics easy to understand.',
    serviceTitle: 'O-Level Maths',
    status: 'active',
    createdAt: new Date(now - 1 * day).toISOString(),
  },
  {
    id: 'rev-005',
    providerId: 'prov-004',
    providerName: 'Hamza Tariq',
    customerId: 'cust-005',
    customerName: 'Zubair Khan',
    rating: 5,
    comment: 'Hamza installed a complete UPS system at our home. Clean wiring, proper earthing and he even set up the automatic changeover. Very knowledgeable.',
    serviceTitle: 'UPS Installation',
    status: 'active',
    createdAt: new Date(now - 7 * day).toISOString(),
  },
  {
    id: 'rev-006',
    providerId: 'prov-006',
    providerName: 'Malik Carpentry Works',
    customerId: 'cust-006',
    customerName: 'Mehreen Akbar',
    rating: 4,
    comment: 'Got a custom wardrobe made by Rizwan. Beautiful finish and sturdy construction. Slightly delayed but the quality made up for it.',
    serviceTitle: 'Custom Wardrobe',
    status: 'active',
    createdAt: new Date(now - 4 * day).toISOString(),
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
  supportEmail: 'support@fixora.pk',
  supportPhone: '+92 51 111 3496',
  cancellationCutoffHours: 2,
  maxBookingsPerDay: 10,
};

// ─── Area facets ────────────────────────────────────────────────────────────
export const MOCK_AREA_FACETS = {
  provinces: ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad Capital Territory', 'AJK', 'Gilgit-Baltistan'],
  cities: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan', 'Quetta'],
};

// ─── Mock Areas for search ──────────────────────────────────────────────────
export const MOCK_AREAS = [
  { id: 'area-dha-lhr', areaName: 'DHA Phase 5', city: 'Lahore', district: 'Lahore', province: 'Punjab', postalCode: '54792' },
  { id: 'area-gulberg-lhr', areaName: 'Gulberg III', city: 'Lahore', district: 'Lahore', province: 'Punjab', postalCode: '54660' },
  { id: 'area-modeltown-lhr', areaName: 'Model Town', city: 'Lahore', district: 'Lahore', province: 'Punjab', postalCode: '54700' },
  { id: 'area-saddar-rwp', areaName: 'Saddar', city: 'Rawalpindi', district: 'Rawalpindi', province: 'Punjab', postalCode: '46000' },
  { id: 'area-bahria-rwp', areaName: 'Bahria Town', city: 'Rawalpindi', district: 'Rawalpindi', province: 'Punjab', postalCode: '46220' },
  { id: 'area-f8-isl', areaName: 'F-8', city: 'Islamabad', district: 'Islamabad', province: 'Islamabad Capital Territory', postalCode: '44000' },
  { id: 'area-g11-isl', areaName: 'G-11', city: 'Islamabad', district: 'Islamabad', province: 'Islamabad Capital Territory', postalCode: '44000' },
  { id: 'area-clifton-khi', areaName: 'Clifton', city: 'Karachi', district: 'Karachi South', province: 'Sindh', postalCode: '75600' },
  { id: 'area-gulshan-khi', areaName: 'Gulshan-e-Iqbal', city: 'Karachi', district: 'Karachi East', province: 'Sindh', postalCode: '75300' },
  { id: 'area-peoples-fsd', areaName: 'Peoples Colony', city: 'Faisalabad', district: 'Faisalabad', province: 'Punjab', postalCode: '38000' },
  { id: 'area-madina-fsd', areaName: 'Madina Town', city: 'Faisalabad', district: 'Faisalabad', province: 'Punjab', postalCode: '38090' },
  { id: 'area-hayatabad-psh', areaName: 'Hayatabad', city: 'Peshawar', district: 'Peshawar', province: 'KPK', postalCode: '25100' },
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
  'which areas': 'Fixora covers neighbourhoods and postal codes across Punjab, Sindh, KPK, Balochistan, Islamabad, AJK and Gilgit-Baltistan. Just enter your area name or 5-digit postal code to find local providers.',
  'how are providers verified': 'Every new provider starts as "pending" and is hidden from search. Our team reviews their profile, documents and qualifications. Once approved, they get a green ✓ Verified badge.',
  'can i cancel': 'Yes! You can cancel any booking for free up to 2 hours before the scheduled time. After that, a cancellation fee may apply depending on the provider\'s policy.',
  'how do payments work': 'Currently, Fixora supports cash payment. You pay the provider directly once the job is completed. Prices are shown upfront before you book.',
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
