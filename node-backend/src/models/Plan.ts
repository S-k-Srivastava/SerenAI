import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
    name: string;
    description: string;
    price: number;
    currency: string;
    duration: number; // e.g., 30 for monthly
    discountPercentage: number;
    discountOfferTitle?: string;

    // Limits
    max_chatbot_count: number;
    max_chatbot_shares: number;
    max_document_count: number;
    max_word_count_per_document: number;
    is_public_chatbot_allowed: boolean;
    benefits: string[];

    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
    {
        name: {
            type: String,
            required: [true, "Plan name is required"],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: 0,
        },
        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            required: true,
        },
        duration: {
            type: Number,
            default: 30, // Default to monthly
            min: 1,
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        discountOfferTitle: {
            type: String,
            trim: true,
        },
        max_chatbot_count: {
            type: Number,
            required: true,
            min: 0,
            default: 5,
        },
        max_chatbot_shares: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        max_document_count: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        max_word_count_per_document: {
            type: Number,
            required: true,
            min: 0,
            default: 5000,
        },
        is_public_chatbot_allowed: {
            type: Boolean,
            default: false,
        },
        benefits: {
            type: [String],
            required: [true, "Benefits are required"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (_, ret: Record<string, unknown>) {
                delete ret.__v;
                return ret;
            },
        },
    }
);

export default mongoose.model<IPlan>("Plan", planSchema);
