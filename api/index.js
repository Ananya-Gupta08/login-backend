import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import GoogleStrategy from "passport-google-oauth20";

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// session (required for passport)
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

// serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// ROUTES
app.get("/", (req, res) => {
  res.send("Backend running on Vercel");
});

// STEP 1: Redirect to Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// STEP 2: Google callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL + "/login" }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/google-success`);
  }
);

export default app;
