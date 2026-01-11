import mongoose, { Schema, Document as MongoDocument } from "mongoose";

export enum DocumentVisibilityEnum {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}

export interface IDocument extends MongoDocument {
    name: string;
    user_id: mongoose.Types.ObjectId;
    metadata: {
        chunk_count: number;
        status: "indexed" | "pending" | "failed";
    };
    description: string;
    labels: string[];
    visibility: DocumentVisibilityEnum;
    created_at: Date;
    updated_at: Date;
}

const DocumentSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        metadata: {
            type: {
                chunk_count: { type: Number, default: 0 },
                status: {
                    type: String,
                    enum: ["indexed", "pending", "failed"],
                    default: "pending",
                },
            },
            required: true
        },
        description: { type: String, required: true },
        labels: { type: [String], index: true, default: [] },
        visibility: {
            type: String,
            enum: Object.values(DocumentVisibilityEnum),
            required: true,
            default: DocumentVisibilityEnum.PRIVATE
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model<IDocument>("Document", DocumentSchema);
