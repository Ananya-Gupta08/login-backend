import bcrypt from "bcryptjs"
import User from "./models/User.js"
import connectDB from "./_utils/connectDB.js"   
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({message:"Method not allowed"});
      }
      const { name, email, password, confirmPassword,phoneNumber,address,companyName} = req.body;
      await connectDB();
      if (!name || !email || !password || password !== confirmPassword) {
        return res.status(400).json({ message: "Invalid input" });
      }
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password:hashed,phoneNumber, address, companyName, role:"customer", accountStatus:"Active", });
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(201).json({
         message:"Signup successful",
         user: userResponse,
         
    }
    
   
  );
  console.log("user created in db", user._id),
  res.status(201).json({message:"Signup successful", user});
   

}