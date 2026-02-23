import mongoose from "mongoose";

export interface IInventory {
  name: string;
  departmentKey: string;
  subDepartmentKey: string;
  quantity: number;
}

const inventorySchema = new mongoose.Schema<IInventory>(
  {
    name: {
      type: String,
      required: true,
    },

    departmentKey: {
      type: String,
      required: true,
    },

    subDepartmentKey: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInventory>(
  "Inventory",
  inventorySchema
);
