// IUser removed
import mongoose from "mongoose";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../errors/index.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  generateAccessToken,
} from "../utils/helpers/auth.js";
import { RegisterRequest, LoginRequest, UpdateUserProfileRequest, GoogleSSORegisterRequest, GoogleSSOLoginRequest } from "../schemas/auth.js";
import { usersRepository } from "../repositories/users.repository.js";
import { IUsersRepository } from "../repositories/interfaces/IUsersRepository.js";
import { rolesRepository } from "../repositories/roles.repository.js";
import { IRolesRepository } from "../repositories/interfaces/IRolesRepository.js";
import { subscriptionsRepository } from "../repositories/subscriptions.repository.js";
import { usageQuotasRepository } from "../repositories/usage_quotas.repository.js";
import { chatbotsRepository } from "../repositories/chatbots.repository.js";
import { documentsRepository } from "../repositories/documents.repository.js";

import { IAuthService } from "./interfaces/IAuthService.js";
import { IAuthResponse, IRefreshTokenResponse, IUserResponse, IUserProfileResponse, IUserProfileWithQuotaResponse, IUserPermission } from "../types/index.js";
import { env } from "../config/env/index.js";

export class AuthService implements IAuthService {
  private userRepository: IUsersRepository;
  private roleRepository: IRolesRepository;

  constructor(
    userRepository?: IUsersRepository,
    roleRepository?: IRolesRepository
  ) {
    this.userRepository = userRepository || usersRepository;
    this.roleRepository = roleRepository || rolesRepository;
  }

  private async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) return [];

    const roles = await this.roleRepository.getRolesByIds((user.roles as mongoose.Types.ObjectId[]).map(r => r.toString()));

    // Flatten all permissions from all roles using flatMap (optimized)
    const allPermissions = roles.flatMap(role => {
      if (!Array.isArray(role.permissions)) return [];

      return role.permissions
        .filter(permission =>
          typeof permission === 'object' &&
          'action' in permission &&
          'resource' in permission &&
          'scope' in permission
        )
        .map(permission => {
          const p = permission as unknown as IUserPermission;
          return `${p.action}:${p.resource}:${p.scope}`;
        });
    });

    // Remove duplicates using Set
    return Array.from(new Set(allPermissions));
  }

  async register(userData: RegisterRequest): Promise<IAuthResponse> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const user = await this.userRepository.create(userData);
    const permissions = await this.getUserPermissions(
      (user._id as mongoose.Types.ObjectId).toString()
    );
    const { roles: _, ...userWithoutRoles } = user.toObject();
    const tokens = generateTokenPair(user, permissions);

    return {
      user: userWithoutRoles as unknown as IUserResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(credentials: LoginRequest): Promise<IAuthResponse> {
    const user = await this.userRepository.findByEmailWithPassword(
      credentials.email
    );

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const permissions = await this.getUserPermissions(
      (user._id as mongoose.Types.ObjectId).toString()
    );
    const tokens = generateTokenPair(user, permissions);

    return {
      user: user.toObject() as unknown as IUserResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<IRefreshTokenResponse> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(payload.id);

      if (!user) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      if (!user.isActive) {
        throw new UnauthorizedError("Account is deactivated");
      }

      const permissions = await this.getUserPermissions(payload.id);
      const accessToken = generateAccessToken(user, permissions);

      return { accessToken };
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

    async getUserById(userId: string): Promise<IUserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user.toObject() as unknown as IUserResponse;
  }

    async getUserProfile(userId: string): Promise<IUserProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }
    return user.toObject() as unknown as IUserResponse;
  }

    async getUserProfileWithQuota(userId: string): Promise<IUserProfileWithQuotaResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const subscription = await subscriptionsRepository.findActiveByUserId(userId);
    let quota = null;
    let usage = null;

    if (subscription) {
        const [quotaData, chatbotCount, documentCount] = await Promise.all([
            usageQuotasRepository.findBySubscriptionId((subscription._id as mongoose.Types.ObjectId).toString()),
            chatbotsRepository.count({ user_id: userId }),
            documentsRepository.count({ user_id: userId })
        ]);

        quota = quotaData;
        usage = {
            chatbot_count: chatbotCount,
            document_count: documentCount
        };
    }

    return { user: user.toObject() as unknown as IUserResponse, subscription, quota, usage };
  }

    async updateUserProfile(userId: string, data: UpdateUserProfileRequest): Promise<IUserProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedUser = await this.userRepository.updateById(userId, data);
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }
    return updatedUser.toObject() as unknown as IUserResponse;
  }

  // SSO Methods
  private async verifyGoogleToken(token: string): Promise<{ email: string; email_verified: boolean }> {
    try {
      // eslint-disable-next-line no-undef
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const data = await response.json() as { email: string; email_verified?: boolean };

      if (!data || !data.email) {
        throw new UnauthorizedError("Invalid Google token (Access Token)");
      }

      return {
        email: data.email,
        email_verified: data.email_verified === true, // Google API returns boolean true/false
      };
    } catch (error) {
      throw new UnauthorizedError(`Failed to verify Google token: ${error}`);
    }
  }

  async googleSSORegister(data: GoogleSSORegisterRequest): Promise<IAuthResponse> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error("Google Sign-In is not configured on the server.");
    }
    const { email, email_verified } = await this.verifyGoogleToken(data.token);

    if (!email_verified) {
      throw new UnauthorizedError("Google email not verified");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Create user with random password (SSO users don't need to know it)
    const randomPassword = Math.random().toString(36).slice(-12) + "A1!";
    const user = await this.userRepository.create({
      email,
      password: randomPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const permissions = await this.getUserPermissions(
      (user._id as mongoose.Types.ObjectId).toString()
    );
    const { roles: _, ...userWithoutRoles } = user.toObject();
    const tokens = generateTokenPair(user, permissions);

    return {
      user: userWithoutRoles as unknown as IUserResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async googleSSOLogin(data: GoogleSSOLoginRequest): Promise<IAuthResponse> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error("Google Sign-In is not configured on the server.");
    }
    const { email, email_verified } = await this.verifyGoogleToken(data.token);

    if (!email_verified) {
      throw new UnauthorizedError("Google email not verified");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("User not found. Please register first.");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const permissions = await this.getUserPermissions(
      (user._id as mongoose.Types.ObjectId).toString()
    );
    const tokens = generateTokenPair(user, permissions);

    return {
      user: user.toObject() as unknown as IUserResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
