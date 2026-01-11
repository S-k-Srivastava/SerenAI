export enum ActionEnum {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum RoleEnum {
  USER = 'user',
  ADMIN = 'admin'
}

export enum ScopeEnum {
  ALL = 'all',
  SELF = 'self'
}

export enum LLMProviderEnum {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  ANTHROPIC = 'anthropic'
}

export enum ResourceEnum {
  PROFILE = "profile",
  USER = "user",
  CHATBOT = "chatbot",
  DOCUMENT = "document",
  LLM_CONFIG = "llm_config",
  ROLE = "role",
  DASHBOARD = "dashboard",
  CHAT = "chat",
  PLAN = "plan",
  ADMIN_STATS = "admin_stats",
  SUBSCRIPTION = "subscription",
  CONTACT_US = "contact_us",
  HELP = "help"
}

export enum ContactUsStatusEnum {
  SUBMITTED = "submitted",
  RESOLVED = "resolved"
}

export enum HelpStatusEnum {
  SUBMITTED = "submitted",
  RESOLVED = "resolved"
}


export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IAuthenticatedUser {
  id: string;
  email: string;
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: IAuthenticatedUser;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// Service Response Types
import { IPlan } from "../models/Plan.js";
import { IRole } from "../models/Role.js";
import { ISubscription, ISubscriptionWithUsageQuotasAndPlan } from "../models/Subscription.js";
import { IChatBot } from "../models/ChatBot.js";
import { IConversation } from "../models/Conversation.js";
import { IDocument } from "../models/Document.js";
import { IPermission } from "../models/Permission.js";
import { IUsageQuota } from "../models/UsageQuota.js";
import mongoose from "mongoose";

export interface IUserPermission {
  action: string;
  resource: string;
  scope: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPlanResponse extends IPlan {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAdminPlansResponse extends IPaginatedResult<IPlan> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IRoleResponse extends IRole {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAdminRolesResponse extends IPaginatedResult<IRole> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPermissionsResponse extends Array<IPermission> {}

// This can be kept if needed for other endpoints, but let's rename it to something more specific if used.
export interface IResourcesAndActionsResponse {
  resources: string[];
  actions: string[];
}

export interface IUsageEventGroup {
    event_type: string;
    events: {
        date: string;
        provider: string;
        model_name: string;
        total_tokens: number;
    }[];
}

export interface IAdminStatsResponse {
  users: number;
  chatbots: number;
  conversations: number;
  roles: number;
  plans: number;
  aiUsage?: IUsageEventGroup[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISubscriptionResponse extends ISubscription {}
// Assuming this is used and should be an array
export type ISubscriptionsResponse = ISubscriptionWithUsageQuotasAndPlan[]; 

// IUserResponse should be a DTO, not extending Mongoose Document
export interface IUserResponse {
    _id: string | mongoose.Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    roles?: string[] | mongoose.Types.ObjectId[] | IRole[];
    createdAt?: Date;
    updatedAt?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAdminUsersResponse extends IPaginatedResult<IUserResponse> {}

export interface IAuthResponse {
  user: IUserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenResponse {
  accessToken: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserProfileResponse extends IUserResponse {}

export interface IUserProfileWithQuotaResponse {
  user: IUserResponse;
  subscription: ISubscription | null;
  quota: IUsageQuota | null;
  usage: {
    chatbot_count: number;
    document_count: number;
  } | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPublicPlansResponse extends Array<IPlan> {}

export interface IChatBotResponse extends IChatBot {
  is_owner?: boolean;
}

export interface IChatbotPopulatedUser extends Omit<IChatBot, 'user_id'> {
  user_id: { _id: mongoose.Types.ObjectId; firstName: string; lastName: string };
}

export interface IChatbotListItem extends IChatBot {
  owner_name: string;
  is_owner: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserChatBotsResponse extends IPaginatedResult<IChatbotListItem> {}

export interface IShareChatBotResponse {
  results: {
    success: string[];
    failed: { email: string; reason: string }[];
  };
  chatbot: IChatBot | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IConversationResponse extends IConversation {}

export interface IChatResponse {
  response: string;
  sources: { content: string; metadata: Record<string, unknown> }[];
  conversationId: string;
}

export interface IConversationWithDetails extends IConversation {
  chatbot: { name: string; _id: mongoose.Types.ObjectId } | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IConversationHistoryResponse extends IConversationWithDetails {}

export interface IConversationPopulatedChatbot extends Omit<IConversation, 'chatbot_id'> {
  chatbot_id: { _id: mongoose.Types.ObjectId; name: string } | null;
}

export interface IConversationListItem {
  _id: string;
  title?: string;
  chatbot: { name: string; _id: string } | null;
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
  }[];
  last_message_at: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserConversationsResponse extends IPaginatedResult<IConversationListItem> {}

export interface IUserDashboardStatsResponse {
  documents: number;
  chatbots: number;
  conversations: number;
}

export interface IDocumentResponse extends IDocument {
  is_owner?: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserDocumentsResponse extends IPaginatedResult<IDocument> {}

// LLMConfig Types
import { ILLMConfig } from "../models/LLMConfig.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILLMConfigResponse extends ILLMConfig {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserLLMConfigsResponse extends IPaginatedResult<ILLMConfig> {}

// Contact Us Types
import { IContactUs } from "../models/ContactUs.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IContactUsResponse extends IContactUs {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAdminContactUsResponse extends IPaginatedResult<IContactUs> {}

// Public Model Configs Types
export interface IFieldConfig {
    label: string;
    placeholder: string;
    type: "text" | "password" | "url";
    required: boolean;
    helpText?: string;
}

export interface IProviderFieldRequirements {
    api_key?: IFieldConfig;
    base_url?: IFieldConfig;
}

export interface IProviderOption {
    value: string;
    label: string;
    description: string;
    fields: IProviderFieldRequirements;
}

export interface IPublicModelConfigsResponse {
    llmProviders: IProviderOption[];
    embeddingProviders: IProviderOption[];
}
