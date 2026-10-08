/*
 * Optional demo accounts (seeded only with `npm run seed:demo`).
 * All demo accounts share the password below — change or delete them before going live.
 * Areas are referenced as "City|Area name"; categories by name.
 *
 * Five providers below are hand-authored "flagship" profiles. The rest are generated from
 * templates so the marketplace has ~50 providers spread across every seeded city, with varied
 * prices, experience, verification status, ratings and review counts — not 50 identical clones.
 */
import { AREAS } from './areas.mjs';

export const DEMO_PASSWORD = 'Demo@12345';

export const DEMO_ADMIN = { email: 'admin@fixora.demo', displayName: 'Fixora Admin', phone: '03000000000' };

const HAND_AUTHORED_CUSTOMERS = [
  { key: 'ayesha', email: 'ayesha@fixora.demo', displayName: 'Ayesha Khan', phone: '03001234567', city: 'Mirpur', defaultArea: 'Mirpur|New Mirpur City' },
  { key: 'bilal', email: 'bilal@fixora.demo', displayName: 'Bilal Ahmed', phone: '03211234567', city: 'Lahore', defaultArea: 'Lahore|Gulberg III' },
];

const HAND_AUTHORED_PROVIDERS = [
  {
    key: 'usman',
    email: 'usman.plumber@fixora.demo',
    displayName: 'Usman Raza',
    businessName: 'Raza Plumbing Works',
    phone: '03451234567',
    bio: 'Licensed plumber with 12 years of experience in residential plumbing across Mirpur. Leak detection, geyser installation and bathroom fittings done right the first time.',
    experienceYears: 12,
    verificationStatus: 'verified',
    areas: ['Mirpur|New Mirpur City', 'Mirpur|Sector F-1', 'Mirpur|Sector F-3', 'Mirpur|Allama Iqbal Road'],
    services: [
      { category: 'Plumbing', title: 'Leak detection & repair', description: 'Find and fix leaking taps, pipes and joints.', price: 1500, pricingType: 'starting_from', duration: 60 },
      { category: 'Plumbing', title: 'Geyser installation', description: 'Gas or electric geyser installation with pipe fitting.', price: 3500, pricingType: 'fixed', duration: 120 },
      { category: 'Home Maintenance', title: 'Bathroom fittings', description: 'Install showers, mixers, commodes and accessories.', price: 1200, pricingType: 'hourly', duration: 60 },
    ],
  },
  {
    key: 'sana',
    email: 'sana.cleaning@fixora.demo',
    displayName: 'Sana Malik',
    businessName: 'SparkleHome Cleaning',
    phone: '03111234567',
    bio: 'Professional home cleaning team using safe, eco-friendly products. Deep cleaning, sofa shampooing and move-in/move-out cleans.',
    experienceYears: 6,
    verificationStatus: 'verified',
    areas: ['Mirpur|New Mirpur City', 'Mirpur|Sector D-4', 'Mirpur|Mian Muhammad'],
    services: [
      { category: 'Cleaning', title: 'Full home deep cleaning', description: 'Complete deep clean of a 3–5 room house.', price: 8000, pricingType: 'starting_from', duration: 240 },
      { category: 'Cleaning', title: 'Sofa shampooing', description: 'Per seat sofa shampoo and stain removal.', price: 700, pricingType: 'fixed', duration: 60 },
    ],
  },
  {
    key: 'hamza',
    email: 'hamza.electric@fixora.demo',
    displayName: 'Hamza Tariq',
    businessName: 'Tariq Electric & AC',
    phone: '03331234567',
    bio: 'Electrician and AC technician. Wiring, DB box upgrades, UPS installation and complete AC servicing.',
    experienceYears: 9,
    verificationStatus: 'verified',
    areas: ['Lahore|Gulberg III', 'Lahore|Model Town', 'Lahore|Johar Town', 'Lahore|Garden Town'],
    services: [
      { category: 'Electrical', title: 'Electrical fault finding', description: 'Diagnose and repair tripping, short circuits and faulty sockets.', price: 1000, pricingType: 'starting_from', duration: 60 },
      { category: 'AC Repair', title: 'AC general service', description: 'Indoor and outdoor unit cleaning, gas pressure check.', price: 2500, pricingType: 'fixed', duration: 90 },
      { category: 'AC Repair', title: 'AC gas refill', description: 'Leak check and refrigerant top-up.', price: 4500, pricingType: 'starting_from', duration: 90 },
    ],
  },
  {
    key: 'farah',
    email: 'farah.tutor@fixora.demo',
    displayName: 'Farah Siddiqui',
    businessName: '',
    phone: '03001112233',
    bio: 'MSc Mathematics. Home tutor for Matric, FSc and O/A Level Maths and Physics.',
    experienceYears: 8,
    verificationStatus: 'verified',
    areas: ['Islamabad|F-7', 'Islamabad|F-8', 'Islamabad|G-9', 'Islamabad|E-11'],
    services: [{ category: 'Tutoring', title: 'Maths & Physics tuition', description: 'One-to-one home tuition, per hour.', price: 2000, pricingType: 'hourly', duration: 60 }],
  },
  {
    key: 'kamran',
    email: 'kamran.pending@fixora.demo',
    displayName: 'Kamran Ali',
    businessName: 'Ali Laptop Clinic',
    phone: '03019998877',
    bio: 'Laptop chip-level repair and upgrades.',
    experienceYears: 4,
    verificationStatus: 'pending',
    areas: ['Karachi|Clifton', 'Karachi|DHA Karachi'],
    services: [{ category: 'Computer/Laptop Repair', title: 'Laptop diagnosis & repair', description: 'Hardware diagnosis, screen and keyboard replacement.', price: 1500, pricingType: 'starting_from', duration: 60 }],
  },
];

