import mongoose, { Schema, Document as MongoDocument } from "mongoose";

export interface IMessage {
    role: "user" | "assistant";
    content: string;
    chunk_ids?: string[];
    timestamp: Date;
}

export interface IConversation extends MongoDocument {
    user_id: mongoose.Types.ObjectId;
    chatbot_id: mongoose.Types.ObjectId;
    title?: string;
    messages: IMessage[];
    last_message_at: Date;
    created_at: Date;
    updated_at: Date;
}

const ConversationSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        chatbot_id: { type: Schema.Types.ObjectId, ref: "ChatBot", required: true },
        title: { type: String, default: "" },
        messages: [
            {
                role: { type: String, enum: ["user", "assistant", "system"], required: true },
                content: { type: String, required: true },
                chunk_ids: [{ type: String }],
                timestamp: { type: Date, default: Date.now },
            },
        ],
        last_message_at: { type: Date, default: Date.now },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toJSON: {
            virtuals: true,
            transform: function (_, ret: Record<string, unknown>) {
                delete ret.__v;
                delete ret.id;
                return ret;
            },
        },
        toObject: { virtuals: true },
    }
);

// Index for verifying ownership and retrieving history efficiently
ConversationSchema.index({ user_id: 1, chatbot_id: 1 });

export default mongoose.model<IConversation>("Conversation", ConversationSchema);
