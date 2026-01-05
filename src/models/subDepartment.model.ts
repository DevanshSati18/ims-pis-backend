import mongoose from "mongoose";

export interface ISubDepartmentField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "file";
  required: boolean;
}

export interface ISubDepartment {
  departmentKey: string;
  key: string;
  name: string;
  fields: ISubDepartmentField[];
}

const fieldSchema = new mongoose.Schema<ISubDepartmentField>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "number", "date", "boolean", "file"],
      required: true,
    },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const subDepartmentSchema = new mongoose.Schema<ISubDepartment>(
  {
    departmentKey: { type: String, required: true },
    key: { type: String, required: true },
    name: { type: String, required: true },

    fields: {
      type: [fieldSchema],
      default: [],
    },
  },
  { timestamps: true }
);

subDepartmentSchema.index(
  { departmentKey: 1, key: 1 },
  { unique: true }
);

export default mongoose.model<ISubDepartment>(
  "SubDepartment",
  subDepartmentSchema
);
