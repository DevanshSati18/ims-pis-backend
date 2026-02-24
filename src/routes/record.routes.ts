// import { Router } from "express";
// import {
//   createRecord,
//   deleteRecord,
//   listRecords,
//   updateRecord,
// } from "../controllers/record.controller";
// import { protect } from "../middlewares/auth.middleware";

// const router = Router();

// router.post("/", protect, createRecord);
// router.get("/", protect, listRecords);
// router.put("/:id", protect, updateRecord);
// router.delete("/:id", protect, deleteRecord);
// export default router;
import { Router } from "express";
import {
  createRecord,
  deleteRecord,
  listRecords,
  updateRecord,
  uploadRecordDocuments, // 👈 1. IMPORT THIS
} from "../controllers/record.controller";
import { protect } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middelwares"; // 👈 2. IMPORT MULTER

const router = Router();

router.post("/", protect, createRecord);
router.get("/", protect, listRecords);

// 👈 FIXED: Changed to .patch to match your frontend Redux api.patch()
router.patch("/:id", protect, updateRecord); 

router.delete("/:id", protect, deleteRecord);

// 👈 3. ADD THE UPLOAD ROUTE (Must match formData.append("files") from frontend)
router.post("/:id/documents", protect, upload.array("files"), uploadRecordDocuments);

export default router;