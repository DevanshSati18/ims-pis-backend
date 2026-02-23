"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInventoryItems = exports.createInventoryItem = void 0;
const inventory_model_1 = __importDefault(require("../models/inventory.model"));
/**
 * ADMIN: create inventory item
 */
const createInventoryItem = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }
        const { name, departmentKey, subDepartmentKey, quantity, } = req.body;
        if (!name ||
            !departmentKey ||
            !subDepartmentKey ||
            quantity === undefined) {
            return res.status(400).json({
                message: "name, departmentKey, subDepartmentKey and quantity are required",
            });
        }
        const item = await inventory_model_1.default.create({
            name,
            departmentKey,
            subDepartmentKey,
            quantity,
        });
        res.status(201).json(item);
    }
    catch (error) {
        console.error("CREATE INVENTORY ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createInventoryItem = createInventoryItem;
/**
 * ADMIN: sees all
 * USER: sees only allowed sub-departments
 */
const listInventoryItems = async (req, res) => {
    try {
        const { departmentKey, subDepartmentKey } = req.query;
        const filter = {};
        if (departmentKey)
            filter.departmentKey = departmentKey;
        if (subDepartmentKey)
            filter.subDepartmentKey = subDepartmentKey;
        // 🔐 USER VISIBILITY ENFORCEMENT
        if (req.user?.role !== "admin") {
            const allowed = req.user?.visibleSubDepartments || [];
            filter.subDepartmentKey = {
                $in: allowed.map((v) => v.split(":")[1]),
            };
        }
        const items = await inventory_model_1.default.find(filter).sort({
            createdAt: -1,
        });
        res.json(items);
    }
    catch (error) {
        console.error("LIST INVENTORY ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.listInventoryItems = listInventoryItems;
