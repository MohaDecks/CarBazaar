import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError("Resource not found", 404));
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError
      ? err.message
      : "An unexpected error occurred. Please try again.";

  if (!(err instanceof AppError) || statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err instanceof AppError ? err.errors : undefined,
    statusCode,
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
