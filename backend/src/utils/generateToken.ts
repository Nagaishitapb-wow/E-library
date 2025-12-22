import jwt from "jsonwebtoken";

export function generateToken(id: string, role: string) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: "1h" });
}
