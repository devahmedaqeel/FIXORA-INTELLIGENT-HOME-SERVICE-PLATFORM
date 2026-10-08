/*
 * Knowledge base for the Fixora assistant. FAQ answers work with no AI provider configured;
 * the AI provider (when available) only handles questions the FAQ cannot.
 * `roles` controls who sees an entry: guest | customer | provider | admin.
 */

const ALL = ['guest', 'customer', 'provider', 'admin'];
const CUSTOMERS = ['guest', 'customer'];
const PROVIDERS = ['guest', 'provider'];

export const FAQ_ENTRIES = [
  {
    id: 'register',
    roles: ALL,
    keywords: ['register', 'sign up', 'signup', 'create account', 'join', 'new account', 'open account'],
    answer:
      'To create an account, click "Sign up" at the top of the page, choose whether you are a Customer or a Service Provider, then enter your name, email and a password (at least 8 characters with a letter and a number). We will send a verification email — open it to confirm your address.',
    link: { label: 'Create an account', to: '/register' },
  },
  {
    id: 'login',
    roles: ALL,
    keywords: ['login', 'log in', 'sign in', 'signin', 'cannot login', "can't log in", 'forgot password', 'reset password', 'password'],
    answer:
      'Sign in with the email and password you registered with. If you forgot your password, choose "Forgot password?" on the sign-in page and we will email you a reset link.',
    link: { label: 'Reset password', to: '/forgot-password' },
  },
  {
    id: 'search',
    roles: CUSTOMERS,
    keywords: ['search', 'find', 'look for', 'looking for', 'plumber', 'electrician', 'near me', 'postal code', 'zip', 'area', 'locate'],
    answer:
      'Use the search bar on the home page: pick a service category (for example Plumbing), then either choose your area (like "New Mirpur City") or type your 5-digit postal code (like 10250). Only verified providers who serve that area are shown. You can then filter by rating, price and availability.',
    link: { label: 'Search services', to: '/search' },
  },
  {
    id: 'book',
    roles: CUSTOMERS,
    keywords: ['book', 'booking', 'appointment', 'schedule', 'hire', 'reserve', 'how do i book', 'make a booking'],
    answer:
      'To book: open a provider\'s profile, choose a service, pick a date, select one of the free time slots shown, then enter your address and any notes and confirm. The provider receives your request and confirms or declines it — you will be notified either way. Payment is cash to the provider after the job unless stated otherwise.',
    link: { label: 'Find a provider', to: '/search' },
  },
  {
    id: 'cancel',
    roles: CUSTOMERS,
    keywords: ['cancel', 'cancellation', 'refund', 'call off', 'reschedule'],
    answer:
      'Go to My Bookings, open the booking and choose "Cancel booking". Cancellations are free up to {cutoff} before the start time. After that a late-cancellation policy applies and you will see a warning before confirming. To reschedule, cancel and make a new booking for a different slot.',
    link: { label: 'My bookings', to: '/customer/bookings' },
  },
  {
    id: 'review',
    roles: CUSTOMERS,
    keywords: ['review', 'rate', 'rating', 'feedback', 'stars', 'leave a review'],
    answer:
      'Once a provider marks your booking as completed, you can rate them from 1 to 5 stars and add an optional comment. Open Reviews in your dashboard (or the completed booking) and choose "Write review". Each booking can be reviewed once.',
    link: { label: 'My reviews', to: '/customer/reviews' },
  },
  {
    id: 'payment',
    roles: ALL,
    keywords: ['pay', 'payment', 'cash', 'card', 'price', 'cost', 'charges', 'fee'],
    answer:
      'Prices are set by each provider and shown on their profile as fixed, "starting from", or hourly rates in PKR. By default you pay the provider in cash after the service. Any late-cancellation fee is shown before you confirm a cancellation.',
  },
  {
    id: 'verified',
    roles: ALL,
    keywords: ['verified', 'verification', 'trust', 'safe', 'badge', 'background check', 'approved'],
    answer:
      'Every provider is reviewed by the Fixora team before appearing in search. Verified providers show a green "Verified" badge. Providers who are pending, rejected or suspended are not visible to customers.',
  },
  {
    id: 'complaint',
    roles: ALL,
    keywords: ['complaint', 'complain', 'problem', 'issue', 'report', 'dispute', 'bad service', 'support', 'help', 'human', 'agent', 'contact'],
    answer:
      'Sorry you have had trouble. You can raise a complaint about a booking, provider, payment or the platform from Complaints in your dashboard; our support team reviews every ticket. You can also reach us via the Contact page.',
    link: { label: 'Contact support', to: '/contact' },
  },
  {
    id: 'become-provider',
    roles: PROVIDERS,
    keywords: ['become a provider', 'become provider', 'join as provider', 'offer services', 'work with fixora', 'list my business', 'sell services'],
    answer:
      'Sign up and choose "Service Provider". Complete your profile (photo, bio, phone, categories and service areas), upload any verification documents, and add your services. Our team will verify your account — once approved, customers in your areas can find and book you.',
    link: { label: 'Join as a provider', to: '/register?role=provider' },
  },
  {
    id: 'add-service',
    roles: ['provider'],
    keywords: ['add service', 'new service', 'create service', 'list service', 'edit service', 'remove service', 'delete service', 'service price', 'change price'],
    answer:
      'Go to Services in your provider dashboard and choose "Add service". Pick a category, give it a title and description, set the price and pricing type (fixed, starting from or hourly) and the duration. You can edit, deactivate or delete services from the same page.',
    link: { label: 'My services', to: '/provider/services' },
  },
  {
    id: 'availability',
    roles: ['provider'],
    keywords: ['availability', 'working hours', 'hours', 'schedule', 'day off', 'holiday', 'leave', 'time off', 'unavailable'],
    answer:
      'Open Availability in your dashboard. Turn each weekday on or off and set start/end times, then add specific dates you are unavailable (holidays, leave). Customers only see free slots inside your working hours, and the system prevents overlapping bookings automatically.',
    link: { label: 'Set availability', to: '/provider/availability' },
  },
  {
    id: 'manage-bookings',
    roles: ['provider'],
    keywords: ['accept', 'reject', 'decline', 'confirm booking', 'manage booking', 'booking request', 'complete booking', 'mark completed'],
    answer:
      'New requests appear under Bookings as "Pending". Open one to accept (confirm) or decline it. On the day, mark it "In progress" and then "Completed" once done — completed jobs count toward your earnings and let the customer review you.',
    link: { label: 'My bookings', to: '/provider/bookings' },
  },
  {
    id: 'update-profile',
    roles: ['provider', 'customer'],
    keywords: ['profile', 'update profile', 'edit profile', 'change name', 'profile photo', 'change phone', 'bio', 'service area', 'profile picture'],
    answer:
      'Open Profile in your dashboard to update your name, phone and photo. Providers can also edit their bio, categories, service areas and verification documents there.',
  },
  {
    id: 'pending-verification',
    roles: ['provider'],
    keywords: ['pending', 'not visible', 'not showing', 'why can\'t customers see', 'verification status', 'still pending', 'rejected'],
    answer:
      'New provider accounts stay hidden until the Fixora team verifies them. Make sure your profile has a photo, bio, phone number, at least one category and service area, and at least one service — complete profiles are reviewed faster. Your current status is shown on your dashboard.',
    link: { label: 'Complete my profile', to: '/provider/profile' },
  },
  {
    id: 'admin-help',
    roles: ['admin'],
    keywords: ['verify provider', 'approve provider', 'manage categories', 'manage areas', 'reports', 'settings', 'cutoff'],
    answer:
      'Admin tools: Provider Verification (approve/reject/suspend), Categories, Areas & postal codes, Bookings, Reviews, Complaints, Reports and Settings (including the cancellation cutoff) are all in the admin sidebar.',
    link: { label: 'Admin dashboard', to: '/admin/dashboard' },
  },
];

