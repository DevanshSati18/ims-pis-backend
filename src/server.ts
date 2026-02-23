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
import userRoutes from "./routes/user.routes";
import { globalLimiter } from "./middlewares/rateLimiter";
import helmet from "helmet";

dotenv.config();
connectDB();

const app = express();
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.disable("x-powered-by");

app.use(cors(corsOptions));
// app.options("/:any*", cors(corsOptions));

app.use(helmet());

app.use(globalLimiter);
// Middleware

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/sub-departments", subDepartmentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/uploads", express.static("src/uploads"));
app.use("/api/users", userRoutes);

// Server
const PORT = Number(process.env.PORT) || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
