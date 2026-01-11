import mongoose, { Schema, Document } from "mongoose";
import { ContactUsStatusEnum } from "../types/index.js";

export interface IContactUs extends Document {
  subject: string;
  email: string;
  body: string;
  status: ContactUsStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

const contactUsSchema = new Schema<IContactUs>(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    body: {
      type: String,
      required: [true, "Message body is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(ContactUsStatusEnum),
      default: ContactUsStatusEnum.SUBMITTED,
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

// Index for faster queries
contactUsSchema.index({ status: 1, createdAt: -1 });
contactUsSchema.index({ email: 1 });

export default mongoose.model<IContactUs>("ContactUs", contactUsSchema);
