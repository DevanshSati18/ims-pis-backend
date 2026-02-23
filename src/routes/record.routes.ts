import { Router } from "express";
import {
  createRecord,
  deleteRecord,
  listRecords,
  updateRecord,
} from "../controllers/record.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, createRecord);
router.get("/", protect, listRecords);
router.put("/:id", protect, updateRecord);
router.delete("/:id", protect, deleteRecord);
export default router;
