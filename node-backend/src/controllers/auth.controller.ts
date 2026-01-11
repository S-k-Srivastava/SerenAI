import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { sendSuccess, sendCreated } from "../utils/helpers/responseHelper.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { RegisterRequest, LoginRequest, RefreshTokenRequest, GoogleSSORegisterRequest, GoogleSSOLoginRequest } from "../schemas/auth.js";

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const userData: RegisterRequest = req.body;
  const { user, accessToken, refreshToken } = await authService.register(userData);

  sendCreated(res, {
    user,
    accessToken,
    refreshToken,
  }, "Welcome to SerenAI! your account has been created successfully.");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const credentials: LoginRequest = req.body;
  const { user, accessToken, refreshToken } = await authService.login(credentials);

  sendSuccess(res, {
    user,
    accessToken,
    refreshToken,
  }, "Welcome back! You have logged in successfully.");
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await authService.getUserProfile(userId);

  sendSuccess(res, { user }, "User profile retrieved successfully");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  // Use the new method that includes quota and subscription details
  const data = await authService.getUserProfileWithQuota(userId);
  sendSuccess(res, data, "User information retrieved successfully");
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const updateData = req.body;
  const user = await authService.updateUserProfile(userId, updateData);
  sendSuccess(res, { user }, "Profile updated successfully");
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken }: RefreshTokenRequest = req.body;
  const { accessToken } = await authService.refreshAccessToken(refreshToken);

  sendSuccess(res, { accessToken }, "Access token refreshed successfully");
});

// SSO Controllers
export const googleSSORegister = asyncHandler(async (req: Request, res: Response) => {
  const data: GoogleSSORegisterRequest = req.body;
  const { user, accessToken, refreshToken } = await authService.googleSSORegister(data);

  sendCreated(res, {
    user,
    accessToken,
    refreshToken,
  }, "Welcome! Your account has been created successfully with Google.");
});

export const googleSSOLogin = asyncHandler(async (req: Request, res: Response) => {
  const data: GoogleSSOLoginRequest = req.body;
  const { user, accessToken, refreshToken } = await authService.googleSSOLogin(data);

  sendSuccess(res, {
    user,
    accessToken,
    refreshToken,
  }, "Welcome back! You have logged in successfully with Google.");
});