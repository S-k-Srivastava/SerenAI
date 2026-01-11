import { z } from "zod";
import { ChatbotVisibilityEnum } from "../models/ChatBot.js";

const ThemeColorsSchema = z.object({
    bg_color: z.string().min(1, "Background color is required"),
    ai_bubble_color: z.string().min(1, "AI bubble color is required"),
    user_bubble_color: z.string().min(1, "User bubble color is required"),
    accent_color: z.string().min(1, "Accent color is required"),
    text_field_color: z.string().min(1, "Text field color is required"),
    text_field_foreground: z.string().min(1, "Text field foreground color is required"),
    text_field_icon_color: z.string().min(1, "Text field icon color is required"),
    footer_bg_color: z.string().min(1, "Footer background color is required"),
    header_color: z.string().min(1, "Header color is required"),
    header_text_color: z.string().min(1, "Header text color is required"),
    ai_bubble_text_color: z.string().min(1, "AI bubble text color is required"),
    user_bubble_text_color: z.string().min(1, "User bubble text color is required"),
    ai_bubble_border_color: z.string().min(1, "AI bubble border color is required"),
    user_bubble_border_color: z.string().min(1, "User bubble border color is required"),
    user_profile_bg_color: z.string().min(1, "User profile bg color is required"),
    ai_profile_bg_color: z.string().min(1, "AI profile bg color is required"),
    header_separator_color: z.string().min(1, "Header separator color is required"),
    // New granular color properties
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
    header_logo_bg_color: z.string().min(1, "Header logo background color is required"),
    welcome_text_color: z.string().min(1, "Welcome text color is required"),
    suggested_prompt_title_color: z.string().min(1, "Suggested prompt title color is required"),
    suggested_prompt_desc_color: z.string().min(1, "Suggested prompt description color is required"),
    suggested_prompt_icon_color: z.string().min(1, "Suggested prompt icon color is required"),
});

const ThemeSchema = z.object({
    light: ThemeColorsSchema,
    dark: ThemeColorsSchema,
    msg_bubble_radius: z.number().min(0).default(12),
    input_radius: z.number().min(0).default(12),
    header_logo_radius: z.number().min(0).default(8),
    header_logo_width: z.number().min(16).max(128).default(36),
    header_logo_height: z.number().min(16).max(128).default(36),
    header_logo_border_width: z.number().min(0).max(10).default(0),
    shadow_intensity: z.enum(["none", "sm", "md", "lg"]).default("sm"),
    loading_animation_style: z.enum(["dot", "wave", "circle"]).default("dot"),
    show_header_separator: z.boolean().default(false),
});

export const CreateChatBotSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        document_ids: z.array(z.string()).min(1, "At least one document is required"),
        system_prompt: z.string().min(1, "System prompt is required"),
        visibility: z.nativeEnum(ChatbotVisibilityEnum).default(ChatbotVisibilityEnum.PRIVATE),
        llm_config_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid LLM Config ID"),
        view_source_documents: z.boolean(),
        temperature: z.number().min(0).max(2),
        max_tokens: z.number().int().min(1),
        theme: ThemeSchema,
        logo: z.string().min(1, "Logo is required"),
    }),
});

export const UpdateChatBotSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name cannot be empty").optional(),
        document_ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Document ID")).optional(),
        system_prompt: z.string().optional(),
        is_active: z.boolean().optional(),
        visibility: z.nativeEnum(ChatbotVisibilityEnum).optional(),
        llm_config_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid LLM Config ID").optional(),
        view_source_documents: z.boolean().optional(),
        temperature: z.number().min(0).max(2).optional(),
        max_tokens: z.number().int().min(1).optional(),
        theme: ThemeSchema.partial().optional(),
        logo: z.string().optional(),
    }),
});

export const UpdateVisibilitySchema = z.object({
    body: z.object({
        visibility: z.nativeEnum(ChatbotVisibilityEnum),
    }),
});

export const ShareChatBotSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address").optional(),
        emails: z.array(z.string().email("Invalid email address")).optional(),
    }).refine(data => data.email || (data.emails && data.emails.length > 0), {
        message: "At least one email or emails array is required",
        path: ["emails"],
    }).transform(data => {
        const finalEmails = data.emails || [];
        if (data.email && !finalEmails.includes(data.email)) {
            finalEmails.push(data.email);
        }
        return { emails: finalEmails };
    }),
});

export type CreateChatBotRequest = z.infer<typeof CreateChatBotSchema>["body"];
export type UpdateChatBotRequest = z.infer<typeof UpdateChatBotSchema>["body"];
export type UpdateVisibilityRequest = z.infer<typeof UpdateVisibilitySchema>["body"];
export type ShareChatBotRequest = z.infer<typeof ShareChatBotSchema>["body"];
