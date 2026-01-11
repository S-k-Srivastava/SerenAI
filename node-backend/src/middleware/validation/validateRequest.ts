import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ValidationError } from "../../errors/index.js";

export const validateRequest = (schema: ZodType) => {
  return (req: Request, _: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: Record<string, unknown>; query?: Record<string, unknown>; params?: Record<string, unknown> };
      
      if (parsed.body) {
          req.body = parsed.body;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => {
          const path = err.path[0] === "body" ? err.path.slice(1) : err.path;
          const field = path.join(".");
          return field ? `${field}: ${err.message}` : err.message;
        });
        next(new ValidationError(errorMessages.join(", ")));
      } else {
        next(error);
      }
    }
  };
};
