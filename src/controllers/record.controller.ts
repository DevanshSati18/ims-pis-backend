import { Request, Response } from "express";
import Record from "../models/record.model";
import SubDepartment from "../models/subDepartment.model";

/**
 * CREATE RECORD
 * - Admin or allowed user
 * - Validates against sub-department schema
 * - Skips file validation (handled in upload step)
 */
export const createRecord = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { departmentKey, subDepartmentKey, title, data } = req.body;

    if (!departmentKey || !subDepartmentKey || !title || !data) {
      return res.status(400).json({
        message:
          "departmentKey, subDepartmentKey, title and data are required",
      });
    }

    // 🔐 Visibility enforcement (USER only)
    if (req.user.role !== "admin") {
      const allowed = req.user.visibleSubDepartments || [];
      const token = `${departmentKey}:${subDepartmentKey}`;
      if (!allowed.includes(token)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Load sub-department schema
    const subDept = await SubDepartment.findOne({
      departmentKey,
      key: subDepartmentKey,
    });

    if (!subDept) {
      return res
        .status(404)
        .json({ message: "Sub-department not found" });
    }

    // ✅ Validate required NON-FILE fields only
    for (const field of subDept.fields) {
      if (field.type === "file") continue;

      if (
        field.required &&
        (data[field.key] === undefined ||
          data[field.key] === null ||
          data[field.key] === "")
      ) {
        return res.status(400).json({
          message: `Field '${field.label}' is required`,
        });
      }
    }

    const record = await Record.create({
      departmentKey,
      subDepartmentKey,
      title,
      data,
      createdBy: req.user.id,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error("CREATE RECORD ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * LIST RECORDS
 * - Admin sees all
 * - User sees only allowed sub-departments
 */
export const listRecords = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { departmentKey, subDepartmentKey } = req.query;

    const filter: any = {};

    if (departmentKey) filter.departmentKey = departmentKey;
    if (subDepartmentKey) filter.subDepartmentKey = subDepartmentKey;

    // 🔐 Visibility enforcement
    if (req.user.role !== "admin") {
      const allowed = req.user.visibleSubDepartments || [];
      filter.$expr = {
        $in: [
          { $concat: ["$departmentKey", ":", "$subDepartmentKey"] },
          allowed,
        ],
      };
    }

    const records = await Record.find(filter).sort({
      createdAt: -1,
    });

    res.json(records);
  } catch (error) {
    console.error("LIST RECORDS ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * UPLOAD DOCUMENTS FOR A RECORD
 * - Enforces file schema
 * - Enforces required file fields
 */
export const uploadRecordDocuments = async (
  req: any,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { fieldKey } = req.body;

    if (!fieldKey) {
      return res
        .status(400)
        .json({ message: "fieldKey is required" });
    }

    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // 🔐 Visibility enforcement
    if (req.user.role !== "admin") {
      const token = `${record.departmentKey}:${record.subDepartmentKey}`;
      if (!req.user.visibleSubDepartments?.includes(token)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Load schema
    const subDept = await SubDepartment.findOne({
      departmentKey: record.departmentKey,
      key: record.subDepartmentKey,
    });

    if (!subDept) {
      return res.status(404).json({ message: "Schema not found" });
    }

    // Validate field is file type
    const field = subDept.fields.find(
      (f) => f.key === fieldKey && f.type === "file"
    );

    if (!field) {
      return res.status(400).json({
        message: `Invalid file field '${fieldKey}'`,
      });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ message: "No files uploaded" });
    }

    for (const file of files) {
      record.documents.push({
        fieldKey,
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      });
    }

    // ✅ Enforce REQUIRED file fields
    for (const f of subDept.fields) {
      if (f.type === "file" && f.required) {
        const exists = record.documents.some(
          (d) => d.fieldKey === f.key
        );
        if (!exists) {
          return res.status(400).json({
            message: `Required file '${f.label}' is missing`,
          });
        }
      }
    }

    await record.save();
    res.json(record);
  } catch (error) {
    console.error("UPLOAD DOCUMENT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