/** Past completed bookings with reviews for the hand-authored providers, so ratings show up. */
const HAND_AUTHORED_HISTORY = [
  { customer: 'ayesha', provider: 'usman', service: 'Leak detection & repair', dayOffset: -14, startTime: '10:00', rating: 5, comment: 'Arrived on time and fixed the kitchen leak quickly. Very professional.' },
  { customer: 'ayesha', provider: 'sana', service: 'Sofa shampooing', dayOffset: -9, startTime: '11:00', rating: 4, comment: 'Sofa looks new. Slightly late but great work.' },
  { customer: 'bilal', provider: 'hamza', service: 'AC general service', dayOffset: -20, startTime: '14:00', rating: 5, comment: 'AC is cooling much better now. Recommended!' },
  { customer: 'bilal', provider: 'hamza', service: 'Electrical fault finding', dayOffset: -6, startTime: '09:00', rating: 4, comment: 'Found the fault in the DB box. Fair price.' },
];

/* ------------------------------------------------------------------ */
/* Generated providers: spread remaining categories across every city  */
/* ------------------------------------------------------------------ */

const MALE_FIRST = ['Ahmed', 'Usman', 'Bilal', 'Hamza', 'Imran', 'Adeel', 'Shahzad', 'Waqar', 'Faisal', 'Zeeshan', 'Tariq', 'Asif', 'Naveed', 'Saqib', 'Rashid', 'Junaid', 'Umar', 'Noman', 'Sajid', 'Arslan', 'Fahad', 'Khalid', 'Rizwan', 'Danish', 'Shahbaz'];
const FEMALE_FIRST = ['Sana', 'Farah', 'Ayesha', 'Hina', 'Mehwish', 'Saba', 'Nida', 'Rabia', 'Amna', 'Iqra', 'Sidra', 'Mariam', 'Komal', 'Fatima', 'Zainab'];
const LAST_NAMES = ['Khan', 'Ali', 'Raza', 'Malik', 'Tariq', 'Siddiqui', 'Sheikh', 'Butt', 'Chaudhry', 'Baig', 'Qureshi', 'Hussain', 'Abbasi', 'Awan', 'Javed', 'Mahmood'];

