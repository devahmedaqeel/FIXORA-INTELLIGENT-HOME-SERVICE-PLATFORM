import { messageRepository } from '../repositories/index.js';
import { getBookingForUser } from './booking.service.js';
import * as notificationService from './notification/notification.service.js';
import { ApiError } from '../utils/ApiError.js';
import { nowIso } from '../utils/time.js';
import { NOTIFICATION_TYPES, ROLES } from '../constants/index.js';

/*
 * Customer <-> provider messaging, scoped to a booking.
 * Authorization is inherited from getBookingForUser (customer/provider participant or admin).
 */

const sortByCreatedAt = (items) => [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export async function listMessages(bookingId, user) {
  const booking = await getBookingForUser(bookingId, user);
  const messages = sortByCreatedAt(await messageRepository.findByBooking(bookingId));

  // Viewing the thread marks the other participant's messages as read.
  const unread = messages.filter((m) => m.receiverId === user.uid && !m.read);
  if (unread.length) {
    const readAt = nowIso();
    await Promise.all(unread.map((m) => messageRepository.update(m.id, { read: true, readAt })));
    unread.forEach((m) => {
      m.read = true;
      m.readAt = readAt;
    });
  }

  return { booking, messages };
}

export async function sendMessage(bookingId, user, { text }) {
  const booking = await getBookingForUser(bookingId, user);
  const isProvider = user.role === ROLES.PROVIDER && booking.providerId === user.uid;
  const isCustomer = user.role === ROLES.CUSTOMER && booking.customerId === user.uid;
  if (!isProvider && !isCustomer) {
    // Admins can read a booking's thread but messaging stays between the two participants.
    throw ApiError.forbidden('Only the customer or provider on this booking can send messages.');
  }

  const receiverId = isProvider ? booking.customerId : booking.providerId;
  const senderName = isProvider ? booking.providerName : booking.customerName;
  const ts = nowIso();

  const message = await messageRepository.create({
    bookingId,
    senderId: user.uid,
    senderRole: user.role,
    receiverId,
    text,
    read: false,
    createdAt: ts,
    updatedAt: ts,
  });

  const receiverRole = isProvider ? ROLES.CUSTOMER : ROLES.PROVIDER;
  notificationService
    .notify(receiverId, {
      type: NOTIFICATION_TYPES.NEW_MESSAGE,
      title: `New message from ${senderName}`,
      message: text.length > 120 ? `${text.slice(0, 117)}...` : text,
      link: `/${receiverRole}/bookings/${bookingId}`,
      data: { bookingId },
    })
    .catch(() => {});

  return message;
}
