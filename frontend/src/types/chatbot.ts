import { IPaginatedResult } from "./common";

export enum ChatbotVisibilityEnum {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  SHARED = "SHARED"
}

export interface IDocumentRef {
  _id: string;
  name: string;
}

export interface IUserRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IThemeColors {
  bg_color: string;
  ai_bubble_color: string;
  user_bubble_color: string;
  accent_color: string;
  text_field_color: string;
  text_field_foreground: string;
  text_field_icon_color: string;
  footer_bg_color: string;
  header_color: string;
  header_text_color: string;
  ai_bubble_text_color: string;
  user_bubble_text_color: string;
  ai_bubble_border_color: string;
  user_bubble_border_color: string;
  user_profile_bg_color: string;
  ai_profile_bg_color: string;
  header_separator_color: string;
  header_icon_color: string;
  send_btn_color: string;
  send_btn_icon_color: string;
  input_placeholder_color: string;
  timestamp_color: string;
  search_highlight_color: string;
  loading_indicator_color: string;
  footer_text_color: string;
  success_color: string;
  header_logo_border_color: string;
  header_logo_bg_color: string;
  welcome_text_color: string;
  suggested_prompt_title_color: string;
  suggested_prompt_desc_color: string;
  suggested_prompt_icon_color: string;
}

export interface IChatBotTheme {
  light: IThemeColors;
  dark: IThemeColors;
  msg_bubble_radius: number;
  input_radius: number;
  header_logo_radius: number;
  header_logo_width: number;
  header_logo_height: number;
  header_logo_border_width: number;
  shadow_intensity: "none" | "sm" | "md" | "lg";
  loading_animation_style: "dot" | "wave" | "circle";
  show_header_separator: boolean;
}

export interface IResolvedTheme extends IThemeColors {
  msg_bubble_radius: number;
  input_radius: number;
  header_logo_radius: number;
  header_logo_width: number;
  header_logo_height: number;
  header_logo_border_width: number;
  shadow_intensity: "none" | "sm" | "md" | "lg";
  loading_animation_style: "dot" | "wave" | "circle";
  show_header_separator: boolean;
}

export interface IChatbot {
  _id: string;
  name: string;
  system_prompt: string;
  is_active: boolean;
  visibility: ChatbotVisibilityEnum;
  owner_name?: string;
  is_owner?: boolean;
  llm_config_id: string;
  view_source_documents: boolean;
  temperature: number;
  max_tokens: number;
  theme: IChatBotTheme;
  logo: string;
  createdAt: string;
  updatedAt: string;
  documents: IDocumentRef[];
  shared_with: IUserRef[];
}

export interface CreateChatbotData {
  name: string;
  system_prompt?: string;
  is_active?: boolean;
  visibility?: ChatbotVisibilityEnum;
  document_ids: string[];
  llm_config_id?: string;
  view_source_documents?: boolean;
  temperature?: number;
  max_tokens?: number;
  theme: IChatBotTheme;
  logo?: string;
  shared_with?: string[];
}

export type UpdateChatbotData = Partial<Omit<CreateChatbotData, 'document_ids'>> & {
  document_ids?: string[];
};

export type ChatbotsResponse = IPaginatedResult<IChatbot>;

export interface ShareChatbotResponse {
  results: {
    success: string[];
    failed: {
      email: string;
      reason: string;
    }[];
  };
}

export interface StartChatResponse {
  conversationId: string;
}
