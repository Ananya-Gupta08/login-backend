import bcrypt from "bcryptjs";
import User from "../models/User.js";
import connectDB from "./_utils/connectDB.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    const auth = req.headers.authorization;
    const {newPassword}=req.body;
    if(!auth) return res.status(401).json({ message: "No token provided" });
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashed });
    res.json({ message: "Password changed successfully" });

    
}