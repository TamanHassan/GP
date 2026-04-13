import type { Request, Response } from "express";
import { getAllEmployees } from "./employee.service.js";

type EmployeeWithUser = {
  id: number;
  name: string;
  user: { email: string };
};

export const fetchEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await getAllEmployees();

    const formatted = employees.map((emp: EmployeeWithUser) => ({
      id: emp.id,
      name: emp.name,
      email: emp.user.email
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};