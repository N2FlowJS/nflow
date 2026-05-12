/**
 * Standardized API response wrapper
 * Ensures consistent response format across all endpoints
 */

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  ok: false;
  error: string;
}

/**
 * Create a success response
 */
export const successResponse = <T>(data?: T, pagination?: ApiResponse['pagination']): ApiResponse<T> => ({
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
 * Wrapper for route handlers that automatically formats responses
 */
export const asyncHandler = (
  handler: (req: any, res: any, next?: any) => Promise<void>
) => {
  return (req: any, res: any, next?: any) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
