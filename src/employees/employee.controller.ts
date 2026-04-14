import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getAllEmployees, verifyCredentials } from "./employee.service.js";

type EmployeeWithUser = {
  id: number;
  name: string;
  user: { email: string };
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  console.log("Login body:", req.body);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await verifyCredentials(email, password);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "secret";
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error instanceof Error ? error.message : String(error)
    });
  }
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
