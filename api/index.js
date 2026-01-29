import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

function handler(req, res) {
  const { url } = req;

  if (url === "/auth/google") {
    return res.status(200).send("✅ /auth/google route is working");
  }

  if (url === "/auth/google/callback") {
    return res.status(200).send("✅ Google callback route working");
  }

  return res.status(200).send("🏠 Backend root working");
}

export default app;
