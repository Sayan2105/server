const express = require("express");
const passport = require("passport");
const router = express.Router();
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Passport user serialization
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  console.log("Deserializing user:", obj);
  done(null, obj);
});

// Google OAuth Strategy - THIS IS THE KEY FIX
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Google Strategy callback triggered");
      console.log(
        "Profile received:",
        profile.displayName,
        profile.emails[0].value
      );

      return done(null, profile);
    }
  )
);

// Route to start OAuth flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// OAuth callback route - ADD SUCCESS/FAILURE HANDLING
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login?error=oauth_failed",
    successRedirect: "http://localhost:3000",
  })
);

module.exports = router;
