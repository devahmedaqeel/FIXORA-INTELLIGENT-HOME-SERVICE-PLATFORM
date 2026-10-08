/*
 * Optional demo accounts (seeded only with `npm run seed:demo`).
 * All demo accounts share the password below — change or delete them before going live.
 * Areas are referenced as "City|Area name"; categories by name.
 */

export const DEMO_PASSWORD = 'Demo@12345';

export const DEMO_ADMIN = { email: 'admin@fixora.demo', displayName: 'Fixora Admin', phone: '03000000000' };

export const DEMO_CUSTOMERS = [
  { key: 'ayesha', email: 'ayesha@fixora.demo', displayName: 'Ayesha Khan', phone: '03001234567', city: 'Mirpur', defaultArea: 'Mirpur|New Mirpur City' },
  { key: 'bilal', email: 'bilal@fixora.demo', displayName: 'Bilal Ahmed', phone: '03211234567', city: 'Lahore', defaultArea: 'Lahore|Gulberg III' },
];

export const DEMO_PROVIDERS = [
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

/** Past completed bookings with reviews, so ratings show up in the demo. dayOffset < 0 = past. */
export const DEMO_HISTORY = [
  { customer: 'ayesha', provider: 'usman', service: 'Leak detection & repair', dayOffset: -14, startTime: '10:00', rating: 5, comment: 'Arrived on time and fixed the kitchen leak quickly. Very professional.' },
  { customer: 'ayesha', provider: 'sana', service: 'Sofa shampooing', dayOffset: -9, startTime: '11:00', rating: 4, comment: 'Sofa looks new. Slightly late but great work.' },
  { customer: 'bilal', provider: 'hamza', service: 'AC general service', dayOffset: -20, startTime: '14:00', rating: 5, comment: 'AC is cooling much better now. Recommended!' },
  { customer: 'bilal', provider: 'hamza', service: 'Electrical fault finding', dayOffset: -6, startTime: '09:00', rating: 4, comment: 'Found the fault in the DB box. Fair price.' },
];
