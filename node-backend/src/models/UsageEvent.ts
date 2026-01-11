import mongoose, { Schema, Document } from "mongoose";

export enum UsageEventType {
    CREATE_DOCUMENT_INDEX = "CREATE_DOCUMENT_INDEX",
    LLM_INPUT = "LLM_INPUT",
    LLM_OUTPUT = "LLM_OUTPUT",
    QUERY_DOCUMENT = "QUERY_DOCUMENT",
}

export interface IUsageEvent extends Document {
    user_id: mongoose.Types.ObjectId;
    provider: string;
    model_name: string;
    token_count: number;
    event_type: UsageEventType;
    created_at: Date;
}

const usageEventSchema = new Schema<IUsageEvent>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        provider: { type: String, required: true },
        model_name: { type: String, required: true },
        token_count: { type: Number, required: true },
        event_type: { 
            type: String, 
            enum: Object.values(UsageEventType), 
            required: true 
        },
        created_at: { type: Date, default: Date.now },
    },
    { timestamps: false } 
);

// Index for aggregation performance
usageEventSchema.index({ created_at: 1 });
usageEventSchema.index({ user_id: 1 });

export const UsageEvent = mongoose.model<IUsageEvent>("UsageEvent", usageEventSchema);
