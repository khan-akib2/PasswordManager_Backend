const router = require("express").Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const firstName = profile.name.givenName || profile.displayName.split(" ")[0];
    const lastName = profile.name.familyName || profile.displayName.split(" ")[1] || "";

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        password: `google_${profile.id}`, // placeholder, not used for login
      });
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Initiate Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/Login?error=google_failed`, session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1y" });
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

module.exports = { router, passport };
