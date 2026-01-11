import mongoose, { Schema, Document as MongoDocument } from "mongoose";
import { LLMProviderEnum } from "../types/enums.js";

export interface ILLMConfig extends MongoDocument {
    user_id: mongoose.Types.ObjectId;
    model_name: string;
    provider: LLMProviderEnum;
    api_key?: string;
    base_url?: string;
    created_at: Date;
    updated_at: Date;
}

const LLMConfigSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        model_name: { type: String, required: true },
        provider: {
            type: String,
            enum: Object.values(LLMProviderEnum),
            required: true,
            default: LLMProviderEnum.OPENAI
        },
        api_key: { type: String, required: false },
        base_url: { type: String, required: false },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Index for efficient querying
LLMConfigSchema.index({ user_id: 1 });

export default mongoose.model<ILLMConfig>("LLMConfig", LLMConfigSchema);
