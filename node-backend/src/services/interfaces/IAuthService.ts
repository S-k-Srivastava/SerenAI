import { RegisterRequest, LoginRequest, UpdateUserProfileRequest } from "../../schemas/auth.js";
import { IAuthResponse, IRefreshTokenResponse, IUserResponse, IUserProfileResponse, IUserProfileWithQuotaResponse } from "../../types/index.js";

export interface IAuthService {
  register(userData: RegisterRequest): Promise<IAuthResponse>;
  login(credentials: LoginRequest): Promise<IAuthResponse>;
  refreshAccessToken(refreshToken: string): Promise<IRefreshTokenResponse>;
  getUserById(userId: string): Promise<IUserResponse>;
  getUserProfile(userId: string): Promise<IUserProfileResponse>;
  getUserProfileWithQuota(userId: string): Promise<IUserProfileWithQuotaResponse>;
  updateUserProfile(userId: string, data: UpdateUserProfileRequest): Promise<IUserProfileResponse>;
}