import mongoose, { Schema, Document } from "mongoose";

export enum ChatbotVisibilityEnum {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    SHARED = "SHARED"
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
    // New granular color properties
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

export interface IChatBot extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    document_ids: mongoose.Types.ObjectId[];
    system_prompt: string;
    visibility: ChatbotVisibilityEnum;
    shared_with: mongoose.Types.ObjectId[];
    is_active: boolean;
    llm_config_id: mongoose.Types.ObjectId;
    view_source_documents: boolean;
    temperature: number;
    max_tokens: number;
    theme: IChatBotTheme;
    logo: string;
    createdAt: Date;
    updatedAt: Date;
}

const themeColorsSchema = new Schema<IThemeColors>({
    bg_color: { type: String, required: true },
    ai_bubble_color: { type: String, required: true },
    user_bubble_color: { type: String, required: true },
    accent_color: { type: String, required: true },
    text_field_color: { type: String, required: true },
    text_field_foreground: { type: String, required: true },
    text_field_icon_color: { type: String, required: true },
    footer_bg_color: { type: String, required: true },
    header_color: { type: String, required: true },
    header_text_color: { type: String, required: true },
    ai_bubble_text_color: { type: String, required: true },
    user_bubble_text_color: { type: String, required: true },
    ai_bubble_border_color: { type: String, required: true },
    user_bubble_border_color: { type: String, required: true },
    user_profile_bg_color: { type: String, required: true },
    ai_profile_bg_color: { type: String, required: true },
    header_separator_color: { type: String, required: true },
    // New granular color properties
    header_icon_color: { type: String, required: true },
    send_btn_color: { type: String, required: true },
    send_btn_icon_color: { type: String, required: true },
    input_placeholder_color: { type: String, required: true },
    timestamp_color: { type: String, required: true },
    search_highlight_color: { type: String, required: true },
    loading_indicator_color: { type: String, required: true },
    footer_text_color: { type: String, required: true },
    success_color: { type: String, required: true },
    header_logo_border_color: { type: String, required: true },
    header_logo_bg_color: { type: String, required: true },
    welcome_text_color: { type: String, required: true },
    suggested_prompt_title_color: { type: String, required: true },
    suggested_prompt_desc_color: { type: String, required: true },
    suggested_prompt_icon_color: { type: String, required: true },
}, { _id: false });

const themeSchema = new Schema<IChatBotTheme>({
    light: { type: themeColorsSchema, required: true },
    dark: { type: themeColorsSchema, required: true },
    msg_bubble_radius: { type: Number, required: true, default: 12 },
    input_radius: { type: Number, required: true, default: 12 },
    header_logo_radius: { type: Number, required: true, default: 8 },
    header_logo_width: { type: Number, required: true, default: 36 },
    header_logo_height: { type: Number, required: true, default: 36 },
    header_logo_border_width: { type: Number, required: true, default: 0 },
    shadow_intensity: { type: String, required: true, enum: ["none", "sm", "md", "lg"], default: "sm" },
    loading_animation_style: { type: String, required: true, enum: ["dot", "wave", "circle"], default: "dot" },
    show_header_separator: { type: Boolean, required: true, default: false },
}, { _id: false });

const chatBotSchema = new Schema<IChatBot>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, "ChatBot name is required"],
            trim: true,
        },
        document_ids: {
            type: [Schema.Types.ObjectId],
            ref: "Document",
            required: [true, "At least one document is required"],
            validate: [(val: mongoose.Types.ObjectId[]) => val.length > 0, "At least one document is required"]
        },
        system_prompt: {
            type: String,
            required: [true, "System prompt is required"],
            trim: true,
        },
        visibility: {
            type: String,
            enum: Object.values(ChatbotVisibilityEnum),
            required: [true, "Visibility is required"],
            default: ChatbotVisibilityEnum.PRIVATE
        },
        shared_with: [{
            type: Schema.Types.ObjectId,
            ref: "User",
        }],
        is_active: {
            type: Boolean,
            default: true,
        },
        llm_config_id: {
            type: Schema.Types.ObjectId,
            ref: "LLMConfig",
            required: [true, "LLM Configuration is required"],
        },
        view_source_documents: {
            type: Boolean,
            required: true,
        },
        temperature: {
            type: Number,
            required: true,
            min: 0,
            max: 2,
        },
        max_tokens: {
            type: Number,
            required: true,
            min: 1,
        },
        theme: {
            type: themeSchema,
            required: true,
        },
        logo: {
            type: String,
            required: [true, "Logo is required"],
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (_, ret: Record<string, unknown>) {
                delete ret.__v;
                delete ret.id; // Remove duplicate id field if present
                
                // Rename document_ids to documents if it contains objects
                if (Array.isArray(ret.document_ids) && ret.document_ids.length > 0 && typeof ret.document_ids[0] === 'object') {
                    ret.documents = ret.document_ids;
                    delete ret.document_ids;
                }
                
                return ret;
            },
        },
        toObject: { virtuals: true }
    }
);

export default mongoose.model<IChatBot>("ChatBot", chatBotSchema);
