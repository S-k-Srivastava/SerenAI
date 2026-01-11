import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/index.js";
import logger from "../../utils/logger/index.js";
import { env } from "../../config/env/index.js";

interface IErrorResponse {
  data: null;
  error: string;
  status: number;
  message: string;
  stack?: string;
}

interface IMongoError extends Error {
  code?: number;
}

interface IMongoValidationError extends Error {
  errors: Record<string, { message: string }>;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction
): void => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError(err.message, 500);
  }

  logger.error(`Error ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof SyntaxError && "body" in err) {
    error = new AppError("Invalid JSON payload", 400);
  }

  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new AppError(message, 404);
  }

  if (err.name === "ValidationError") {
    // Handle Mongoose Validation Errors
    if ((err as IMongoValidationError).errors) {
       const messages = Object.values((err as IMongoValidationError).errors).map((val) => val.message);
       const message = messages.join(', ');
       error = new AppError(message, 400);
    } else if (!(err instanceof AppError)) {
        // Fallback for other standard ValidationErrors that are not AppErrors
        error = new AppError(err.message, 400);
    }
    // If it *is* an AppError (e.g. from validateRequest), we leave 'error' as is (set at top)
  }

  if ((err as IMongoError).code === 11000) {
    const message = "Duplicate field value entered";
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || 500;
  const errorMessage = error.message || "Server Error";

  const response: IErrorResponse = {
    data: null,
    error: errorMessage,
    status: statusCode,
    message: errorMessage,
  };

  if (env.NODE_ENV === "development") {
    response.stack = err.stack || "";
  }

  res.status(statusCode).json(response);
};
