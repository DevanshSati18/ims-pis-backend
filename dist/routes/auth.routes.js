"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_controller_2 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/register-admin", auth_controller_1.registerAdmin); // only once
router.post("/login", auth_middleware_1.authLimiter, auth_controller_1.login);
router.post("/logout", auth_controller_1.logout);
router.get("/me", auth_middleware_1.protect, auth_controller_1.me);
router.post("/users", auth_middleware_1.protect, auth_controller_2.createUser);
exports.default = router;
