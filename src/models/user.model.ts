import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "admin" | "user";
  visibleSubDepartments: string[];
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },
    visibleSubDepartments: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
