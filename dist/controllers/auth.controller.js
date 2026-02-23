"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.me = exports.logout = exports.login = exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const createToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;
        if (!email || !password || !name || !mobile) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await user_model_1.default.create({
            name,
            mobile,
            email,
            password: hashedPassword,
            role: "admin",
        });
        res.status(201).json({ message: "Admin created successfully" });
    }
    catch {
        // Do NOT expose internal error details
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.registerAdmin = registerAdmin;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email & password required" });
        }
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = createToken(user._id.toString(), user.role);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false, // set true in production (HTTPS)
        });
        res.json({
            id: user._id,
            email: user.email,
            role: user.role,
        });
    }
    catch {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.login = login;
const logout = (_req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0), // 🔥 FORCE EXPIRY
        sameSite: "lax",
        secure: false, // must match login cookie
    });
    res.status(200).json({ message: "Logged out successfully" });
};
exports.logout = logout;
const me = (req, res) => {
    res.json(req.user);
};
exports.me = me;
const createUser = async (req, res) => {
    try {
        // 🔐 Admin only
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }
        const { email, password, role, visibleSubDepartments } = req.body;
        // 🔍 Basic validation
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "email, password and role are required",
            });
        }
        // 🔁 Check existing user
        const exists = await user_model_1.default.findOne({ email });
        if (exists) {
            return res.status(409).json({ message: "User already exists" });
        }
        // 🔐 Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // ✅ Create user with visibility rules
        const user = await user_model_1.default.create({
            email,
            password: hashedPassword,
            role,
            visibleSubDepartments: Array.isArray(visibleSubDepartments)
                ? visibleSubDepartments
                : [],
        });
        // 📤 Response (never return password)
        res.status(201).json({
            id: user._id,
            email: user.email,
            role: user.role,
            visibleSubDepartments: user.visibleSubDepartments,
        });
    }
    catch (error) {
        console.error("CREATE USER ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createUser = createUser;
