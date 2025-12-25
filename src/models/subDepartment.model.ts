import mongoose from "mongoose";

export interface ISubDepartment {
  departmentKey: string;
  name: string;
  key: string;
}

const subDepartmentSchema = new mongoose.Schema<ISubDepartment>(
  {
    departmentKey: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubDepartment>(
  "SubDepartment",
  subDepartmentSchema
);
