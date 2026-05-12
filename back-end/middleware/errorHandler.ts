import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';
import { createLogger } from '../utils/logger';

const logger = createLogger('ErrorHandler');

/**
 * Global Error Handling middleware
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log detailed error for debugging
  logger.error(`${req.method} ${req.url} - Error: ${message}`, {
    stack: err.stack,
    userId: (req as any).userId,
    body: req.body
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
