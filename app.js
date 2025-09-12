require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const app = express();

// 1. CORS Configuration - MUST allow credentials for OAuth
app.use(
  cors({
    origin: "http://localhost:3000", // Your React app URL
    credentials: true, // Essential for cookies/sessions
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Body parser middleware
app.use(express.json());

// 3. Session middleware - MUST come before Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // false for localhost, true for HTTPS production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax", // Allow OAuth redirects
    },
  })
);

// 4. Passport initialization - MUST come after session
app.use(passport.initialize());
app.use(passport.session());

// 5. Passport session authentication - CRITICAL FOR req.user
app.use(passport.authenticate("session"));

// 6. Debug middleware (temporary - remove in production)
app.use((req, res, next) => {
  console.log("=== Request Debug ===");
  console.log("URL:", req.url);
  console.log("Session ID:", req.sessionID);
  console.log(
    "User in session:",
    req.user ? req.user.displayName : "undefined"
  );
  console.log(
    "Is authenticated:",
    req.isAuthenticated ? req.isAuthenticated() : "No method"
  );
  console.log("==================");
  next();
});

// 7. Auth check endpoint
app.get("/api/auth/user", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// 8. Import and mount routers
const genresRouter = require("./routes/genres");
const moviesRouter = require("./routes/movies");
const authRouter = require("./routes/auth");

app.use("/api/genres", genresRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/auth", authRouter);

module.exports = app;
