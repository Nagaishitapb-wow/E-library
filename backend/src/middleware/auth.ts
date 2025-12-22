import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Attach user in consistent format
    (req as any).user = {
      _id: decoded.id || decoded._id,
      id: decoded.id || decoded._id,
      email: decoded.email || null,
      role: decoded.role || "user" // Default to user if not present
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
}

export function adminRequired(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
