import bcrypt from "bcryptjs";
import User from "./models/User.js";
import connectDB from "./_utils/connectDB.js";
import jwt from "jsonwebtoken";
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { email, password } = req.body;
    await connectDB();

    const user = await User.findOne({ email });
    if (!user ) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user });
}