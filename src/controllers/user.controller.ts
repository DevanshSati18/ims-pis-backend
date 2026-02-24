import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";

/* LIST USERS */
export const listUsers = async (req: Request, res: Response) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    // Retrieves mobile along with other fields
    const users = await User.find().select(
        "_id email role mobile visibleSubDepartments isActive"
    );

    res.json(
        users.map((u) => ({
            id: u._id,
            email: u.email,
            role: u.role,
            mobile: u.mobile, // Maps it to frontend
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
    // Allows admins OR the user requesting their own profile
    if (req.user?.role !== "admin" && req.user?.id !== req.params.id) {
        return res.status(403).json({ message: "Not authorized to view this profile" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({
        id: user._id,
        email: user.email,
        role: user.role,
        mobile: user.mobile, // Included in single fetch
        visibleSubDepartments: user.visibleSubDepartments || [],
        isActive: user.isActive !== false,
    });
};

/* CREATE USER */
/* CREATE USER */
export const createUser = async (
    req: Request,
    res: Response
) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    // EXTRACT NAME ALONG WITH OTHERS
    const { name, email, password, role, mobile } = req.body;

    // VALIDATE NAME IS INCLUDED
    if (!name || !email || !password || !role || !mobile) {
        return res.status(400).json({
            message: "Name, email, password, role, and mobile are required",
        });
    }

    const exists = await User.findOne({ email });
    if (exists) {
        return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,      // SAVE NAME
        email,
        password: hashed,
        role,
        mobile,    // SAVE MOBILE
        visibleSubDepartments: [],
    });

    res.status(201).json({
        id: user._id,
        name: user.name, // SEND NAME BACK
        email: user.email,
        role: user.role,
        mobile: user.mobile,
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
/* USER CAN CHANGE THEIR OWN PASSWORD */
export const changeOwnPassword = async (req: Request, res: Response) => {
    try {
        // req.user comes from the protect middleware
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        // Update the password for the currently logged-in user
        await User.findByIdAndUpdate(req.user.id, {
            password: hashed,
        });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Server error while changing password" });
    }
};