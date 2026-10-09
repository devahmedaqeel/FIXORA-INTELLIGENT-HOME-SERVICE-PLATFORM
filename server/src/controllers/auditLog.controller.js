import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as auditLogService from '../services/auditLog.service.js';

export const listAll = asyncHandler(async (req, res) => {
  const { items, meta } = await auditLogService.listAll(req.query);
  sendSuccess(res, { data: items, meta });
});
