import mongoose from "mongoose";

/**
 * Safely extracts a string ID from a Mongoose field that might be an ObjectId or a populated object.
 * This avoids the use of 'any' for type casting.
 */
export function extractId(field: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId } | string): string {
  if (!field) return "";

  if (typeof field === "string") {
    return field;
  }

  if (field instanceof mongoose.Types.ObjectId) {
    return field.toString();
  }

  // Handle populated objects
  if (typeof field === "object" && "_id" in field) {
    const populated = field as { _id: mongoose.Types.ObjectId };
    return populated._id.toString();
  }

  return String(field);
}
