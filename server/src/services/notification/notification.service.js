import { notificationRepository, userRepository } from '../../repositories/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { nowIso } from '../../utils/time.js';
import { emailChannel } from './channels/email.channel.js';
import { smsChannel } from './channels/sms.channel.js';
import { DEFAULT_NOTIFICATION_PREFERENCES, NOTIFICATION_TYPE_CATEGORY } from '../../constants/index.js';

/*
 * Reusable notification service.
 * 1. Persists an in-app notification in Firestore (always).
 * 2. Fans out to external channels (email/SMS) when configured.
 * Delivery failures are logged and never break the calling business operation.
 */

async function dispatchExternal(user, { title, message }, channels) {
  if (!user || !channels.length) return;
  await Promise.all(
    channels.map(async (channel) => {
      try {
        if (!channel.isEnabled()) return;
        if (channel.name === 'email' && user.email) {
          await channel.send({ to: user.email, subject: `Fixora: ${title}`, text: message });
        }
        if (channel.name === 'sms' && user.phone) {
          await channel.send({ to: user.phone, text: `Fixora: ${message}` });
        }
      } catch (error) {
        logger.warn(`Notification channel ${channel.name} failed for ${user.id}: ${error.message}`);
      }
    }),
  );
}

/**
 * Looks up the recipient's notification preferences and decides what, if anything, to send
 * externally: the notification's category must be enabled, then each channel is filtered by
 * its own opt-in (email defaults on, SMS defaults off).
 */
async function dispatchRespectingPreferences(userId, type, { title, message }, channels) {
  const user = await userRepository.findById(userId).catch(() => null);
  if (!user) return;
  const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(user.notificationPreferences || {}) };
  const category = NOTIFICATION_TYPE_CATEGORY[type];
  if (category && prefs[category] === false) return;
  const allowedChannels = channels.filter((channel) =>
    channel.name === 'email' ? prefs.emailEnabled !== false : channel.name === 'sms' ? prefs.smsEnabled === true : true,
  );
  await dispatchExternal(user, { title, message }, allowedChannels);
}

export async function notify(userId, { type, title, message, link = '', data = {} }, { channels = [emailChannel] } = {}) {
  if (!userId) return null;
  try {
    const notification = await notificationRepository.create({
      userId,
      type,
      title,
      message,
      link,
      data,
      read: false,
      createdAt: nowIso(),
    });
    // External delivery is fire-and-forget so API latency is unaffected.
    dispatchRespectingPreferences(userId, type, { title, message }, channels).catch(() => {});
    return notification;
  } catch (error) {
    logger.warn(`Failed to store notification for ${userId}: ${error.message}`);
    return null;
  }
}

export const notifyWithSms = (userId, payload) => notify(userId, payload, { channels: [emailChannel, smsChannel] });

export async function listForUser(userId) {
  const items = await notificationRepository.findByUser(userId, 100);
  return { items, unreadCount: items.filter((n) => !n.read).length };
}

export async function markRead(userId, notificationId) {
  const notification = await notificationRepository.findById(notificationId);
  if (!notification || notification.userId !== userId) throw ApiError.notFound('Notification not found');
  return notificationRepository.update(notificationId, { read: true, readAt: nowIso() });
}

export async function markAllRead(userId) {
  const unread = await notificationRepository.findUnread(userId);
  const readAt = nowIso();
  await Promise.all(unread.map((n) => notificationRepository.update(n.id, { read: true, readAt })));
  return { updated: unread.length };
}
