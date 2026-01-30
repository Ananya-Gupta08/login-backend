import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./server.js";
dotenv.config();

const app = express();

// middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(authRoutes);
// health check
app.get("/", (req, res) => {
  res.send("Backend running on Vercel 🚀");
});

export default app;
