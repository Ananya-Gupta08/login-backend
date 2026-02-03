import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import connectDB from "../_utils/connectDB.js";
import { OAuth2Client } from "google-auth-library";

export default async function handler(req, res) {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const { tokens } = await client.getToken({
      code: req.query.code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URL,
    });

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    await connectDB();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, authProvider: "google" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/google-success?token=${token}`
    );
  } catch (e) {
    console.error(e);
    res.status(500).send("Google auth failed");
  }
}
