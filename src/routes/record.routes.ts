import { Router } from "express";
import {
  createRecord,
  listRecords,
} from "../controllers/record.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, createRecord);
router.get("/", protect, listRecords);

export default router;
