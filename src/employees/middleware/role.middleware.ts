import type { Request, Response, NextFunction } from "express";

export const requireEmployer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "EMPLOYER") {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};