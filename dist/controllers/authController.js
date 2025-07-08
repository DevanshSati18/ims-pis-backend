"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupUser = exports.loginUser = void 0;
const pg_1 = require("pg");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const role_1 = require("../types/role");
const pool = new pg_1.Pool(); // Uses DATABASE_URL from .env
const JWT_SECRET = process.env.JWT_SECRET || "mydefaultsecret";
// ✅ LOGIN FUNCTION
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const result = yield pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        const user = result.rows[0];
        if (!user) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: "2h",
        });
        res.status(200).json({ token });
    }
    catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.loginUser = loginUser;
// ✅ SIGNUP FUNCTION
const signupUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role = "STUDENT" } = req.body;
    try {
        const existing = yield pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        if (existing.rows.length > 0) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        const validRoles = [role_1.Role.STUDENT, role_1.Role.TEACHER, role_1.Role.ADMIN];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: "Invalid role" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const insertResult = yield pool.query("INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *", [name, email, hashedPassword, role]);
        const newUser = insertResult.rows[0];
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, {
            expiresIn: "2h",
        });
        res.status(201).json({ token });
    }
    catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.signupUser = signupUser;
