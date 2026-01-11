import mongoose, { Document, Schema } from "mongoose";
import { IPermission } from "./Permission.js";

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: mongoose.Types.ObjectId[] | IPermission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [{
      type: Schema.Types.ObjectId,
      ref: "Permission",
    }],
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


export const Role = mongoose.model<IRole>("Role", roleSchema);