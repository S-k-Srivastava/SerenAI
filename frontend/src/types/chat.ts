import { IPaginatedResult } from "./common";
import { IChatbot } from "./chatbot";

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: { content: string; metadata: Record<string, unknown> }[];
  timestamp: string;
}

export interface IChat {
  _id: string;
  user_id: string;
  chatbot_id: string;
  chatbot: IChatbot;
  messages: IMessage[];
  title?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface IConversationListItem {
  _id: string;
  chatbot: {
    _id: string;
    name: string;
  };
  messages: {
    role: string;
    content: string;
    timestamp: string;
  }[];
  last_message_at: string;
  title?: string;
}

export type ChatsResponse = IPaginatedResult<IConversationListItem>;

export interface UpdateChatTitleData {
  title: string;
}

export interface SendMessageResponse {
  response: string;
  sources?: { content: string; metadata: Record<string, unknown> }[];
  conversationId?: string;
}

export interface RawChatResponse {
  history?: IChat;
  messages?: unknown[];
  title?: string;
  chatbot?: unknown;
  [key: string]: unknown;
}
