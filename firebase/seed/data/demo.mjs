/*
 * Optional demo accounts (seeded only with `npm run seed:demo`).
 * Most demo accounts share the password below — change or delete them before going live.
 * Three accounts use fixed, documented credentials for quick demo login (see FIXED_ACCOUNTS).
 * Areas are referenced as "City|Area name"; categories by name.
 *
 * A handful of providers below are hand-authored "flagship" profiles. The rest are generated
 * from templates so the marketplace has ~50 providers spread across every seeded UK city, with
 * varied prices, experience, verification status, ratings and review counts — not 50 clones.
 */
import { AREAS } from './areas.mjs';

export const DEMO_PASSWORD = 'Demo@12345';

/** Guaranteed, documented login credentials for quick demo access. */
export const FIXED_ACCOUNTS = {
  admin: { email: 'admin@fixora.com', password: 'Admin@123' },
  customer: { email: 'customer@fixora.com', password: 'Customer@123' },
  provider: { email: 'provider@fixora.com', password: 'Provider@123' },
};

export const DEMO_ADMIN = { email: FIXED_ACCOUNTS.admin.email, password: FIXED_ACCOUNTS.admin.password, displayName: 'Fixora Admin', phone: '02079460000' };

const HAND_AUTHORED_CUSTOMERS = [
  { key: 'james', email: FIXED_ACCOUNTS.customer.email, password: FIXED_ACCOUNTS.customer.password, displayName: 'James Wilson', phone: '07911123456', city: 'London', defaultArea: 'London|Westminster' },
  { key: 'emily', email: 'emily.smith@fixora.demo', displayName: 'Emily Smith', phone: '07700900123', city: 'Manchester', defaultArea: 'Manchester|City Centre' },
  { key: 'oliver', email: 'oliver.brown@fixora.demo', displayName: 'Oliver Brown', phone: '07700900456', city: 'Birmingham', defaultArea: 'Birmingham|City Centre' },
  { key: 'sophie', email: 'sophie.williams@fixora.demo', displayName: 'Sophie Williams', phone: '07700900789', city: 'Edinburgh', defaultArea: 'Edinburgh|Old Town' },
];

const HAND_AUTHORED_PROVIDERS = [
  {
    key: 'daniel',
    email: FIXED_ACCOUNTS.provider.email,
    password: FIXED_ACCOUNTS.provider.password,
    displayName: 'Daniel Harris',
    businessName: 'London Plumbing Experts',
    phone: '02079460958',
    bio: 'Gas Safe registered plumber with 14 years of experience across London. Leak detection, boiler servicing and bathroom installations done right the first time.',
    experienceYears: 14,
    verificationStatus: 'verified',
    areas: ['London|Westminster', 'London|Camden', 'London|Islington', 'London|Kensington'],
    services: [
      { category: 'Plumbing', title: 'Leak detection & repair', description: 'Find and fix leaking taps, pipes and joints.', price: 70, pricingType: 'starting_from', duration: 60 },
      { category: 'Heating & Boiler Repair', title: 'Boiler service', description: 'Annual boiler service and safety check.', price: 90, pricingType: 'fixed', duration: 60 },
      { category: 'Bathroom & Kitchen Fitting', title: 'Bathroom fitting', description: 'Full bathroom suite installation.', price: 600, pricingType: 'starting_from', duration: 480 },
    ],
  },
  {
    key: 'hannah',
    email: 'hannah.clean@fixora.demo',
    displayName: 'Hannah Taylor',
    businessName: 'West London Cleaning Co.',
    phone: '07700900234',
    bio: 'Professional home cleaning team using eco-friendly products. Deep cleaning, end-of-tenancy and regular cleans across west London.',
    experienceYears: 6,
    verificationStatus: 'verified',
    areas: ['London|Kensington', 'London|Camden', 'London|Canary Wharf'],
    services: [
      { category: 'Cleaning', title: 'Regular home clean', description: 'Weekly or fortnightly home cleaning.', price: 60, pricingType: 'starting_from', duration: 120 },
      { category: 'Deep Cleaning', title: 'End-of-tenancy deep clean', description: 'Full deep clean for moving in or out.', price: 150, pricingType: 'starting_from', duration: 240 },
    ],
  },
  {
    key: 'liam',
    email: 'liam.electric@fixora.demo',
    displayName: 'Liam Walker',
    businessName: 'Manchester Electrical Services',
    phone: '01611234567',
    bio: 'NICEIC-registered electrician covering Greater Manchester. Rewiring, consumer unit upgrades and fault finding.',
    experienceYears: 10,
    verificationStatus: 'verified',
    areas: ['Manchester|City Centre', 'Manchester|Northern Quarter', 'Manchester|Didsbury'],
    services: [
      { category: 'Electrical', title: 'Electrical fault finding', description: 'Diagnose and repair tripping, short circuits and faulty sockets.', price: 65, pricingType: 'starting_from', duration: 60 },
      { category: 'Electrical', title: 'Consumer unit upgrade', description: 'Fuse box replacement to current safety standard.', price: 350, pricingType: 'fixed', duration: 180 },
    ],
  },
  {
    key: 'grace',
    email: 'grace.tutor@fixora.demo',
    displayName: 'Grace Campbell',
    businessName: '',
    phone: '01311234567',
    bio: 'MSc Mathematics, Edinburgh. Home tutor for GCSE and A-Level maths and physics for 9 years.',
    experienceYears: 9,
    verificationStatus: 'verified',
    areas: ['Edinburgh|Old Town', 'Edinburgh|Leith'],
    services: [{ category: 'Tutoring', title: 'Maths & Physics tuition', description: 'One-to-one home tuition, per hour.', price: 30, pricingType: 'hourly', duration: 60 }],
  },
  {
    key: 'ryan',
    email: 'ryan.pending@fixora.demo',
    displayName: 'Ryan Murphy',
    businessName: 'Belfast Home Repairs',
    phone: '02890246609',
    bio: 'General handyman and small repairs across Belfast.',
    experienceYears: 3,
    verificationStatus: 'pending',
    areas: ['Belfast|City Centre', 'Belfast|Stranmillis'],
    services: [{ category: 'Handyman', title: 'General handyman visit', description: 'Small repairs and fixture installation.', price: 45, pricingType: 'hourly', duration: 60 }],
  },
];

