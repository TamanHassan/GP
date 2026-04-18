import express from "express";
import {
  fetchEmployees,
  login,
  createEmployee,
  deleteEmployee,
} from "./employee.controller.js";
import { authenticate } from "./middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/", authenticate, fetchEmployees);
router.post("/", authenticate, createEmployee);
router.delete("/:id", authenticate, deleteEmployee);

export default router;

