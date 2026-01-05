import { Request, Response } from "express";
import SubDepartment from "../models/subDepartment.model";

/**
 * ADMIN: create sub-department
 */
export const createSubDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    // 🔐 ADMIN ONLY
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { departmentKey, name, key } = req.body;

    if (!departmentKey || !name || !key) {
      return res.status(400).json({
        message: "departmentKey, name and key are required",
      });
    }

    const subDepartment = await SubDepartment.create({
      departmentKey,
      name,
      key,
    });

    res.status(201).json(subDepartment);
  } catch (error) {
    console.error("CREATE SUB-DEPARTMENT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ADMIN: sees all
 * USER: sees only assigned sub-departments
 */
export const listSubDepartments = async (
  req: Request,
  res: Response
) => {
  try {
    const { departmentKey } = req.params;

    // 🟢 ADMIN → FULL ACCESS
    if (req.user?.role === "admin") {
      const subDepartments = await SubDepartment.find({
        departmentKey,
      }).sort({ name: 1 });

      return res.json(subDepartments);
    }

    // 👤 USER → FILTERED ACCESS
    const allowed = req.user?.visibleSubDepartments || [];

    /**
     * visibleSubDepartments format:
     * ["fire:equipment", "electrical:panel"]
     */
    const allowedKeys = allowed
      .filter((v) => v.startsWith(`${departmentKey}:`))
      .map((v) => v.split(":")[1]);

    // If user has no access, return empty array (NOT 403)
    if (allowedKeys.length === 0) {
      return res.json([]); 
    }

    const subDepartments = await SubDepartment.find({
      departmentKey,
      key: { $in: allowedKeys },
    }).sort({ name: 1 });

    res.json(subDepartments);
  } catch (error) {
    console.error("LIST SUB-DEPARTMENTS ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
