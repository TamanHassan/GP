import express from "express";
import { fetchEmployees } from "./employee.controller.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { requireEmployer } from "./middleware/role.middleware.js";

const router = express.Router();

router.get("/", authenticate, requireEmployer, fetchEmployees);

export default router;