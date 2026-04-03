import path from "path";
import fs from "fs";

export const UPLOAD_PATH =
  process.env.UPLOAD_PATH || path.join(process.cwd(), "uploads");

// Ensure upload dir exists for both local and production environments.
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}