/** Past completed bookings with reviews for the hand-authored providers, so ratings show up. */
const HAND_AUTHORED_HISTORY = [
  { customer: 'james', provider: 'daniel', service: 'Leak detection & repair', dayOffset: -14, startTime: '10:00', rating: 5, comment: 'Arrived on time and fixed the kitchen leak quickly. Very professional.' },
  { customer: 'james', provider: 'hannah', service: 'End-of-tenancy deep clean', dayOffset: -9, startTime: '11:00', rating: 4, comment: 'Flat looked brand new. Slightly late but great work.' },
  { customer: 'emily', provider: 'liam', service: 'Electrical fault finding', dayOffset: -20, startTime: '14:00', rating: 5, comment: 'Found the fault in minutes. Highly recommended!' },
  { customer: 'emily', provider: 'liam', service: 'Consumer unit upgrade', dayOffset: -6, startTime: '09:00', rating: 4, comment: 'Clean job, explained everything clearly.' },
];

/* ------------------------------------------------------------------ */
/* Generated providers: spread remaining categories across every city  */
/* ------------------------------------------------------------------ */

const MALE_FIRST = ['Jack', 'Thomas', 'George', 'Harry', 'Jacob', 'Charlie', 'Oscar', 'Leo', 'Freddie', 'Alfie', 'Henry', 'Joshua', 'Ethan', 'Lucas', 'Mason', 'Logan', 'Finlay', 'Rhys', 'Callum', 'Connor', 'Aaron', 'Dylan', 'Ewan', 'Owen', 'Declan'];
const FEMALE_FIRST = ['Olivia', 'Amelia', 'Isla', 'Ava', 'Mia', 'Isabella', 'Sophia', 'Grace', 'Lily', 'Freya', 'Poppy', 'Charlotte', 'Evie', 'Ruby', 'Erin', 'Niamh', 'Aoife', 'Ffion', 'Megan', 'Catrin'];
const LAST_NAMES = ['Smith', 'Jones', 'Taylor', 'Williams', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts', 'Walker', 'Robinson', 'Wright', 'Thompson', 'White', 'Edwards', 'Green', 'Murphy', 'Campbell', 'Stewart', 'Morrison', 'Reid', 'Kelly', 'Doyle'];

/** One or two sample services per category, priced in GBP. Prices scaled per provider so nobody is identical. */
const PROFESSION = {
  Plumbing: {
    businessSuffix: 'Plumbing Services',
    bioIntro: 'Professional plumber specialising in leak repairs, boiler-related plumbing and bathroom fittings.',
    services: [
      { title: 'Leak detection & repair', description: 'Find and fix leaking taps, pipes and joints.', price: 70, pricingType: 'starting_from', duration: 60 },
      { title: 'Tap & toilet installation', description: 'Supply and fit taps, toilets and basins.', price: 90, pricingType: 'fixed', duration: 90 },
    ],
  },
  Electrical: {
    businessSuffix: 'Electrical Services',
    bioIntro: 'NICEIC-registered electrician for wiring, sockets and consumer unit upgrades.',
    services: [
      { title: 'Electrical fault finding', description: 'Diagnose and repair tripping, short circuits and faulty sockets.', price: 65, pricingType: 'starting_from', duration: 60 },
      { title: 'Socket & lighting installation', description: 'Additional sockets, switches and light fittings.', price: 55, pricingType: 'fixed', duration: 45 },
    ],
  },
  'Heating & Boiler Repair': {
    businessSuffix: 'Heating & Gas Services',
    bioIntro: 'Gas Safe registered engineer for boiler servicing, repairs and central heating faults.',
    services: [
      { title: 'Boiler service', description: 'Annual boiler service and safety check.', price: 85, pricingType: 'fixed', duration: 60 },
      { title: 'Boiler repair', description: 'Diagnose and fix boiler breakdowns and heating faults.', price: 110, pricingType: 'starting_from', duration: 90 },
    ],
  },
  Cleaning: {
    businessSuffix: 'Cleaning Services',
    bioIntro: 'Professional home cleaning using eco-friendly products.',
    services: [
      { title: 'Regular home clean', description: 'Weekly or fortnightly home cleaning.', price: 55, pricingType: 'starting_from', duration: 120 },
      { title: 'One-off home clean', description: 'Single thorough clean of the whole home.', price: 75, pricingType: 'fixed', duration: 150 },
    ],
  },
  'Deep Cleaning': {
    businessSuffix: 'Deep Cleaning Services',
    bioIntro: 'Intensive deep cleans for kitchens, bathrooms and end-of-tenancy moves.',
    services: [
      { title: 'End-of-tenancy deep clean', description: 'Full deep clean for moving in or out.', price: 140, pricingType: 'starting_from', duration: 240 },
      { title: 'Kitchen deep clean', description: 'Degreasing and sanitising kitchen surfaces and appliances.', price: 90, pricingType: 'fixed', duration: 120 },
    ],
  },
  Gardening: {
    businessSuffix: 'Gardening Services',
    bioIntro: 'Reliable gardener for lawn care, hedge trimming and garden tidy-ups.',
    services: [
      { title: 'Garden tidy-up', description: 'Lawn mowing, weeding and hedge trimming.', price: 50, pricingType: 'starting_from', duration: 90 },
      { title: 'Lawn mowing (regular)', description: 'Fortnightly lawn mowing and edging.', price: 35, pricingType: 'fixed', duration: 45 },
    ],
  },
  Handyman: {
    businessSuffix: 'Handyman Services',
    bioIntro: 'General handyman for repairs, fixture installation and odd jobs around the home.',
    services: [
      { title: 'General handyman visit', description: 'Small repairs and fixture installation.', price: 40, pricingType: 'hourly', duration: 60 },
      { title: 'Furniture assembly', description: 'Flat-pack furniture assembly and fitting.', price: 45, pricingType: 'fixed', duration: 60 },
    ],
  },
  Carpentry: {
    businessSuffix: 'Carpentry Services',
    bioIntro: 'Skilled carpenter for furniture repair, fitted wardrobes and custom woodwork.',
    services: [
      { title: 'Furniture repair', description: 'Repair of chairs, tables, wardrobes and cabinets.', price: 60, pricingType: 'starting_from', duration: 90 },
      { title: 'Door fitting', description: 'Internal door supply and fitting.', price: 80, pricingType: 'fixed', duration: 90 },
    ],
  },
  'Painting & Decorating': {
    businessSuffix: 'Painting & Decorating',
    bioIntro: 'Professional decorator for interior and exterior painting and wallpapering.',
    services: [
      { title: 'Room painting (per room)', description: 'Two coats of emulsion, walls and ceiling.', price: 180, pricingType: 'starting_from', duration: 300 },
      { title: 'Wallpapering (per room)', description: 'Wallpaper hanging and wall preparation.', price: 150, pricingType: 'starting_from', duration: 240 },
    ],
  },
  Roofing: {
    businessSuffix: 'Roofing Services',
    bioIntro: 'Experienced roofer for repairs, re-tiling and guttering.',
    services: [
      { title: 'Roof repair', description: 'Fix leaks, loose tiles and flashing.', price: 150, pricingType: 'starting_from', duration: 120 },
      { title: 'Gutter cleaning & repair', description: 'Clear blockages and fix guttering.', price: 90, pricingType: 'fixed', duration: 90 },
    ],
  },
  Locksmith: {
    businessSuffix: 'Locksmith Services',
    bioIntro: '24-hour locksmith for lockouts, lock changes and UPVC door repairs.',
    services: [
      { title: 'Emergency lockout', description: 'Non-destructive entry and lock repair.', price: 70, pricingType: 'starting_from', duration: 45 },
      { title: 'Lock change', description: 'Supply and fit new door locks.', price: 60, pricingType: 'fixed', duration: 45 },
    ],
  },
  'Appliance Repair': {
    businessSuffix: 'Appliance Repair',
    bioIntro: 'Appliance engineer repairing washing machines, fridges, ovens and dishwashers.',
    services: [
      { title: 'Washing machine repair', description: 'Diagnosis and repair of washing machines.', price: 75, pricingType: 'starting_from', duration: 60 },
      { title: 'Oven & cooker repair', description: 'Diagnosis and repair of ovens and cookers.', price: 80, pricingType: 'starting_from', duration: 60 },
    ],
  },
  'Bathroom & Kitchen Fitting': {
    businessSuffix: 'Bathroom & Kitchen Fitting',
    bioIntro: 'Full bathroom and kitchen installation and refits.',
    services: [
      { title: 'Bathroom fitting', description: 'Full bathroom suite installation.', price: 650, pricingType: 'starting_from', duration: 480 },
      { title: 'Kitchen fitting', description: 'Full kitchen units and worktop installation.', price: 900, pricingType: 'starting_from', duration: 600 },
    ],
  },
  'Pest Control': {
    businessSuffix: 'Pest Control',
    bioIntro: 'Pest control technician for mice, wasps, rats and other household pests.',
    services: [
      { title: 'General pest treatment', description: 'Treatment for mice, ants and common household pests.', price: 90, pricingType: 'starting_from', duration: 60 },
      { title: 'Wasp nest removal', description: 'Safe removal of wasp and hornet nests.', price: 70, pricingType: 'fixed', duration: 45 },
    ],
  },
  'Moving & Removals': {
    businessSuffix: 'Removals',
    bioIntro: 'Man-and-van removals for flats, houses and single-item moves.',
    services: [
      { title: 'Man and van (half day)', description: 'Van and driver for local moves, half day.', price: 180, pricingType: 'starting_from', duration: 240 },
      { title: 'Single item delivery', description: 'Collection and delivery of a single large item.', price: 60, pricingType: 'fixed', duration: 90 },
    ],
  },
  Tutoring: {
    businessSuffix: '',
    bioIntro: 'Home tutor for GCSE, A-Level and primary school subjects.',
    services: [
      { title: 'Maths & Science tuition', description: 'One-to-one home tuition, per hour.', price: 28, pricingType: 'hourly', duration: 60 },
      { title: 'English tuition', description: 'Reading, writing and grammar coaching.', price: 25, pricingType: 'hourly', duration: 60 },
    ],
  },
  'Beauty & Salon': {
    businessSuffix: 'Hair & Beauty',
    bioIntro: 'Mobile hairdresser and beauty therapist, visiting clients at home.',
    services: [
      { title: "Haircut at home", description: 'Wash, cut and style.', price: 35, pricingType: 'fixed', duration: 60 },
      { title: 'Manicure', description: 'Nail shaping, cuticle care and polish.', price: 25, pricingType: 'fixed', duration: 45 },
    ],
  },
};

const CATEGORY_NAMES = Object.keys(PROFESSION);

const CITY_AREAS = AREAS.reduce((acc, a) => {
  (acc[a.city] ||= []).push(a.areaName);
  return acc;
}, {});
const CITY_LIST = Object.keys(CITY_AREAS);

const pick = (list, i) => list[((i % list.length) + list.length) % list.length];

/** Mostly verified, with a handful pending/rejected/suspended so the admin screens have real examples. */
function verificationFor(i) {
  const m = i % 20;
  if (m === 19) return 'suspended';
  if (m === 18) return 'rejected';
  if (m === 9 || m === 16) return 'pending';
  return 'verified';
}

const GENERATED_PROVIDER_COUNT = 45;

const GENERATED_PROVIDERS = Array.from({ length: GENERATED_PROVIDER_COUNT }, (_, i) => {
  const category = pick(CATEGORY_NAMES, i);
  const city = pick(CITY_LIST, i);
  const areaNames = CITY_AREAS[city];
  const areaCount = Math.min(areaNames.length, 2 + (i % 3));
  const chosenAreas = Array.from({ length: areaCount }, (_, k) => `${city}|${pick(areaNames, i + k)}`);
  const isFemale = i % 4 === 1;
  const first = pick(isFemale ? FEMALE_FIRST : MALE_FIRST, i);
  const last = pick(LAST_NAMES, i + 3);
  const displayName = `${first} ${last}`;
  const template = PROFESSION[category];
  const businessName = template.businessSuffix ? `${last} ${template.businessSuffix}` : '';
  const experienceYears = 1 + ((i * 3 + 5) % 18);
  const priceFactor = 0.8 + (i % 5) * 0.1;
  const services = template.services.map((s) => ({
    category,
    title: s.title,
    description: s.description,
    price: Math.max(10, Math.round((s.price * priceFactor) / 5) * 5),
    pricingType: s.pricingType,
    duration: s.duration,
  }));
  const key = `gen${i}`;
  const phone = `07${String(700000000 + i * 137).padStart(9, '0').slice(-9)}`;

  return {
    key,
    email: `${key}@fixora.demo`,
    displayName,
    businessName,
    phone,
    bio: `${template.bioIntro} ${experienceYears} years of experience serving ${city} and nearby areas.`,
    experienceYears,
    verificationStatus: verificationFor(i),
    areas: chosenAreas,
    services,
  };
});

/* ------------------------------------------------------------------ */
/* Generated customers: enough distinct reviewers for varied review sets */
/* ------------------------------------------------------------------ */

const GENERATED_CUSTOMER_COUNT = 10;

const GENERATED_CUSTOMERS = Array.from({ length: GENERATED_CUSTOMER_COUNT }, (_, i) => {
  const isFemale = i % 2 === 0;
  const first = pick(isFemale ? FEMALE_FIRST : MALE_FIRST, i + 7);
  const last = pick(LAST_NAMES, i + 11);
  const city = pick(CITY_LIST, i * 3 + 1);
  const areaNames = CITY_AREAS[city];
  const key = `cust${i}`;
  const phone = `07${String(800000000 + i * 211).padStart(9, '0').slice(-9)}`;
  return {
    key,
    email: `${key}@fixora.demo`,
    displayName: `${first} ${last}`,
    phone,
    city,
    defaultArea: `${city}|${pick(areaNames, i)}`,
  };
});

export const DEMO_CUSTOMERS = [...HAND_AUTHORED_CUSTOMERS, ...GENERATED_CUSTOMERS];
export const DEMO_PROVIDERS = [...HAND_AUTHORED_PROVIDERS, ...GENERATED_PROVIDERS];

/* ------------------------------------------------------------------ */
/* Generated review history for generated providers                   */
/* ------------------------------------------------------------------ */

const RATING_TARGETS = [4.2, 4.4, 4.6, 4.7, 4.8, 4.9, 4.3, 4.5];
const REVIEW_COUNTS = [2, 2, 3, 3, 4, 4, 5, 6, 7, 9];
const START_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const COMMENTS = [
  'Arrived on time and did a great job.',
  'Very professional and explained everything clearly.',
  'Good work, fair price.',
  'Would book again. Highly recommended.',
  'Solved the issue quickly and cleanly.',
  'Polite and skilled. No complaints.',
  'Slightly late but the work was excellent.',
  'Reasonable pricing and clean work.',
];

/** Spreads individual ratings around a target average rather than giving everyone a flat 5. */
function ratingsAround(target, count) {
  const base = Math.round(target);
  return Array.from({ length: count }, (_, k) => {
    const variant = k % 5;
    if (variant === 0) return Math.min(5, base + 1);
    if (variant === 4 && base > 3) return base - 1;
    return base;
  });
}

let dayCounter = 3;

function historyFor(provider, idx) {
  if (provider.verificationStatus !== 'verified') return [];
  const count = pick(REVIEW_COUNTS, idx);
  const ratings = ratingsAround(pick(RATING_TARGETS, idx), count);
  return ratings.map((rating, k) => {
    const customer = pick(DEMO_CUSTOMERS, idx + k);
    const service = provider.services[k % provider.services.length];
    dayCounter += 1 + ((idx + k) % 4);
    return {
      customer: customer.key,
      provider: provider.key,
      service: service.title,
      dayOffset: -dayCounter,
      startTime: pick(START_TIMES, idx + k),
      rating,
      comment: pick(COMMENTS, idx + k),
    };
  });
}

const GENERATED_HISTORY = GENERATED_PROVIDERS.flatMap((p, i) => historyFor(p, i));

export const DEMO_HISTORY = [...HAND_AUTHORED_HISTORY, ...GENERATED_HISTORY];
