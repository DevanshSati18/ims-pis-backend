import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import rateLimit from "express-rate-limit";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token || token.trim() === "") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };

    // 🔥 LOAD FULL USER FROM DB
    const user = await User.findById(decoded.id).select(
      "role visibleSubDepartments"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach FULL user context
    req.user = {
      id: user._id.toString(),
      role: user.role,
      visibleSubDepartments: user.visibleSubDepartments,
    };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
export const authLimiter = rateLimit({
  windowMs : 15*60*60,
  max : 5,
  message : 'Too many login attempts. Try again later'
})