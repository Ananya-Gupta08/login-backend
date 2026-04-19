import dotenv from "dotenv";
dotenv.config();

import express from "express";
import router from "./router.js";

const app = express();


app.use("/api", router);


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Local backend running at http://localhost:${PORT}`);
});
