import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";

/* LIST USERS */
export const listUsers = async (req: Request, res: Response) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    const users = await User.find().select(
        "_id email role visibleSubDepartments isActive"
    );

    res.json(
        users.map((u) => ({
            id: u._id,
            email: u.email,
            role: u.role,
            visibleSubDepartments: u.visibleSubDepartments || [],
            isActive: u.isActive !== false,
        }))
    );
};

/* GET USER BY ID */
export const getUserById = async (
    req: Request,
    res: Response
) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findById(req.params.id);

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

/* CREATE USER */
export const createUser = async (
    req: Request,
    res: Response
) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            message: "email, password and role are required",
        });
    }

    const exists = await User.findOne({ email });
    if (exists) {
        return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
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

/* RESET PASSWORD */
export const resetPassword = async (
    req: Request,
    res: Response
) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    const { password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(req.params.id, {
        password: hashed,
    });

    res.json({ message: "Password reset" });
};

/* UPDATE PERMISSIONS */
export const updatePermissions = async (
    req: Request,
    res: Response
) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    const { visibleSubDepartments } = req.body;

    await User.findByIdAndUpdate(req.params.id, {
        visibleSubDepartments,
    });

    res.json({ message: "Permissions updated" });
};

/* ENABLE / DISABLE USER */
export const updateUserStatus = async (
    req: Request,
    res: Response
) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    const { isActive } = req.body;

    await User.findByIdAndUpdate(req.params.id, {
        isActive,
    });

    res.json({ message: "User status updated" });
};
