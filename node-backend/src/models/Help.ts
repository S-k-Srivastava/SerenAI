import mongoose, { Schema, Document } from "mongoose";
import { HelpStatusEnum, RoleEnum } from "../types/index.js";

export interface IHelpMessage {
  role: RoleEnum;
  content: string;
  createdAt: Date;
}

export interface IHelp extends Document {
  user_id: mongoose.Types.ObjectId;
  subject: string;
  body: string; // Initial description
  status: HelpStatusEnum;
  messages: IHelpMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const helpSchema = new Schema<IHelp>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      trim: true,
      maxlength: [2000, "Body cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(HelpStatusEnum),
      default: HelpStatusEnum.SUBMITTED,
      index: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: Object.values(RoleEnum),
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

// Indexes
helpSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IHelp>("Help", helpSchema);
