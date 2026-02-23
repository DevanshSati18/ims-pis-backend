"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSubDepartments = exports.createSubDepartment = void 0;
const subDepartment_model_1 = __importDefault(require("../models/subDepartment.model"));
/**
 * ADMIN: create sub-department with schema
 */
const createSubDepartment = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }
        const { departmentKey, key, name, fields } = req.body;
        if (!departmentKey || !key || !name) {
            return res.status(400).json({
                message: "departmentKey, key and name are required",
            });
        }
        // basic field validation
        if (fields) {
            for (const f of fields) {
                if (!f.key || !f.label || !f.type) {
                    return res.status(400).json({
                        message: "Invalid field definition",
                    });
                }
            }
        }
        const subDept = await subDepartment_model_1.default.create({
            departmentKey,
            key,
            name,
            fields: fields || [],
        });
        res.status(201).json(subDept);
    }
    catch (error) {
        console.error("CREATE SUB-DEPT ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createSubDepartment = createSubDepartment;
/**
 * AUTH: list sub-departments (schema included)
 */
const listSubDepartments = async (req, res) => {
    try {
        const { departmentKey } = req.params;
        const subDepts = await subDepartment_model_1.default.find({
            departmentKey,
        }).sort({ name: 1 });
        res.json(subDepts);
    }
    catch (error) {
        console.error("LIST SUB-DEPT ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.listSubDepartments = listSubDepartments;
