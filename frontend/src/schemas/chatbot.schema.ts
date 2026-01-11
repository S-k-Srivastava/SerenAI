import { z } from 'zod';
import { ChatbotVisibilityEnum } from '@/types/chatbot';

export const themeColorsSchema = z.object({
  bg_color: z.string().min(1, "Background color is required"),
  ai_bubble_color: z.string().min(1, "AI bubble color is required"),
  user_bubble_color: z.string().min(1, "User bubble color is required"),
  user_profile_bg_color: z.string().min(1, "User profile bg color is required"),
  ai_profile_bg_color: z.string().min(1, "AI profile bg color is required"),
  accent_color: z.string().min(1, "Accent color is required"),
  text_field_color: z.string().min(1, "Text field color is required"),
  text_field_foreground: z.string().min(1, "Text field foreground is required"),
  text_field_icon_color: z.string().min(1, "Text field icon color is required"),
  footer_bg_color: z.string().min(1, "Footer bg color is required"),
  header_color: z.string().min(1, "Header color is required"),
  header_text_color: z.string().min(1, "Header text color is required"),
  ai_bubble_text_color: z.string().min(1, "AI bubble text color is required"),
  user_bubble_text_color: z.string().min(1, "User bubble text color is required"),
  ai_bubble_border_color: z.string().min(1, "AI bubble border color is required"),
  user_bubble_border_color: z.string().min(1, "User bubble border color is required"),
  header_separator_color: z.string().min(1, "Header separator color is required"),
  header_icon_color: z.string().min(1, "Header icon color is required"),
  send_btn_color: z.string().min(1, "Send button color is required"),
  send_btn_icon_color: z.string().min(1, "Send button icon color is required"),
  input_placeholder_color: z.string().min(1, "Input placeholder color is required"),
  timestamp_color: z.string().min(1, "Timestamp color is required"),
  search_highlight_color: z.string().min(1, "Search highlight color is required"),
  loading_indicator_color: z.string().min(1, "Loading indicator color is required"),
  footer_text_color: z.string().min(1, "Footer text color is required"),
  success_color: z.string().min(1, "Success color is required"),
  header_logo_border_color: z.string().min(1, "Header logo border color is required"),
  header_logo_bg_color: z.string().min(1, "Header logo bg color is required"),
  welcome_text_color: z.string().min(1, "Welcome text color is required"),
  suggested_prompt_title_color: z.string().min(1, "Suggested prompt title color is required"),
  suggested_prompt_desc_color: z.string().min(1, "Suggested prompt desc color is required"),
  suggested_prompt_icon_color: z.string().min(1, "Suggested prompt icon color is required"),
});

export const themeSchema = z.object({
  light: themeColorsSchema,
  dark: themeColorsSchema,
  msg_bubble_radius: z.number().min(0).default(12),
  input_radius: z.number().min(0).default(12),
  header_logo_radius: z.number().min(0).default(8),
  header_logo_width: z.number().min(1).default(40),
  header_logo_height: z.number().min(1).default(40),
  header_logo_border_width: z.number().min(0).default(2),
  shadow_intensity: z.enum(["none", "sm", "md", "lg"]).default("sm"),
  loading_animation_style: z.enum(["dot", "wave", "circle"]).default("dot"),
  show_header_separator: z.boolean().default(true),
});

export const chatBotSchema = z.object({
  name: z.string().min(1, "Chatbot Name is required"),
  visibility: z.nativeEnum(ChatbotVisibilityEnum),
  system_prompt: z.string().min(1, "System prompt is required"),
  document_ids: z.array(z.string()).refine((val) => val.length > 0, {
    message: "Please select at least one document"
  }),
  llm_config_id: z.string().min(1, "LLM Configuration is required"),
  view_source_documents: z.boolean(),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1),
  theme: themeSchema,
  logo: z.string().optional(),
  shared_with: z.array(z.string()).optional(),
});

export type ChatBotFormValues = z.infer<typeof chatBotSchema>;
export type ThemeFormValues = z.infer<typeof themeSchema>;
