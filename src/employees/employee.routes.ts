import express from "express";
import { fetchEmployees, login } from "./employee.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireEmployer } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/", authenticate, requireEmployer, fetchEmployees);

export default router;
