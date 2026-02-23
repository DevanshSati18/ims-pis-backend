import mongoose from "mongoose";

export interface IRecordDocument {
  fieldKey: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface IRecord {
  departmentKey: string;
  subDepartmentKey: string;
  title: string;

  data: Record<string, any>;
  documents: IRecordDocument[];

  createdBy: mongoose.Types.ObjectId;
}

const documentSchema = new mongoose.Schema<IRecordDocument>(
  {
    fieldKey: { type: String, required: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const recordSchema = new mongoose.Schema<IRecord>(
  {
    departmentKey: { type: String, required: true, index: true },
    subDepartmentKey: { type: String, required: true, index: true },
    title: { type: String, required: true },

    data: { type: mongoose.Schema.Types.Mixed, required: true },

    documents: {
      type: [documentSchema],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

recordSchema.index({ departmentKey: 1, subDepartmentKey: 1 });

export default mongoose.model<IRecord>("Record", recordSchema);
