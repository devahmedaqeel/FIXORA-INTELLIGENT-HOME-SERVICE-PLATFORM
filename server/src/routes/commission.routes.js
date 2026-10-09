import { Router } from 'express';
import { authenticateUser, requireProvider } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParams } from '../validators/common.validator.js';
import { submitCommissionPaymentSchema, disputeCommissionSchema, listCommissionsQuery } from '../validators/finance.validator.js';
import * as controller from '../controllers/commission.controller.js';

const router = Router();

// Provider-only: a provider manages their own commission payments here. Admin verification
// of the SAME records happens under /admin/commissions (see admin.routes.js) — the service
// layer enforces that only the owning provider (or an admin) may ever read or act on one.
router.use(authenticateUser, requireProvider);

router.get('/my', validate({ query: listCommissionsQuery }), controller.listMine);
router.get('/my/:id', validate({ params: idParams }), controller.getMine);
router.post('/my/:id/submit-payment', validate({ params: idParams, body: submitCommissionPaymentSchema }), controller.submitPayment);
router.post('/my/:id/dispute', validate({ params: idParams, body: disputeCommissionSchema }), controller.dispute);

export default router;
