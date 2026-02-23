"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fieldSchema = new mongoose_1.default.Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
        type: String,
        enum: ["text", "number", "date", "boolean", "file"],
        required: true,
    },
    required: { type: Boolean, default: false },
}, { _id: false });
const subDepartmentSchema = new mongoose_1.default.Schema({
    departmentKey: { type: String, required: true },
    key: { type: String, required: true },
    name: { type: String, required: true },
    fields: {
        type: [fieldSchema],
        default: [],
    },
}, { timestamps: true });
subDepartmentSchema.index({ departmentKey: 1, key: 1 }, { unique: true });
exports.default = mongoose_1.default.model("SubDepartment", subDepartmentSchema);
