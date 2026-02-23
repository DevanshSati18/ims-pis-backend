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
          message: `Field '${field.name}' is required`,
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
            message: `Required file '${f.name}' is missing`,
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

import fs from "fs";
import path from "path";

/**
 * UPDATE RECORD
 * - Admin or allowed user
 * - Validates new data against sub-department schema
 */
export const updateRecord = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, data } = req.body;

    const record = await Record.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // 🔐 Visibility enforcement (USER only)
    if (req.user.role !== "admin") {
      const token = `${record.departmentKey}:${record.subDepartmentKey}`;
      if (!req.user.visibleSubDepartments?.includes(token)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // If updating the dynamic data, validate it against the schema
    if (data) {
      const subDept = await SubDepartment.findOne({
        departmentKey: record.departmentKey,
        key: record.subDepartmentKey,
      });

      if (!subDept) {
        return res.status(404).json({ message: "Sub-department schema not found" });
      }

      // ✅ Validate required NON-FILE fields
      for (const field of subDept.fields) {
        if (field.type === "file") continue;

        if (
          field.required &&
          (data[field.key] === undefined ||
            data[field.key] === null ||
            data[field.key] === "")
        ) {
          // Note: using field.name or field.label depending on your exact schema iteration
          return res.status(400).json({
            message: `Field '${field.name}' is required`,
          });
        }
      }

      // Update the data object
      record.data = data;
      // ⚠️ Required for Mongoose Schema.Types.Mixed when updating object properties directly
      record.markModified("data"); 
    }

    if (title) record.title = title;

    await record.save();

    res.json(record);
  } catch (error) {
    console.error("UPDATE RECORD ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE RECORD
 * - Admin or allowed user
 * - Cleans up associated files from the file system
 */
export const deleteRecord = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const record = await Record.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // 🔐 Visibility enforcement (USER only)
    if (req.user.role !== "admin") {
      const token = `${record.departmentKey}:${record.subDepartmentKey}`;
      if (!req.user.visibleSubDepartments?.includes(token)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // 🧹 Delete associated files from the file system
    if (record.documents && record.documents.length > 0) {
      for (const doc of record.documents) {
        // Adjust the path below if your upload directory is located elsewhere
        const filePath = path.join(__dirname, "../../src/uploads", doc.fileName);
        
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error(`Failed to delete file: ${filePath}`, err);
          }
        });
      }
    }

    // Delete the record from the database
    await Record.findByIdAndDelete(id);

    res.json({ message: "Record and associated files deleted successfully", id });
  } catch (error) {
    console.error("DELETE RECORD ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};