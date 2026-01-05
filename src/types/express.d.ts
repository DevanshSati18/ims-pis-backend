import { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: IUser["role"];
        visibleSubDepartments?: string[];
      };
    }
  }
}

export {};
