import { Request, Response } from "express";
import SubDepartment from "../models/subDepartment.model";

export const createSubDepartment = async (
  req: Request,
  res: Response
) => {
  try {
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

export const listSubDepartments = async (
  req: Request,
  res: Response
) => {
  try {
    const { departmentKey } = req.params;

    const subDepartments = await SubDepartment.find({
      departmentKey,
    }).sort({ name: 1 });

    res.json(subDepartments);
  } catch (error) {
    console.error("LIST SUB-DEPARTMENTS ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
