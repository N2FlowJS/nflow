import type { NextFunction, Request, Response } from 'express';

/**
 * Standardized API response wrapper
 * Ensures consistent response format across all endpoints
 */

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T | undefined;
  error?: string | undefined;
  pagination?:
    | {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
      }
    | undefined;
}

export interface ApiError {
  ok: false;
  error: string;
}

/**
 * Create a success response
 */
export const successResponse = <T>(
  data?: T,
  pagination?: ApiResponse['pagination'],
): ApiResponse<T> => ({
  ok: true,
  data,
  pagination,
});

/**
 * Create an error response
 */
export const errorResponse = (error: string): ApiError => ({
  ok: false,
  error,
});

/**
 * Wrap an async route handler so a rejected promise is forwarded to Express'
 * error middleware instead of becoming an unhandled rejection.
 *
 * `P` is the request type, so handlers that need an augmented `req` (e.g.
 * `AuthRequest`) can opt in: `asyncHandler<AuthRequest>(async (req, res) => ...)`.
 */
export const asyncHandler =
  <P = Request>(handler: (req: P, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    void Promise.resolve(handler(req as P, res, next)).catch(next);
  };
