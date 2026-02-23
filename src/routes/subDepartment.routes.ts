import { Router } from "express";
import {
  createSubDepartment,
  getSubDepartment,
  listSubDepartments,
  updateSubDepartment,
} from "../controllers/subDepartment.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// 🔐 Auth required only
router.post("/", protect, createSubDepartment);
router.get("/:departmentKey", protect, listSubDepartments);
router.get("/:id", protect, getSubDepartment);          // Show details
router.put("/:id", protect, updateSubDepartment);       // Update
export default router;
