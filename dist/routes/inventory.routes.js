"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// 🔐 All inventory routes require auth
router.post("/", auth_middleware_1.protect, inventory_controller_1.createInventoryItem);
router.get("/", auth_middleware_1.protect, inventory_controller_1.listInventoryItems);
exports.default = router;
