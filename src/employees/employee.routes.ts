import express from "express";
<<<<<<< HEAD
import {
  fetchEmployees,
  login,
  createEmployee,
  deleteEmployee,
} from "./employee.controller.js";
import { authenticate } from "./middleware/auth.middleware.js";
=======
import { fetchEmployees, login } from "./employee.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireEmployer } from "../middleware/role.middleware.js";
>>>>>>> b07984176faed67068d16bed256453184459f63c

const router = express.Router();

router.post("/login", login);
router.get("/", authenticate, fetchEmployees);
router.post("/", authenticate, createEmployee);
router.delete("/:id", authenticate, deleteEmployee);

export default router;

