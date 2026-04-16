import express from "express";
import cors from "cors";
import path from "path";
import employeeRouter from "./employee.routes.js";
import availabilityRouter from "../availability/availability.routes.js";
import assignmentRouter from "../assignments/assignment.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "Frontend")));
app.use("/employees", employeeRouter);
app.use("/availability", availabilityRouter);
app.use("/assignments", assignmentRouter)

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "Frontend", "index.html"));
});

const port = Number(process.env.PORT) || 3000;
console.log("Server cwd:", process.cwd());
console.log("Server port:", port);

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);