import express from "express";
import { loginUser } from "../controllers/authController";

const router = express.Router();

// ✅ These must be functions: (req, res) => ...
router.post("/login", loginUser);


export default router;
