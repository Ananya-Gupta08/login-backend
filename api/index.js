import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ROOT ROUTE (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("Backend is running on Vercel ✅");
});

// ✅ TEST ROUTE
app.get("/auth/google", (req, res) => {
  res.send("NOW THIS IS api/index.js 🔥");
});

export default app;
