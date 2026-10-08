import { complaintRepository, bookingRepository, providerRepository, userRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate } from '../utils/http.js';
import { nowIso } from '../utils/time.js';
import { COMPLAINT_STATUS, NOTIFICATION_TYPES, ROLES } from '../constants/index.js';
import * as notificationService from './notification/notification.service.js';

export async function createComplaint(user, { type, bookingId, providerId, subject, description }) {
  let resolvedProviderId = providerId || '';
  let bookingSummary = '';

  if (bookingId) {
    const booking = await bookingRepository.findById(bookingId);
    // Users may only complain about bookings they took part in.
    if (!booking || (booking.customerId !== user.uid && booking.providerId !== user.uid)) {
      throw ApiError.notFound('Booking not found');
    }
    resolvedProviderId = resolvedProviderId || booking.providerId;
    bookingSummary = `${booking.serviceTitle} on ${booking.bookingDate}`;
  }
  if (resolvedProviderId && !(await providerRepository.findById(resolvedProviderId))) {
    throw ApiError.badRequest('Selected provider does not exist');
  }

  const timestamp = nowIso();
  return complaintRepository.create({
    userId: user.uid,
    userRole: user.role,
    userName: user.displayName,
    userEmail: user.email,
    type,
    bookingId: bookingId || '',
    bookingSummary,
    providerId: resolvedProviderId,
    subject,
    description,
    status: COMPLAINT_STATUS.OPEN,
    adminResponse: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function listMyComplaints(user, query) {
  const complaints = await complaintRepository.findByUser(user.uid);
  return paginate(complaints, query);
}

export async function getComplaint(user, id) {
  const complaint = await complaintRepository.findById(id);
  if (!complaint || (user.role !== ROLES.ADMIN && complaint.userId !== user.uid)) throw ApiError.notFound('Complaint not found');
  return complaint;
}

export async function listAllComplaints({ status, page, limit } = {}) {
  return paginate(await complaintRepository.findAll(status), { page, limit });
}

export async function updateComplaint(admin, id, { status, adminResponse }) {
  const complaint = await complaintRepository.findById(id);
  if (!complaint) throw ApiError.notFound('Complaint not found');
  const timestamp = nowIso();
  const update = { status, updatedAt: timestamp, handledBy: admin.uid };
  if (adminResponse !== undefined) update.adminResponse = adminResponse;
  if ([COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.REJECTED].includes(status)) update.closedAt = timestamp;
  const updated = await complaintRepository.update(id, update);

  const owner = await userRepository.findById(complaint.userId);
  if (owner) {
    await notificationService.notify(complaint.userId, {
      type: NOTIFICATION_TYPES.COMPLAINT_UPDATE,
      title: 'Complaint updated',
      message: `Your complaint "${complaint.subject}" is now ${status.replace('_', ' ')}.${adminResponse ? ` Response: ${adminResponse}` : ''}`,
      link: `/${owner.role}/complaints`,
      data: { complaintId: id },
    });
  }
  return updated;
}
