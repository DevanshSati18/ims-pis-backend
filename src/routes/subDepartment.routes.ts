import { Router } from "express";
import {
  createSubDepartment,
  getSubDepartment,
  listSubDepartments,
  updateSubDepartment,
  deleteSubDepartment,
} from "../controllers/subDepartment.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// 🔐 Auth required only
router.post("/", protect, createSubDepartment);
router.get("/:departmentKey", protect, listSubDepartments);
router.get("/:id", protect, getSubDepartment);          // Show details
router.put("/:id", protect, updateSubDepartment);       // Update
// It MUST look exactly like this to match the frontend call
router.delete("/:departmentKey/:key", protect, deleteSubDepartment);
export default router;
