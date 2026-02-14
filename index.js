import express from "express";
import dotenv from "dotenv";
import router from "./router.js"; 

dotenv.config();

const app = express();


app.use("/api", router);


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Local backend running at http://localhost:${PORT}`);
});