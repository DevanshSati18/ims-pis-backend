import { Request, Response } from "express";
import Inventory from "../models/inventory.model";

/**
 * ADMIN: create inventory item
 */
export const createInventoryItem = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const {
      name,
      departmentKey,
      subDepartmentKey,
      quantity,
    } = req.body;

    if (
      !name ||
      !departmentKey ||
      !subDepartmentKey ||
      quantity === undefined
    ) {
      return res.status(400).json({
        message:
          "name, departmentKey, subDepartmentKey and quantity are required",
      });
    }

    const item = await Inventory.create({
      name,
      departmentKey,
      subDepartmentKey,
      quantity,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("CREATE INVENTORY ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ADMIN: sees all
 * USER: sees only allowed sub-departments
 */
export const listInventoryItems = async (
  req: Request,
  res: Response
) => {
  try {
    const { departmentKey, subDepartmentKey } = req.query;

    const filter: any = {};

    if (departmentKey) filter.departmentKey = departmentKey;
    if (subDepartmentKey) filter.subDepartmentKey = subDepartmentKey;

    // 🔐 USER VISIBILITY ENFORCEMENT
    if (req.user?.role !== "admin") {
      const allowed = req.user?.visibleSubDepartments || [];

      filter.subDepartmentKey = {
        $in: allowed.map((v) => v.split(":")[1]),
      };
    }

    const items = await Inventory.find(filter).sort({
      createdAt: -1,
    });

    res.json(items);
  } catch (error) {
    console.error("LIST INVENTORY ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
