import { Router } from "express";
import {
  createSubDepartment,
  listSubDepartments,
} from "../controllers/subDepartment.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// 🔐 Auth required only
router.post("/", protect, createSubDepartment);
router.get("/:departmentKey", protect, listSubDepartments);

export default router;
