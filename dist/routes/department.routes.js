"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("../controllers/department.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// 🔐 Auth required, nothing else
router.post("/", auth_middleware_1.protect, department_controller_1.createDepartment);
router.get("/", auth_middleware_1.protect, department_controller_1.listDepartments);
exports.default = router;
