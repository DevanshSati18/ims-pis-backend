import { Request, Response } from "express";
import SubDepartment from "../models/subDepartment.model";

/**
 * ADMIN: create sub-department with schema
 */
export const createSubDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { departmentKey, key, name, fields } = req.body;

    if (!departmentKey || !key || !name) {
      return res.status(400).json({
        message: "departmentKey, key and name are required",
      });
    }

    // basic field validation
    if (fields) {
      for (const f of fields) {
        if (!f.key || !f.label || !f.type) {
          return res.status(400).json({
            message: "Invalid field definition",
          });
        }
      }
    }

    const subDept = await SubDepartment.create({
      departmentKey,
      key,
      name,
      fields: fields || [],
    });

    res.status(201).json(subDept);
  } catch (error) {
    console.error("CREATE SUB-DEPT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * AUTH: list sub-departments (schema included)
 */
export const listSubDepartments = async (
  req: Request,
  res: Response
) => {
  try {
    const { departmentKey } = req.params;

    const subDepts = await SubDepartment.find({
      departmentKey,
    }).sort({ name: 1 });

    res.json(subDepts);
  } catch (error) {
    console.error("LIST SUB-DEPT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
