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

    // Dynamic field validation
    if (fields && Array.isArray(fields)) {
      for (const f of fields) {
        // Changed validation to look for f.name instead of f.label
        if (!f.key || !f.name || !f.type) {
          return res.status(400).json({
            message: "Invalid field definition: key, name, and type are required for all fields.",
          });
        }
      }
    }

    const subDept = await SubDepartment.create({
      departmentKey,
      key,
      name,
      fields: fields || [], // Injects the dynamic array directly into DB
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
/**
 * AUTH: Get a single sub-department's details by ID
 */
export const getSubDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const subDept = await SubDepartment.findById(id);

    if (!subDept) {
      return res.status(404).json({ message: "Sub-department not found" });
    }

    res.json(subDept);
  } catch (error) {
    console.error("GET SUB-DEPT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ADMIN: Update a sub-department and its fields
 */
export const updateSubDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    // 🔐 ADMIN ONLY
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const { name, key, fields } = req.body;

    // Dynamic field validation (if fields are being updated)
    if (fields && Array.isArray(fields)) {
      for (const f of fields) {
        if (!f.key || !f.name || !f.type) {
          return res.status(400).json({
            message: "Invalid field definition: key, name, and type are required for all fields.",
          });
        }
      }
    }

    // Update document and return the new version ({ new: true })
    const updatedSubDept = await SubDepartment.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(name && { name }),
          ...(key && { key }),
          ...(fields && { fields }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedSubDept) {
      return res.status(404).json({ message: "Sub-department not found" });
    }

    res.json(updatedSubDept);
  } catch (error) {
    // Handle Mongoose duplicate key error (if admin tries to use a key that already exists)
    if (error instanceof Error && (error as any).code === 11000) {
      return res.status(400).json({ message: "Sub-department key must be unique within this department." });
    }
    
    console.error("UPDATE SUB-DEPT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};