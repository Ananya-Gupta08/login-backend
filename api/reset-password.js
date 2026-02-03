import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "./_utils/connectDB.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { token, password } = req.body;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  await connectDB();

  const hashed = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(decoded.id, { password: hashed });

  res.json({ message: "Password reset successful" });
}
