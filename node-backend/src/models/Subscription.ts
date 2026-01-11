import mongoose, { Schema, Document } from "mongoose";
import { IPlan } from "./Plan.js";

export enum SubscriptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
}

export interface ISubscription extends Document {
    user_id: mongoose.Types.ObjectId;
    plan_id: mongoose.Types.ObjectId;
    start_date: Date;
    end_date: Date;
    status: SubscriptionStatus;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISubscriptionWithUsageQuotasAndPlan extends Omit<ISubscription, 'plan_id'> {
    plan: IPlan;
    usage_quotas: {
        max_chatbot_count: number;
        used_chatbot_count: number;
        max_document_count: number;
        used_document_count: number;
        max_word_count_per_document: number;
        max_chatbot_shares: number;
        used_chatbot_shares: number;
        is_public_chatbot_allowed: boolean;
    };
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        plan_id: {
            type: Schema.Types.ObjectId,
            ref: "Plan",
            required: true,
        },
        start_date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        end_date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(SubscriptionStatus),
            default: SubscriptionStatus.ACTIVE,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (_, ret: Record<string, unknown>) {
                delete ret.__v;
                return ret;
            },
            virtuals: true,
        },
        toObject: { virtuals: true }
    }
);

// Optional virtual for easy boolean check
subscriptionSchema.virtual('isValid').get(function() {
    return this.status === SubscriptionStatus.ACTIVE && this.end_date > new Date();
});

// Middleware: Check expiration on any find/read
const checkExpiration = async function (docs: ISubscription | ISubscription[] | null) {
    if (!docs) return;

    const now = new Date();
    const updateExpired = async (doc: ISubscription & Document) => {
        if (doc.status === SubscriptionStatus.ACTIVE && new Date(doc.end_date) < now) {
            doc.status = SubscriptionStatus.EXPIRED;
            await doc.save();
        }
    };

    if (Array.isArray(docs)) {
        await Promise.all(docs.map(doc => updateExpired(doc)));
    } else {
        await updateExpired(docs);
    }
};

// Register middleware
subscriptionSchema.post('find', checkExpiration);
subscriptionSchema.post('findOne', checkExpiration);

export default mongoose.model<ISubscription>("Subscription", subscriptionSchema);
