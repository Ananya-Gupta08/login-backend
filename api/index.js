import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("API working");
});

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

export default app;
