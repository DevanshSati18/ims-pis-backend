import { Router } from "express";
import {
    listUsers,
    getUserById,
    createUser,
    resetPassword,
    updatePermissions,
    updateUserStatus,
} from "../controllers/user.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// 🔐 ADMIN ONLY
router.get("/", protect, listUsers);
router.get("/:id", protect, getUserById);
router.post("/", protect, createUser);
router.post("/:id/reset-password", protect, resetPassword);
router.put("/:id/permissions", protect, updatePermissions);
router.patch("/:id/status", protect, updateUserStatus);

export default router;
