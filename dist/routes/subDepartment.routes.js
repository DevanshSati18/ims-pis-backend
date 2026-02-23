"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subDepartment_controller_1 = require("../controllers/subDepartment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// 🔐 Auth required only
router.post("/", auth_middleware_1.protect, subDepartment_controller_1.createSubDepartment);
router.get("/:departmentKey", auth_middleware_1.protect, subDepartment_controller_1.listSubDepartments);
exports.default = router;
