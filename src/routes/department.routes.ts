import { Router } from "express";
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
} from "../controllers/department.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// 🔐 Auth required, nothing else
router.post("/", protect, createDepartment);
router.get("/", protect, listDepartments);
router.delete('/:id',protect,deleteDepartment)
export default router;
