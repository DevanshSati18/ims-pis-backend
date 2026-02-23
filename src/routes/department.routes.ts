import { Router } from "express";
import {
  createDepartment,
  listDepartments,
} from "../controllers/department.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// 🔐 Auth required, nothing else
router.post("/", protect, createDepartment);
router.get("/", protect, listDepartments);

export default router;
