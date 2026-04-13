import express from "express";
import employeeRouter from "./employee.routes.js";

const app = express();

app.use(express.json());
app.use("/employees", employeeRouter);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));