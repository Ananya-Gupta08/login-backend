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
app.get("/auth/google", ...);
app.get("/auth/google/callback", ...);

export default app;
