// scripts/createUser.ts
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// ✅ PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ✅ Values to insert
const email = "admin@example.com";
const plainPassword = "admin123";
const role = "ADMIN"; // Can be 'ADMIN', 'TEACHER', or 'STUDENT'

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id",
      [email, hashedPassword, role]
    );

    console.log(`✅ User created with ID: ${result.rows[0].id}`);
  } catch (err) {
    console.error("❌ Error inserting user:", err);
  } finally {
    await pool.end();
    process.exit();
  }
}

createUser();
