import { bookingRepository, providerRepository, chatbotQueryRepository } from '../repositories/index.js';
import { getDashboardStats } from '../services/admin.service.js';
import { todayLocal } from '../utils/time.js';
import { ACTIVE_BOOKING_STATUSES, BOOKING_STATUS, ROLES } from '../constants/index.js';

/*
 * Data the assistant may use. EVERY function takes the authenticated user object built by
 * auth middleware (req.user) — never an ID from the request — so a user can only ever
 * retrieve their own records.
 */

const pkr = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;
const label = (status) => status.replace('_', ' ');

export async function customerBookingStatus(user) {
  const bookings = await bookingRepository.findByCustomer(user.uid);
  if (!bookings.length) return { text: 'You have no bookings yet. Search for a service to make your first booking.', link: { label: 'Search services', to: '/search' } };

  const today = todayLocal();
  const upcoming = bookings
    .filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status) && b.bookingDate >= today)
    .sort((a, b) => `${a.bookingDate}${a.startTime}`.localeCompare(`${b.bookingDate}${b.startTime}`));

  if (!upcoming.length) {
    const latest = bookings[0];
    return {
      text: `You have no upcoming bookings. Your most recent booking — ${latest.serviceTitle} with ${latest.providerName} on ${latest.bookingDate} — is ${label(latest.status)}.`,
      link: { label: 'My bookings', to: '/customer/bookings' },
    };
  }
  const lines = upcoming.slice(0, 3).map((b) => `• ${b.serviceTitle} with ${b.providerName} — ${b.bookingDate} at ${b.startTime}: ${label(b.status)}`);
  return {
    text: `You have ${upcoming.length} upcoming booking(s):\n${lines.join('\n')}`,
    link: { label: 'View my bookings', to: '/customer/bookings' },
  };
}

export async function providerEarnings(user) {
  const bookings = await bookingRepository.findByProvider(user.uid);
  const completed = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
  const month = todayLocal().slice(0, 7);
  const total = completed.reduce((s, b) => s + (Number(b.price) || 0), 0);
  const thisMonth = completed.filter((b) => b.bookingDate.startsWith(month)).reduce((s, b) => s + (Number(b.price) || 0), 0);
  return {
    text: `You have earned ${pkr(total)} from ${completed.length} completed job(s), including ${pkr(thisMonth)} this month.`,
    link: { label: 'Earnings details', to: '/provider/earnings' },
  };
}

export async function providerBookingSummary(user) {
  const bookings = await bookingRepository.findByProvider(user.uid);
  const today = todayLocal();
  const pending = bookings.filter((b) => b.status === BOOKING_STATUS.PENDING);
  const upcoming = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED && b.bookingDate >= today);
  return {
    text: `You have ${pending.length} pending request(s) waiting for your response and ${upcoming.length} confirmed upcoming booking(s).`,
    link: { label: 'Manage bookings', to: '/provider/bookings' },
  };
}

export async function adminPendingProviders() {
  const { stats } = await getDashboardStats();
  return { text: `There are ${stats.pendingProviders} provider(s) waiting for verification.`, link: { label: 'Review providers', to: '/admin/provider-verification' } };
}

export async function adminBookingCounts() {
  const { stats } = await getDashboardStats();
  return {
    text: `Bookings: ${stats.totalBookings} total — ${stats.pendingBookings} pending, ${stats.completedBookings} completed, ${stats.cancelledBookings} cancelled.`,
    link: { label: 'Manage bookings', to: '/admin/bookings' },
  };
}

export async function adminUnansweredQueries() {
  const unresolved = await chatbotQueryRepository.findAll({ resolved: false });
  const sample = unresolved.slice(0, 3).map((q) => `• "${q.question.slice(0, 80)}"`);
  return {
    text: `There are ${unresolved.length} unanswered chatbot quer${unresolved.length === 1 ? 'y' : 'ies'}.${sample.length ? `\nMost recent:\n${sample.join('\n')}` : ''}`,
    link: { label: 'Review queries', to: '/admin/chatbot-queries' },
  };
}

/** Compact, role-scoped summary handed to the AI provider. Contains only the user's own data. */
export async function buildAiContext(user) {
  if (!user) return '';
  const lines = [`Name: ${user.displayName || 'User'}`, `Role: ${user.role}`];
  if (user.role === ROLES.CUSTOMER) {
    lines.push((await customerBookingStatus(user)).text);
  }
  if (user.role === ROLES.PROVIDER) {
    const provider = await providerRepository.findById(user.uid);
    lines.push(`Verification status: ${provider?.verificationStatus || 'unknown'}`);
    lines.push((await providerBookingSummary(user)).text);
    lines.push((await providerEarnings(user)).text);
  }
  if (user.role === ROLES.ADMIN) {
    lines.push((await adminPendingProviders()).text, (await adminBookingCounts()).text);
  }
  return lines.join('\n');
}
