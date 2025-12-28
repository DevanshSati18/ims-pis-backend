import { Request, Response } from "express";
import Department from "../models/department.model";

export const createDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    // 🔐 ADMIN ONLY
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { name, key } = req.body;

    if (!name || !key) {
      return res
        .status(400)
        .json({ message: "name and key are required" });
    }

    const department = await Department.create({ name, key });

    res.status(201).json(department);
  } catch (error) {
    console.error("CREATE DEPARTMENT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listDepartments = async (
  _req: Request,
  res: Response
) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    console.error("LIST DEPARTMENTS ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
