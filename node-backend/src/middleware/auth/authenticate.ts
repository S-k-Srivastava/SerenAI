import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../errors/index.js";
import { verifyAccessToken } from "../../utils/helpers/auth.js";
import { usersRepository } from "../../repositories/users.repository.js";

export const authenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("Session expired. Please log in again.");
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      throw new UnauthorizedError("Session expired. Please log in again.");
    }

    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.id) {
      throw new UnauthorizedError("Session invalid. Please log in again.");
    }

    const user = await usersRepository.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError("We couldn't find your account. Please log in again.");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("This account is currently inactive. Please contact support.");
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")
    ) {
      next(new UnauthorizedError("Session expired. Please log in again."));
    } else {
      next(error);
    }
  }
};
