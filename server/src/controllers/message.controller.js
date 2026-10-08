import { asyncHandler, sendSuccess } from '../utils/http.js';
import * as messageService from '../services/message.service.js';

export const list = asyncHandler(async (req, res) => {
  const { messages } = await messageService.listMessages(req.params.id, req.user);
  sendSuccess(res, { data: messages });
});

export const send = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    data: await messageService.sendMessage(req.params.id, req.user, req.body),
    message: 'Message sent',
    statusCode: 201,
  }),
);
