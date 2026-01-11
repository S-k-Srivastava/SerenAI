import jwt from "jsonwebtoken";
import { env } from "../../config/env/index.js";
import { IUser } from "../../models/User.js";

export interface ITokenPayload {
  id: string;
  email: string;
  permissions: string[];
}

export interface IRefreshTokenPayload {
  id: string;
  email: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateAccessToken = (
  user: IUser,
  permissions: string[]
): string => {
  const payload: ITokenPayload = {
    id: user.id,
    email: user.email,
    permissions,
  };

  return jwt.sign(payload, env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (user: IUser): string => {
  const payload: IRefreshTokenPayload = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(payload, env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateTokenPair = (
  user: IUser,
  permissions: string[]
): ITokenPair => {
  return {
    accessToken: generateAccessToken(user, permissions),
    refreshToken: generateRefreshToken(user),
  };
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): IRefreshTokenPayload => {
  return jwt.verify(
    token,
    env.JWT_REFRESH_TOKEN_SECRET
  ) as IRefreshTokenPayload;
};
