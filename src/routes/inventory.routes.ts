import { Router } from "express";
import {
  createInventoryItem,
  listInventoryItems,
} from "../controllers/inventory.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// 🔐 All inventory routes require auth
router.post("/", protect, createInventoryItem);
router.get("/", protect, listInventoryItems);

export default router;
