import mongoose, { Schema, Document } from "mongoose";

export interface IUsageQuota extends Document {
    subscription_id: mongoose.Types.ObjectId;
    max_chatbot_count: number;
    max_chatbot_shares: number;
    max_document_count: number;
    max_word_count_per_document: number;
    is_public_chatbot_allowed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UsageQuotaSchema = new Schema<IUsageQuota>({
    subscription_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Subscription', 
        required: true, 
        unique: true,
        index: true 
    },
    max_chatbot_count: { 
        type: Number, 
        required: true, 
        min: 0, 
        default: 5 
    },
    max_chatbot_shares: { 
        type: Number, 
        required: true, 
        min: 0, 
        default: 0 
    },
    max_document_count: { 
        type: Number, 
        required: true, 
        min: 0, 
        default: 0 
    },
    max_word_count_per_document: { 
        type: Number, 
        required: true, 
        min: 0, 
        default: 5000 
    },
    is_public_chatbot_allowed: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

export default mongoose.model<IUsageQuota>('UsageQuota', UsageQuotaSchema);
