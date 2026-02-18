import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "./api/models/User.js";
import connectDB from "./api/_utils/connectDB.js";
import requireRole from "./api/_utils/requireRole.js";
// import sendEmail from "./utils/SendEmail.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// MongoDB (safe for Vercel)
if (!mongoose.connection.readyState) {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(console.error);
}

// middleware
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ================= NORMAL AUTH =================
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ message: "Invalid input" });
  }

  if (await User.findOne({ email })) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role:"customer" });

  res.status(201).json({ message: "Signup successful", user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, user });
});

// ================= GOOGLE AUTH =================
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

router.get("/auth/google", (req, res) => {
  const url = googleClient.generateAuthUrl({
    scope: ["profile", "email"],
    redirect_uri: process.env.GOOGLE_REDIRECT_URL,
  });
  res.redirect(url);
});

router.get("/auth/google/callback", async (req, res) => {
  try {
    const { tokens } = await googleClient.getToken({
      code: req.query.code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URL,
    });

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, authProvider: "google" });
    }

    const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/google-success?token=${jwtToken}`
    );
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google`);
  }
});
// ================= PROFILE =================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= ADMIN ROUTES =================
router.post(
  "/admin/create-user",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      await connectDB();

      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Missing fields" });
      }

      if (!["staff", "manager", "customer"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        accountStatus: "Active",
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

    } catch (err) {
      console.error("CREATE USER ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);  

export default router;