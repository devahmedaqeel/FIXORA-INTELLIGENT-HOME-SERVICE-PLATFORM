import { notificationRepository, userRepository } from '../../repositories/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { nowIso } from '../../utils/time.js';
import { emailChannel } from './channels/email.channel.js';
import { smsChannel } from './channels/sms.channel.js';

/*
 * Reusable notification service.
 * 1. Persists an in-app notification in Firestore (always).
 * 2. Fans out to external channels (email/SMS) when configured.
 * Delivery failures are logged and never break the calling business operation.
 */

async function dispatchExternal(userId, { title, message }, channels) {
  if (!channels.length) return;
  const user = await userRepository.findById(userId);
  if (!user) return;
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
        logger.warn(`Notification channel ${channel.name} failed for ${userId}: ${error.message}`);
      }
    }),
  );
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
    dispatchExternal(userId, { title, message }, channels).catch(() => {});
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
