import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    backend: "running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

export default router;
