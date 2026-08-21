import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./error";
import type { UserRole } from "@car-marketplace/types";

export interface AuthPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AuthPayload;
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const token = header.slice(7);
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next();
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission for this action", 403));
    }
    next();
  };
}
