import { type Request, type Response, type NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';
import { createLogger } from '../utils/logger';

const logger = createLogger('ErrorHandler');

/**
 * An error thrown anywhere in the request pipeline. Express does not type the
 * error argument, so we narrow it here instead of trusting `any`.
 */
type HttpError = Error & {
  status?: number;
  statusCode?: number;
};

const toHttpError = (err: unknown): HttpError => {
  if (err instanceof Error) return err;
  // Non-Error throws stay masked, exactly as before: surfacing a raw thrown
  // string/object to the client would leak internals.
  return new Error('Internal Server Error');
};

/**
 * Global Error Handling middleware
 */
export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const error = toHttpError(err);
  const status = error.status ?? error.statusCode ?? 500;
  const message = error.message || 'Internal Server Error';

  // Log detailed error for debugging
  logger.error(`${req.method} ${req.url} - Error: ${message}`, {
    stack: error.stack,
    userId: (req as Request & { userId?: string }).userId,
    body: req.body,
  });

  // Return standardized error response
  res.status(status).json(errorResponse(message));
};

/**
 * Handle 404 - Not Found
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(errorResponse(`Route ${req.method} ${req.url} not found`));
};
