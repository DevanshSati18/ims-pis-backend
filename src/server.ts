import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import fs from "fs";

import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import healthRoutes from "./routes/health.routes";
import departmentRoutes from "./routes/department.routes";
import subDepartmentRoutes from "./routes/subDepartment.routes";
import inventoryRoutes from "./routes/inventory.routes";
import recordRoutes from "./routes/record.routes";
import userRoutes from "./routes/user.routes";
import { globalLimiter } from "./middlewares/rateLimiter";
import { UPLOAD_PATH } from "./config/storage";

dotenv.config();
connectDB();

const app = express();

// If behind reverse proxy (e.g. nginx, cloud load balancer), trust X-Forwarded-* headers.
app.set("trust proxy", 1);

/* ========================
   CONFIG
======================== */
const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Origin:", origin); // DEBUG

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// upload directory is managed by src/config/storage.ts to keep config consistent
const uploadPath = UPLOAD_PATH;

/* ========================
   ENSURE UPLOAD DIR
======================== */
// Already created in storage.ts, this is just a safety net.
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* ========================
   MIDDLEWARE
======================== */
app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(globalLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

/* ========================
   STATIC FILES
======================== */
app.use("/uploads", express.static(uploadPath));

/* ========================
   ROUTES
======================== */
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/sub-departments", subDepartmentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/users", userRoutes);

/* ========================
   SERVER
======================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});