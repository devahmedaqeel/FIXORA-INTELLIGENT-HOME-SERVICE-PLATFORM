import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as chatbotService from './chatbot.service.js';

/** POST /api/chatbot/message — identity comes from req.user (token), never the body. */
export const message = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await chatbotService.handleMessage(req.user || null, req.body) }),
);

export const history = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: await chatbotService.getHistory(req.user) }),
);

export const quickReplies = (req, res) => sendSuccess(res, { data: chatbotService.getQuickReplies(req.user) });
