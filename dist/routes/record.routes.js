"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const record_controller_1 = require("../controllers/record.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.protect, record_controller_1.createRecord);
router.get("/", auth_middleware_1.protect, record_controller_1.listRecords);
exports.default = router;
