"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.updatePermissions = exports.resetPassword = exports.createUser = exports.getUserById = exports.listUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
/* LIST USERS */
const listUsers = async (req, res) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    const users = await user_model_1.default.find().select("_id email role visibleSubDepartments isActive");
    res.json(users.map((u) => ({
        id: u._id,
        email: u.email,
        role: u.role,
        visibleSubDepartments: u.visibleSubDepartments || [],
        isActive: u.isActive !== false,
    })));
};
exports.listUsers = listUsers;
/* GET USER BY ID */
const getUserById = async (req, res) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    const user = await user_model_1.default.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({
        id: user._id,
        email: user.email,
        role: user.role,
        visibleSubDepartments: user.visibleSubDepartments || [],
        isActive: user.isActive !== false,
    });
};
exports.getUserById = getUserById;
/* CREATE USER */
const createUser = async (req, res) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({
            message: "email, password and role are required",
        });
    }
    const exists = await user_model_1.default.findOne({ email });
    if (exists) {
        return res.status(409).json({ message: "User already exists" });
    }
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await user_model_1.default.create({
        email,
        password: hashed,
        role,
        visibleSubDepartments: [],
    });
    res.status(201).json({
        id: user._id,
        email: user.email,
        role: user.role,
    });
};
exports.createUser = createUser;
/* RESET PASSWORD */
const resetPassword = async (req, res) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    const { password } = req.body;
    const hashed = await bcryptjs_1.default.hash(password, 10);
    await user_model_1.default.findByIdAndUpdate(req.params.id, {
        password: hashed,
    });
    res.json({ message: "Password reset" });
};
exports.resetPassword = resetPassword;
/* UPDATE PERMISSIONS */
const updatePermissions = async (req, res) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    const { visibleSubDepartments } = req.body;
    await user_model_1.default.findByIdAndUpdate(req.params.id, {
        visibleSubDepartments,
    });
    res.json({ message: "Permissions updated" });
};
exports.updatePermissions = updatePermissions;
/* ENABLE / DISABLE USER */
const updateUserStatus = async (req, res) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    const { isActive } = req.body;
    await user_model_1.default.findByIdAndUpdate(req.params.id, {
        isActive,
    });
    res.json({ message: "User status updated" });
};
exports.updateUserStatus = updateUserStatus;
