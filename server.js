const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Trust Render's proxy (required for express-rate-limit behind a reverse proxy)
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS — allow all vercel preview URLs + the main client URL
const allowedOrigin = process.env.CLIENT_URL;
if (!allowedOrigin) {
  console.warn("WARNING: CLIENT_URL not set. CORS will block all browser requests.");
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost, the main client URL, and any vercel preview deployments
    if (
      origin === allowedOrigin ||
      /\.vercel\.app$/.test(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Body size limit — prevent large payload attacks
app.use(express.json({ limit: "10kb" }));

// Rate limiting on auth routes — max 20 requests per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/password", require("./routes/passwordRoutes"));

// Health check
app.get("/", (req, res) => res.json({ status: "API running" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler — never leak stack traces to client
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Connect DB & start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
