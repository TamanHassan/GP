import express from "express";
import employeeRouter from "./employee.routes.js";

const app = express();

app.use(express.json());
app.use("/employees", employeeRouter);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

const port = Number(process.env.PORT) || 3000;
console.log("Server cwd:", process.cwd());
console.log("Server port:", port);
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));