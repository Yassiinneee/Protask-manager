const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { memoryUsers, JWT_SECRET } = require("../controllers/userController");

const protect = async (req, res, next) => {
  let token;

  // 1. Extract from Authorization Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // 2. Extract from cookies (cookie-parser)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  else if (req.signedCookies && req.signedCookies.token) {
    token = req.signedCookies.token;
  }
  // 3. Extract from session (express-session)
  else if (req.session && req.session.token) {
    token = req.session.token;
  }

  if (token) {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);

      const isMongoConnected = () => mongoose.connection.readyState === 1;

      if (isMongoConnected()) {
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
          return res.status(401).json({ success: false, message: "Not authorized, user not found" });
        }
      } else {
        const found = memoryUsers.find((u) => u._id === decoded.id);
        if (found) {
          const { password, ...userWithoutPassword } = found;
          req.user = userWithoutPassword;
        } else {
          return res.status(401).json({ success: false, message: "Not authorized, user session expired" });
        }
      }

      if (req.user && req.user.isBanned) {
        return res.status(403).json({
          success: false,
          message: "Access forbidden: Your account has been banned by an administrator."
        });
      }

      return next();
    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({ success: false, message: "Not authorized, invalid or expired token" });
    }
  }

  return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.signedCookies && req.signedCookies.token) {
    token = req.signedCookies.token;
  } else if (req.session && req.session.token) {
    token = req.session.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const isMongoConnected = () => mongoose.connection.readyState === 1;

      if (isMongoConnected()) {
        req.user = await User.findById(decoded.id).select("-password");
      } else {
        const found = memoryUsers.find((u) => u._id === decoded.id);
        if (found) {
          const { password, ...userWithoutPassword } = found;
          req.user = userWithoutPassword;
        }
      }
    } catch (error) {
      // Ignore token verification errors in optional mode
    }
  }
  next();
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access forbidden: Admin privilege required" });
  }
};

module.exports = { protect, optionalProtect, admin };
