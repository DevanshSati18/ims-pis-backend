import { Router } from "express";
import { login, logout, me, registerAdmin } from "../controllers/auth.controller";
import { authLimiter, protect } from "../middlewares/auth.middleware";
import { createUser } from "../controllers/auth.controller";
const router = Router();

router.post("/register-admin", registerAdmin); // only once
router.post("/login", authLimiter,login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/users", protect, createUser);

export default router;
