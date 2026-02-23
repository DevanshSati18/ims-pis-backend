"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token || token.trim() === "") {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 🔥 LOAD FULL USER FROM DB
        const user = await user_model_1.default.findById(decoded.id).select("role visibleSubDepartments");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        // ✅ Attach FULL user context
        req.user = {
            id: user._id.toString(),
            role: user.role,
            visibleSubDepartments: user.visibleSubDepartments,
        };
        next();
    }
    catch (error) {
        console.error("AUTH ERROR:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.protect = protect;
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 60,
    max: 5,
    message: 'Too many login attempts. Try again later'
});
