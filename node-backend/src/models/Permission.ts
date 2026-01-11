import mongoose, { Document, Schema } from "mongoose";
import { ScopeEnum } from "../types/index.js";

export interface IPermission extends Document {
  action: string;
  resource: string;
  scope: ScopeEnum;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      lowercase: true,
    },
    resource: {
      type: String,
      required: [true, "Resource is required"],
      trim: true,
      lowercase: true,
    },
    scope: {
      type: String,
      enum: Object.values(ScopeEnum),
      required: [true, "Scope is required"],
    },
    description: {
      type: String,
      trim: true,
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

permissionSchema.index({ action: 1, resource: 1, scope: 1 }, { unique: true });

export const Permission = mongoose.model<IPermission>("Permission", permissionSchema);