/** One or two sample services per category. Prices scaled per provider so nobody is identical. */
const PROFESSION = {
  Plumbing: {
    businessSuffix: 'Plumbing Services',
    bioIntro: 'Professional plumber specialising in leak repairs, geyser installation and bathroom fittings.',
    services: [
      { title: 'Leak detection & repair', description: 'Find and fix leaking taps, pipes and joints.', price: 1200, pricingType: 'starting_from', duration: 60 },
      { title: 'Geyser installation', description: 'Gas or electric geyser installation with pipe fitting.', price: 3000, pricingType: 'fixed', duration: 120 },
    ],
  },
  Electrical: {
    businessSuffix: 'Electric Services',
    bioIntro: 'Licensed electrician for wiring, switchboard repair and UPS/inverter installation.',
    services: [
      { title: 'Electrical fault finding', description: 'Diagnose and repair tripping, short circuits and faulty sockets.', price: 1000, pricingType: 'starting_from', duration: 60 },
      { title: 'Fan & light installation', description: 'Ceiling fan, light fixture and switchboard installation.', price: 800, pricingType: 'fixed', duration: 45 },
    ],
  },
  Cleaning: {
    businessSuffix: 'Home Cleaning',
    bioIntro: 'Professional home cleaning using safe, eco-friendly products.',
    services: [
      { title: 'Full home deep cleaning', description: 'Complete deep clean of a 3–5 room house.', price: 7000, pricingType: 'starting_from', duration: 240 },
      { title: 'Kitchen deep cleaning', description: 'Degreasing and sanitising kitchen surfaces and cabinets.', price: 2500, pricingType: 'fixed', duration: 120 },
    ],
  },
  Barber: {
    businessSuffix: 'Grooming Services',
    bioIntro: 'Experienced barber offering haircuts, shaves and grooming at home.',
    services: [
      { title: 'Haircut at home', description: 'Professional haircut with styling.', price: 500, pricingType: 'fixed', duration: 30 },
      { title: 'Shave & grooming', description: 'Classic shave with facial grooming.', price: 400, pricingType: 'fixed', duration: 30 },
    ],
  },
  'Appliance Repair': {
    businessSuffix: 'Appliance Repair',
    bioIntro: 'Appliance technician repairing washing machines, fridges and microwaves.',
    services: [
      { title: 'Washing machine repair', description: 'Diagnosis and repair of top-load and front-load machines.', price: 1500, pricingType: 'starting_from', duration: 60 },
      { title: 'Refrigerator repair', description: 'Cooling issues, compressor and thermostat repair.', price: 2000, pricingType: 'starting_from', duration: 90 },
    ],
  },
  'AC Repair': {
    businessSuffix: 'AC & Refrigeration',
    bioIntro: 'AC technician for installation, gas refilling and inverter AC repair.',
    services: [
      { title: 'AC general service', description: 'Indoor and outdoor unit cleaning, gas pressure check.', price: 2200, pricingType: 'fixed', duration: 90 },
      { title: 'AC gas refill', description: 'Leak check and refrigerant top-up.', price: 4000, pricingType: 'starting_from', duration: 90 },
    ],
  },
  Carpentry: {
    businessSuffix: 'Carpenter Works',
    bioIntro: 'Skilled carpenter for furniture repair, door fitting and custom woodwork.',
    services: [
      { title: 'Furniture repair', description: 'Repair of chairs, tables, wardrobes and cabinets.', price: 1000, pricingType: 'starting_from', duration: 90 },
      { title: 'Door & lock fitting', description: 'Door installation, hinge and lock repair.', price: 1200, pricingType: 'fixed', duration: 60 },
    ],
  },
  Painting: {
    businessSuffix: 'Painter Services',
    bioIntro: 'Professional painter for interior and exterior walls, distemper and polish.',
    services: [
      { title: 'Room painting (per room)', description: 'Two coats of emulsion paint, walls and ceiling.', price: 6000, pricingType: 'starting_from', duration: 300 },
      { title: 'Wall texture & finish', description: 'Decorative wall texture and putty finish.', price: 4500, pricingType: 'starting_from', duration: 240 },
    ],
  },
  Tutoring: {
    businessSuffix: '',
    bioIntro: 'Home tutor for school and O/A Level students.',
    services: [
      { title: 'Maths & Science tuition', description: 'One-to-one home tuition, per hour.', price: 1800, pricingType: 'hourly', duration: 60 },
      { title: 'English & Language tuition', description: 'Reading, writing and grammar coaching.', price: 1500, pricingType: 'hourly', duration: 60 },
    ],
  },
  'Pest Control': {
    businessSuffix: 'Pest Control',
    bioIntro: 'Pest control technician for termite, cockroach and mosquito treatments.',
    services: [
      { title: 'General pest treatment', description: 'Cockroach, ant and mosquito spray treatment.', price: 3000, pricingType: 'starting_from', duration: 90 },
      { title: 'Termite treatment', description: 'Pre- and post-construction termite control.', price: 8000, pricingType: 'starting_from', duration: 180 },
    ],
  },
  'Home Maintenance': {
    businessSuffix: 'Home Maintenance',
    bioIntro: 'General handyman for fixtures, minor masonry and seasonal upkeep.',
    services: [
      { title: 'Handyman visit (hourly)', description: 'General repairs, fixture installation and small jobs.', price: 900, pricingType: 'hourly', duration: 60 },
      { title: 'Shelf & fixture mounting', description: 'Mount shelves, curtain rods and wall fixtures.', price: 700, pricingType: 'fixed', duration: 45 },
    ],
  },
  'Computer/Laptop Repair': {
    businessSuffix: 'Computer Repair',
    bioIntro: 'Computer technician for laptop and PC repair, upgrades and virus removal.',
    services: [
      { title: 'Laptop diagnosis & repair', description: 'Hardware diagnosis, screen and keyboard replacement.', price: 1500, pricingType: 'starting_from', duration: 60 },
      { title: 'Windows installation & setup', description: 'OS installation, driver and software setup.', price: 1200, pricingType: 'fixed', duration: 90 },
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
    price: Math.round((s.price * priceFactor) / 50) * 50,
    pricingType: s.pricingType,
    duration: s.duration,
  }));
  const key = `gen${i}`;
  const phone = `03${String(100000000 + i * 137).padStart(9, '0').slice(-9)}`;

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
  const phone = `03${String(200000000 + i * 211).padStart(9, '0').slice(-9)}`;
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
