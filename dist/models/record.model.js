"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const documentSchema = new mongoose_1.default.Schema({
    fieldKey: { type: String, required: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: false });
const recordSchema = new mongoose_1.default.Schema({
    departmentKey: { type: String, required: true, index: true },
    subDepartmentKey: { type: String, required: true, index: true },
    title: { type: String, required: true },
    data: { type: mongoose_1.default.Schema.Types.Mixed, required: true },
    documents: {
        type: [documentSchema],
        default: [],
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
recordSchema.index({ departmentKey: 1, subDepartmentKey: 1 });
exports.default = mongoose_1.default.model("Record", recordSchema);
