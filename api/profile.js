// import jwt from "jsonwebtoken";
// import User from "./models/User.js";
// import connectDB from "./_utils/connectDB.js";
// import jwt from "jsonwebtoken";
// export default async function handler(req, res) {
//     if (req.method !== "GET") {
//         return res.status(405).json({ message: "Method not allowed" });
//     }

//     const authHeader = req.headers.authorization;
//     if (!authHeader?.startsWith("Bearer ")) {
//         return res.status(401).json({ message: "No token provided" });
//     }

//     try {
//         const token = authHeader.split(" ")[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         await connectDB();
//         const user = await User.findById(decoded.userId).select("-password");
//         res.json(user);
//     } catch {
//         res.status(401).json({ message: "Invalid or expired token" });
//     }
// }
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import connectDB from "./_utils/connectDB.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("PROFILE API ERROR:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}