export const QUICK_REPLIES = {
  guest: ['How do I register?', 'How do I search?', 'How do I book?', 'Are providers verified?'],
  customer: ['What is my booking status?', 'How do I cancel?', 'How do I review a provider?', 'How do I book?'],
  provider: ['What are my earnings?', 'How do I add a service?', 'How do I change availability?', 'How do I manage bookings?'],
  admin: ['How many pending providers?', 'How many bookings?', 'Unanswered chatbot queries'],
};

export function buildSystemPrompt({ role, contextSummary, supportEmail }) {
  return [
    'You are the Fixora assistant for a home-services marketplace in Pakistan (plumbers, electricians, cleaners, AC repair, tutors, etc.).',
    'Customers search by service category and area or 5-digit postal code, book time slots with verified providers, cancel per policy, and review completed bookings.',
    'Providers manage profiles, services, prices, service areas, weekly availability and bookings. Admins verify providers and manage the platform.',
    `You are talking to a ${role}. Answer briefly (max 120 words), in the same language the user writes in.`,
    'Privacy rules: only use the account data given in CONTEXT, which belongs to the current user. Never reveal, guess or discuss other users\' personal data, bookings or earnings.',
    'Do not invent prices, providers, bookings or policies. If you cannot answer from what you know, reply with exactly: [UNRESOLVED]',
    `Human support: ${supportEmail} or the Contact page.`,
    contextSummary ? `CONTEXT:\n${contextSummary}` : 'CONTEXT: (user is not signed in)',
  ].join('\n');
}

export const UNRESOLVED_MARKER = '[UNRESOLVED]';
