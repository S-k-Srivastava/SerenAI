import { IPlan } from "./plan";

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

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

export interface ISubscription {
  _id: string;
  user_id?: string;
  plan: IPlan;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  usage_quotas: IUsageQuota;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  user_id: string;
  plan_id: string;
}
