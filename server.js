const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");

const { connectDB } = require("./server/config/db");
const { initRedis, getCacheStats } = require("./server/config/redis");
const taskRoutes = require("./server/routes/taskRoutes");
const cacheRoutes = require("./server/routes/cacheRoutes");
const userRoutes = require("./server/routes/userRoutes");
const aiRoutes = require("./server/routes/aiRoutes");
const { errorHandler, notFound } = require("./server/middleware/errorMiddleware");
const { xssClean } = require("./server/middleware/xssMiddleware");

dotenv.config({ path: path.join(__dirname, '.env') });

async function startServer() {
  const app = express();

  // Trust proxy for reverse proxy / container ingress (Cloud Run, Nginx)
  app.set("trust proxy", 1);

  // Connect MongoDB
  await connectDB();

  // Initialize Redis
  initRedis();

  // Security Headers via Helmet
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  // CORS Configuration
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // Cookie Parser
  const COOKIE_SECRET = process.env.COOKIE_SECRET || process.env.JWT_SECRET || "taskmaster_cookie_secret_key_8923";
  app.use(cookieParser(COOKIE_SECRET));

  // Express Session
  const SESSION_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || "taskmaster_session_secret_key_8923";
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Body Parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // HTTP Parameter Pollution protection
  app.use(
    hpp({
      whitelist: ["status", "priority", "category", "sortBy", "sort", "page", "limit"],
    })
  );

  // Cross-site Scripting Sanitization
  app.use(xssClean);

  // Rate Limiting
  const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    message: {
      success: false,
      message: "Too many requests from this IP, please try again after 15 minutes.",
    },
  });
  app.use("/api/", generalApiLimiter);

  // Stricter Rate Limiting for Authentication Endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // Limit each IP to 60 authentication attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    message: {
      success: false,
      message: "Too many authentication requests from this IP. Please wait 15 minutes before retrying.",
    },
  });
  app.use("/api/users/login", authLimiter);
  app.use("/api/users/register", authLimiter);
  app.use("/api/users/resend-verification", authLimiter);

  // API Routes
  app.use("/api/tasks", taskRoutes);
  app.use("/api/cache", cacheRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/ai", aiRoutes);

  // Health Check
  app.get("/api/health", async (req, res) => {
    const redisStats = await getCacheStats();
    res.json({
      success: true,
      message: "Server is running",
      time: new Date(),
      redis: redisStats,
    });
  });

  // ---------- React Frontend ----------
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = require("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
        configFile: path.join(__dirname, "vite.config.js"),
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.log("Vite dev middleware not loaded:", e.message);
      const clientPath = path.join(__dirname, "client");
      app.use(express.static(clientPath));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(path.join(clientPath, "index.html"));
      });
    }
  } else {
    const fs = require("fs");
    let distPath = path.join(process.cwd(), "client/dist");
    if (!fs.existsSync(distPath)) {
      distPath = path.join(__dirname, "client/dist");
    }
    if (!fs.existsSync(distPath)) {
      distPath = path.join(__dirname, "../client/dist");
    }
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 404
  app.use(notFound);

  // Error Handler
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Task Master Server running successfully!`);
    console.log(`  ➜ Local:   http://localhost:${PORT}`);
    console.log(`  ➜ Network: http://127.0.0.1:${PORT}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please wait or stop existing processes.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
