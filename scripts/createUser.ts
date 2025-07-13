// scripts/createUser.ts
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/user";

dotenv.config();

const email = "admin@example.com";
const plainPassword = "admin123";
const role = "ADMIN"; // "ADMIN", "TEACHER", or "STUDENT"

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
    });

    console.log(`✅ User created with ID: ${newUser._id}`);
  } catch (err: any) {
    if (err.code === 11000) {
      console.error("⚠️  User already exists");
    } else {
      console.error("❌ Error:", err);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createUser();
