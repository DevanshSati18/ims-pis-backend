"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDepartments = exports.createDepartment = void 0;
const department_model_1 = __importDefault(require("../models/department.model"));
const createDepartment = async (req, res) => {
    try {
        // 🔐 ADMIN ONLY
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }
        const { name, key } = req.body;
        if (!name || !key) {
            return res
                .status(400)
                .json({ message: "name and key are required" });
        }
        const department = await department_model_1.default.create({ name, key });
        res.status(201).json(department);
    }
    catch (error) {
        console.error("CREATE DEPARTMENT ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createDepartment = createDepartment;
const listDepartments = async (_req, res) => {
    try {
        const departments = await department_model_1.default.find().sort({ name: 1 });
        res.json(departments);
    }
    catch (error) {
        console.error("LIST DEPARTMENTS ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.listDepartments = listDepartments;
