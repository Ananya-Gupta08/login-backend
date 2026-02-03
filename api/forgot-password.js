import jwt from "jsonwebtoken";
import connectDB from "./_utils/connectDB.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { email } = req.body;

  await connectDB();

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  const resetToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // send email here
  console.log("RESET TOKEN:", resetToken);

  res.json({ message: "Reset link sent" });
}
