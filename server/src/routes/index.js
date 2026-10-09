import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import customerRoutes from './customer.routes.js';
import providerRoutes from './provider.routes.js';
import serviceRoutes from './service.routes.js';
import categoryRoutes from './category.routes.js';
import areaRoutes from './area.routes.js';
import availabilityRoutes from './availability.routes.js';
import bookingRoutes from './booking.routes.js';
import commissionRoutes from './commission.routes.js';
import adminRoutes from './admin.routes.js';
import { reviewRouter, complaintRouter, notificationRouter } from './feedback.routes.js';
import reportsRoutes from '../reports/reports.routes.js';
import chatbotRoutes from '../chatbot/chatbot.routes.js';
import * as meta from '../controllers/meta.controller.js';

/** Versionless REST API consumed by the web client today and a mobile app later. */
const router = Router();

router.get('/health', meta.health);
router.get('/config', meta.config);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/providers', providerRoutes);
router.use('/services', serviceRoutes);
router.use('/categories', categoryRoutes);
router.use('/areas', areaRoutes);
router.use('/availability', availabilityRoutes);
router.use('/bookings', bookingRoutes);
router.use('/commissions', commissionRoutes);
router.use('/reviews', reviewRouter);
router.use('/complaints', complaintRouter);
router.use('/notifications', notificationRouter);
router.use('/reports', reportsRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/admin', adminRoutes);

export default router;
