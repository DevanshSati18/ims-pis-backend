import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { Pool } from "pg";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ✅ PostgreSQL connection setup using pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g., "postgres://user:password@localhost:5432/dbname"
});

// Test DB connection
pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL connection error", err));

// Make pool accessible throughout your app (optional)
export { pool };

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
