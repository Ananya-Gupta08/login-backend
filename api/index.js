import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("Backend running on Vercel 🚀");
});

// GOOGLE AUTH ROUTES
app.get("/auth/google", (req, res) => {
  res.send("Google auth route works");
});

app.get("/auth/google/callback", (req, res) => {
  res.send("Google callback works ");
});

export default app;
