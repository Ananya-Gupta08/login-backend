import jwt from "jsonwebtoken";
import User from "../models/User.js";
import connectDB from "./_utils/connectDB.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await connectDB();
        const user = await User.findById(decoded.userId).select("-password");
        res.json(user);
    } catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
