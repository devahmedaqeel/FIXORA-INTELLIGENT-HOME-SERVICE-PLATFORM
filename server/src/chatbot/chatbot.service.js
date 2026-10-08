import { chatbotQueryRepository } from '../repositories/index.js';
import { getSettings } from '../services/settings.service.js';
import { nowIso } from '../utils/time.js';
import { ROLES } from '../constants/index.js';
import { FAQ_ENTRIES, QUICK_REPLIES, UNRESOLVED_MARKER, buildSystemPrompt } from './chatbot.prompts.js';
import * as context from './chatbot.context.js';
import { getAiProvider } from './providers/aiProvider.js';

/*
 * Answer pipeline:
 *   1. Account-data intents (own bookings, own earnings, admin stats) — role-checked.
 *   2. FAQ knowledge base (works offline, no AI key needed).
 *   3. Configured AI provider with role-scoped context.
 *   4. Fallback: say we could not resolve it, suggest a help article, offer human support,
 *      and log the query as unresolved for admin review.
 * Every exchange is logged to the chatbotQueries collection.
 */

const DATA_INTENTS = [
  { id: 'booking_status', roles: [ROLES.CUSTOMER], pattern: /\b(booking|appointment|order)s?\b.*\b(status|update|confirmed|when)\b|\b(status|where)\b.*\b(booking|appointment)|\bmy (upcoming |next )?(booking|appointment)s?\b|\bnext (booking|appointment)\b/i, run: context.customerBookingStatus },
  { id: 'my_earnings', roles: [ROLES.PROVIDER], pattern: /\b(earning|earnings|income|revenue|how much (have i|did i) (made|make|earn))/i, run: context.providerEarnings },
  { id: 'my_bookings', roles: [ROLES.PROVIDER], pattern: /\b(pending|upcoming|new|my)\b.*\b(booking|job|request)s?\b|\bbooking requests?\b/i, run: context.providerBookingSummary },
  { id: 'pending_providers', roles: [ROLES.ADMIN], pattern: /\bpending providers?\b|\bproviders?\b.*\b(pending|awaiting|verification)\b|\bverification queue\b/i, run: context.adminPendingProviders },
  { id: 'booking_count', roles: [ROLES.ADMIN], pattern: /\bhow many bookings?\b|\btotal bookings?\b|\bbooking (count|stats|statistics)\b/i, run: context.adminBookingCounts },
  { id: 'unanswered_queries', roles: [ROLES.ADMIN], pattern: /\b(unanswered|unresolved)\b|\bchatbot quer/i, run: context.adminUnansweredQueries },
];

/** Intents that need an account; guests are asked to sign in instead. */
const GUEST_DATA_PATTERN = /\bmy (booking|appointment|earning|order)s?\b|\bbooking status\b|\bmy earnings?\b/i;

const normalize = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();

function scoreFaq(entry, message) {
  return entry.keywords.reduce((score, keyword) => {
    if (!message.includes(keyword)) return score;
    // Multi-word phrases are stronger signals than single words.
    return score + (keyword.includes(' ') ? 3 : 2);
  }, 0);
}

export function matchFaq(rawMessage, role) {
  const message = ` ${normalize(rawMessage)} `;
  const ranked = FAQ_ENTRIES.filter((e) => e.roles.includes(role))
    .map((entry) => ({ entry, score: scoreFaq(entry, message) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0] || null;
}

const formatCutoff = (minutes) => (minutes % 60 === 0 ? `${minutes / 60} hour(s)` : `${minutes} minutes`);

async function renderFaq(entry) {
  const settings = await getSettings();
  return entry.answer.replace('{cutoff}', formatCutoff(settings.bookingCancellationCutoffMinutes));
}

async function logQuery({ user, role, question, response, resolved, source, intent }) {
  return chatbotQueryRepository.create({
    userId: user?.uid || null,
    userRole: role,
    question,
    response,
    resolved,
    source,
    intent: intent || '',
    createdAt: nowIso(),
  });
}

/**
 * @param {object|null} user  authenticated user from middleware (null for guests)
 * @param {{ message: string, history?: Array<{role, content}> }} input
 */
export async function handleMessage(user, { message, history = [] }) {
  const role = user?.role || 'guest';
  const question = message.trim();
  let result = null;

  // 1. Personal data — always scoped to the authenticated user.
  if (user) {
    const intent = DATA_INTENTS.find((i) => i.roles.includes(role) && i.pattern.test(question));
    if (intent) {
      const answer = await intent.run(user);
      result = { reply: answer.text, links: answer.link ? [answer.link] : [], resolved: true, source: 'account', intent: intent.id };
    }
  } else if (GUEST_DATA_PATTERN.test(question)) {
    result = {
      reply: 'Please sign in so I can look up your own bookings or earnings. For your privacy I can only share account details with the signed-in account owner.',
      links: [{ label: 'Sign in', to: '/login' }],
      resolved: true,
      source: 'faq',
      intent: 'login_required',
    };
  }

  // 2. FAQ.
  const faq = matchFaq(question, role);
  if (!result && faq && faq.score >= 2) {
    result = {
      reply: await renderFaq(faq.entry),
      links: faq.entry.link ? [faq.entry.link] : [],
      resolved: true,
      source: 'faq',
      intent: faq.entry.id,
    };
  }

  // 3. AI provider.
  const settings = await getSettings();
  const ai = getAiProvider();
  if (!result && ai.isAvailable()) {
    const system = buildSystemPrompt({
      role,
      contextSummary: await context.buildAiContext(user),
      supportEmail: settings.supportEmail,
    });
    const messages = [...history.slice(-6), { role: 'user', content: question }];
    const text = await ai.generate({ system, messages });
    if (text && !text.includes(UNRESOLVED_MARKER)) {
      result = { reply: text, links: [], resolved: true, source: 'ai', intent: 'ai' };
    }
  }

  // 4. Fallback with help article + human support.
  if (!result) {
    const suggestion = faq?.entry;
    const parts = ["I'm sorry — I couldn't fully resolve that question."];
    if (suggestion) parts.push(`This help topic might be related: ${await renderFaq(suggestion)}`);
    parts.push(`If you need a person, contact our support team at ${settings.supportEmail} or ${settings.supportPhone}, or use the Contact page. I've logged your question so the team can improve my answers.`);
    result = {
      reply: parts.join('\n\n'),
      links: [...(suggestion?.link ? [suggestion.link] : []), { label: 'Contact support', to: '/contact' }],
      resolved: false,
      source: 'fallback',
      intent: suggestion?.id || '',
    };
  }

  const logged = await logQuery({ user, role, question, response: result.reply, resolved: result.resolved, source: result.source, intent: result.intent });

  return {
    queryId: logged.id,
    reply: result.reply,
    links: result.links,
    resolved: result.resolved,
    source: result.source,
    quickReplies: QUICK_REPLIES[role] || QUICK_REPLIES.guest,
  };
}

/** Conversation history for the signed-in user only. */
export async function getHistory(user) {
  const items = await chatbotQueryRepository.findByUser(user.uid, 30);
  return items
    .reverse()
    .map(({ id, question, response, resolved, createdAt }) => ({ id, question, response, resolved, createdAt }));
}

export const getQuickReplies = (user) => QUICK_REPLIES[user?.role || 'guest'];
