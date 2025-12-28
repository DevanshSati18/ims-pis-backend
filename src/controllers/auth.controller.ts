import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const createToken = (id: string, role: string) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );
};

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({ message: "Admin created successfully" });
  } catch {
    // Do NOT expose internal error details
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user._id.toString(), user.role);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true in production (HTTPS)
    });

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (_: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

export const me = (req: Request, res: Response) => {
  res.json(req.user);
};


export const createUser = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "email, password and role are required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
