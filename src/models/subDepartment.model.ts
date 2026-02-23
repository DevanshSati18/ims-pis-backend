import mongoose from "mongoose";

export interface ISubDepartmentField {
  key: string;
  name: string; // Changed from label
  type: string; // Broadened to accept frontend types
  required: boolean;
  editable: boolean; // Added new property
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
    name: { type: String, required: true }, // Changed from label
    type: {
      type: String,
      // Expanded enum to support frontend's 'integer' and 'string'
      enum: ["string", "text", "integer", "number", "date", "boolean", "file"],
      required: true,
    },
    required: { type: Boolean, default: false },
    editable: { type: Boolean, default: true }, // Added new property
  },
  { _id: false } // Prevents Mongoose from creating separate _id for each field inside the array
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