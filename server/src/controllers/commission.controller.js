import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as commissionService from '../services/commission.service.js';

/* Provider */
export const listMine = asyncHandler(async (req, res) => {
  const { items, meta } = await commissionService.listMyCommissions(req.user, req.query);
  sendSuccess(res, { data: items, meta });
});

export const getMine = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await commissionService.getCommissionDetail(req.params.id, req.user) }),
);

export const submitPayment = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await commissionService.submitPayment(req.user, req.params.id, req.body), message: 'Payment submitted for review' }),
);

export const dispute = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await commissionService.disputeCommission(req.user, req.params.id, req.body), message: 'Commission disputed' }),
);

/* Admin */
export const listAll = asyncHandler(async (req, res) => {
  const { items, meta } = await commissionService.listAllCommissions(req.query);
  sendSuccess(res, { data: items, meta });
});

export const getDetail = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await commissionService.getCommissionDetail(req.params.id, req.user) }),
);

export const verify = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await commissionService.verifyCommission(req.user, req.params.id, req.body), message: 'Commission verified as paid' }),
);

export const reject = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await commissionService.rejectCommission(req.user, req.params.id, req.body), message: 'Commission payment rejected' }),
);

export const recordPartialPayment = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await commissionService.recordPartialPayment(req.user, req.params.id, req.body), message: 'Partial payment recorded' }),
);

export const waive = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await commissionService.waiveCommission(req.user, req.params.id, req.body), message: 'Commission waived' }),
);

export const financialOverview = asyncHandler(async (_req, res) =>
  sendSuccess(res, { data: await commissionService.getFinancialOverview() }),
);
