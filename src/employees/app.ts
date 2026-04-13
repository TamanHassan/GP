// src/employees/app.ts
import express from "express";
import employeeRoutes from "./employee.routes.js"; 

const app = express();

app.use(express.json());
app.use("/employees", employeeRoutes);

export default app;