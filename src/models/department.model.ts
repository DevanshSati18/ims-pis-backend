import mongoose from "mongoose";

export interface IDepartment {
  name: string;
  key: string;
}

const departmentSchema = new mongoose.Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDepartment>(
  "Department",
  departmentSchema
);
