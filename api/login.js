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

    if (user.accountStatus !== "Active"){
    return res.status(403).json({ message: "Account is inactive" });
    }
    
    if (user.authProvider === "google") {
    return res.status(400).json({ message: "Please login using Google" });
    }

    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
        {
        userId: user._id,
        role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
        message: "Login successful",
        token,
        user: userResponse,
    });
}