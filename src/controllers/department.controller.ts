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
};/* DELETE DEPARTMENT */
export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        // 1. Grab the "key" (e.g. "hospital") from the URL parameters
        // Note: Even if your route says '/:id', req.params.id will hold "hospital"
        const departmentKey = req.params.id; 

        // 2. Find and delete using 'key' instead of '_id'
        const deletedDepartment = await Department.findOneAndDelete({ key: departmentKey });

        if (!deletedDepartment) {
            return res.status(404).json({ message: "Department not found" });
        }

        // OPTIONAL BUT RECOMMENDED: 
        // If you have a SubDepartment model, you might want to delete all sub-departments 
        // that belong to this department so they don't become "orphaned" in your database.
        // await SubDepartment.deleteMany({ departmentKey: departmentKey });
        // await Record.deleteMany({ departmentKey: departmentKey });

        res.json({ message: "Department deleted successfully", key: departmentKey });

    } catch (error) {
        console.error("DELETE DEPARTMENT ERROR:", error);
        res.status(500).json({ message: "Server error while deleting department" });
    }
};