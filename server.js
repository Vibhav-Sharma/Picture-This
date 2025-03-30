require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true if using https
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      path: '/'
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(__dirname));

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Google Auth Setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/oauth2callback",
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        // Here you would typically save or find the user in your database
        console.log("Google profile:", profile);
        return done(null, profile);
      } catch (error) {
        console.error("Error in Google Strategy callback:", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google Auth Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/oauth2callback",
  (req, res, next) => {
    passport.authenticate("google", { failureRedirect: "/" }, (err, user, info) => {
      if (err) {
        console.error("Google auth error:", err);
        return res.redirect("/?error=" + encodeURIComponent("Authentication failed"));
      }
      
      if (!user) {
        console.error("No user returned from Google auth");
        return res.redirect("/?error=" + encodeURIComponent("Authentication failed"));
      }
      
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.redirect("/?error=" + encodeURIComponent("Login failed"));
        }
        return res.redirect("/dashboard");
      });
    })(req, res, next);
  }
);

app.get("/logout", (req, res) => {
  console.log("Logging out user:", req.user);
  
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    
    res.clearCookie('connect.sid');
    console.log("Session destroyed, user logged out");
    res.redirect('/');
  });
});

// Auth status endpoint
app.get("/auth/status", (req, res) => {
  console.log("Auth status check - isAuthenticated:", req.isAuthenticated());
  console.log("Auth status check - session:", req.session);
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true, 
      user: req.user 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// AI Image Generation API Route
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 9,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 40,
        style_preset: "photographic"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`
        }
      }
    );
    
    // Returns base64 encoded images
    const images = response.data.artifacts.map(artifact => {
      return {
        imageUrl: `data:image/png;base64,${artifact.base64}`
      };
    });
    
    res.json(images[0]); // Send back the first image
  } catch (error) {
    console.error("Image generation error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
