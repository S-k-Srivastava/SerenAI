export interface IApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface IPermission {
  _id: string;
  action: string;
  resource: string;
  scope: 'all' | 'self';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRole {
  _id: string;
  name: string;
  description?: string;
  permissions: string[] | IPermission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: IRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDecodedToken {
  id: string;
  email: string;
  permissions: string[];
  exp: number;
  iat: number;
}

export interface ILoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IRegisterResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IUsageQuota {
  max_chatbot_count: number;
  used_chatbot_count: number;
  max_document_count: number;
  used_document_count: number;
  max_chatbot_shares: number;
  used_chatbot_shares: number;
  is_public_chatbot_allowed: boolean;
  max_word_count_per_document: number;
}

export interface IUsageStats {
  chatbot_count: number;
  document_count: number;
}

export interface IMeResponse {
  user: IUser;
  subscription?: {
    _id: string;
    plan: {
      _id: string;
      name: string;
      description: string;
      price: number;
      currency: string;
      duration: number;
      discountPercentage: number;
      discountOfferTitle?: string;
      max_chatbot_count: number;
      max_chatbot_shares: number;
      max_document_count: number;
      max_word_count_per_document: number;
      is_public_chatbot_allowed: boolean;
      benefits: string[];
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    start_date: string;
    end_date: string;
    status: 'active' | 'expired' | 'cancelled';
    usage_quotas: IUsageQuota;
    createdAt: string;
    updatedAt: string;
  };
  quota?: IUsageQuota;
  usage?: IUsageStats;
}

export type ContactUsStatus = 'submitted' | 'resolved';

export interface IContactUs {
  _id: string;
  subject: string;
  email: string;
  body: string;
  status: ContactUsStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IContactUsFormData {
  subject: string;
  email: string;
  body: string;
}

export interface ContactUsResponse {
  data: IContactUs[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
