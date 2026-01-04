import mongoose from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  visibleSubDepartments: string[]; // e.g. ["fire:equipment"]
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // 🔐 VISIBILITY RULES
    visibleSubDepartments: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
