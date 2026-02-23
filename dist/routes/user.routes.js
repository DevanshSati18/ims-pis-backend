"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// 🔐 ADMIN ONLY
router.get("/", auth_middleware_1.protect, user_controller_1.listUsers);
router.get("/:id", auth_middleware_1.protect, user_controller_1.getUserById);
router.post("/", auth_middleware_1.protect, user_controller_1.createUser);
router.post("/:id/reset-password", auth_middleware_1.protect, user_controller_1.resetPassword);
router.put("/:id/permissions", auth_middleware_1.protect, user_controller_1.updatePermissions);
router.patch("/:id/status", auth_middleware_1.protect, user_controller_1.updateUserStatus);
exports.default = router;
