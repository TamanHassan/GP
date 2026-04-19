﻿import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  getAllEmployees,
  verifyCredentials,
  createEmployee as createEmployeeService,
  deleteEmployee as deleteEmployeeService,
  deleteUser as deleteUserService,
} from "./employee.service.js";

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
    const users = await getAllEmployees();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  try {
    const employee = await createEmployeeService({ name, email, password });
    res.status(201).json(employee);
  } catch (error) {
    console.error("Create employee error:", error);
    const message = error instanceof Error ? error.message : "Failed to create employee";
    res.status(400).json({ message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID must be a number" });
  }

  try {
    await deleteUserService(id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(400).json({ message: error instanceof Error ? error.message : "Failed to delete user" });
  }
};