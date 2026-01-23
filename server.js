require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const sendEmail = require("./utils/SendEmail");

const User = require("./models/User");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("SERVER FILE LOADED");

// MongoDB 
mongoose
  .connect("process.env.MONGO_URL")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// root route
app.get("/", (req, res) => {
  console.log("ROOT ROUTE hit");
  res.send({ status: "Server is running" });
});
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
    console.log("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
    console.log("Invalid or expired token");
  }
  console.log("AUTH MIDDLEWARE LOADED");
};

// SIGNUP ROUTE
app.post("/signup", async (req, res) => {
  console.log("SIGNUP ROUTE hit");
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
    console.log("All fields are required");
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
    console.log("Passwords do not match");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
      console.log("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("User created");

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
  console.log("Signup successful")
});

// LOGIN ROUTE 
app.post("/login", async (req, res) => {
  console.log("LOGIN ROUTE hit");
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
    console.log("Email and password required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
      console.log("User not found");
    }
    console.log("User found");

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password matched");
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
      console.log("Invalid password");
    }

    // jwt
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
    console.log("Login successful");
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.log("Server error in login route");

  }
  console.log("LOGIN ROUTE hit");
});

app.post("/change-password", authMiddleware, async (req, res) => {
  console.log("CHANGE PASSWORD ROUTE hit");
  const { oldPassword, newPassword } = req.body;

  // validation
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields required" });
    console.log("All fields required");
  }

  const user = await User.findById(req.userId);

  // check old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Old password incorrect" });
    console.log("Old password incorrect");
  } console.log("Old password correct");

  // hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  console.log(" new Password hashed");

  user.password = hashedPassword;
  await user.save();

  res.json({ message: "Password changed successfully" });
  console.log("Password changed successfully");
});

app.get("/profile", authMiddleware, async (req, res) => {
  console.log("PROFILE ROUTE hit");
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
      console.log("User not found");
    }
    res.json(user);
    console.log("User found");
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log("Server error in profile route");
    
  }
});
app.post("/forgot-password", async (req, res) => {
  console.log("FORGOT PASSWORD ROUTE hit");
  const { email } = req.body;


  // Always respond the same (prevents email enumeration)
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "If email exists, OTP sent" });
    console.log("If email exists, OTP sent");
  } console.log("Email exists");
//otp generator 
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  console.log("OTP generated");
  await user.save();

 
 await sendEmail(
  email,
  "Password Reset OTP",
  `Your OTP is ${otp}. It is valid for 5 minutes.`,
    console.log("Email sent")
);


  res.json({ message: "OTP sent" });
  console.log("OTP sent");
});
//verification
app.post("/verify-otp", async (req, res) => {
  console.log("VERIFY OTP ROUTE hit");
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otp,
    otpExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired OTP" });

    console.log("Invalid or expired OTP");
  } console.log("OTP valid");

  res.json({ message: "OTP verified" });
  console.log("OTP verified")
});
//reset 
app.post("/reset-password", async (req, res) => {
  console.log("RESET PASSWORD ROUTE hit");
  const { email, otp, newPassword } = req.body;


  const user = await User.findOne({
    email,
    otp,
    otpExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
    console.log("Invalid or expired OTP");
  } console.log("OTP valid");

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
  console.log("Password reset successful")
});

const PORT = process.env.PORT || 5000;
// serverstart
app.listen(PORT, () => {
  console.log("SERVER STARTED");
  console.log("Server is listening on port", PORT);
});
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "LOADED" : "MISSING");
