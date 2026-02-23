"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({
        backend: "running",
        database: mongoose_1.default.connection.readyState === 1 ? "connected" : "disconnected",
    });
});
exports.default = router;
