import { ERROR_CODES } from '../constants/index.js';

/** Operational error carrying an HTTP status and a stable machine-readable code. */
export class ApiError extends Error {
  constructor(statusCode, message, errorCode = ERROR_CODES.INTERNAL_ERROR, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, errorCode = ERROR_CODES.VALIDATION_ERROR, details) {
    return new ApiError(400, message, errorCode, details);
  }

  static unauthorized(message = 'Authentication required', errorCode = ERROR_CODES.UNAUTHENTICATED) {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = 'You do not have permission to perform this action', errorCode = ERROR_CODES.FORBIDDEN) {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode = ERROR_CODES.NOT_FOUND) {
    return new ApiError(404, message, errorCode);
  }

  static conflict(message, errorCode = ERROR_CODES.ALREADY_EXISTS, details) {
    return new ApiError(409, message, errorCode, details);
  }
}
