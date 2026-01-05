import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import healthRoutes from "./routes/health.routes";
import departmentRoutes from "./routes/department.routes";
import subDepartmentRoutes from "./routes/subDepartment.routes";
import inventoryRoutes from "./routes/inventory.routes";
import recordRoutes from "./routes/record.routes";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/sub-departments", subDepartmentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/records", recordRoutes);
// Server
const PORT = Number(process.env.PORT) || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
