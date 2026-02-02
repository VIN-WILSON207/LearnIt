import { Response } from 'express';

/**
 * Centralized Error Response Handler
 * Properly handles both Error objects and unknown error types
 */
export function handleError(
  error: unknown,
  res: Response,
  statusCode: number = 500,
  defaultMessage: string = 'Internal Server Error'
) {
  let errorMessage = defaultMessage;
  let errorDetails = null;

  // TypeScript safe error handling
  if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (typeof error === 'object' && error !== null) {
    errorMessage = (error as any).message || defaultMessage;
  }

  // Log error for debugging
  console.error(`[${statusCode}] ${defaultMessage}:`, {
    message: errorMessage,
    details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
  });

  res.status(statusCode).json({
    error: defaultMessage,
    message: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { details: errorDetails }),
  });
}

/**
 * Safe error message extractor
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as any).message;
  }
  return 'Unknown error occurred';
}
