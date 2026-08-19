const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const Task = require("../models/Task");
const { sendVerificationEmail, sendContactEmail } = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET || "mern_task_manager_secret_key_12345";

// In-memory fallback users for non-mongo environment
const memoryUsers = [];

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to generate random token string
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Memory users list for fallback when MongoDB is disconnected
// No default demo users

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Helper to set cookie and session for authenticated requests
const setTokenCookieAndSession = (req, res, token) => {
  if (res.cookie) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
  if (req && req.session) {
    req.session.token = token;
  }
};

const ADMIN_EMAILS = [
  "yassinekalthoum94@gmail.com",
  "yassineklt94@gmail.com",
  "admin@gmail.com",
];

// Real email validation helper (valid format and blocks disposable/fake domains)
const isValidRealEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || !domain.includes(".")) return false;

  const disposableDomains = [
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "yopmail.com",
    "trashmail.com",
    "throwawaymail.com",
    "temp-mail.org",
    "fakeinbox.com",
    "dispostable.com",
    "sharklasers.com",
    "getairmail.com",
  ];

  if (disposableDomains.some((d) => domain === d || domain.endsWith("." + d))) {
    return false;
  }

  return true;
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please enter all required fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidRealEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid, real email address (e.g. yourname@gmail.com). Disposable and invalid domains are not accepted.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail) || normalizedEmail.includes("admin");
    const assignedRole = isAdminEmail ? "admin" : "user";

    const otp = generateOTP();
    const verificationToken = generateRandomToken();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const originUrl = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null) || process.env.APP_URL;

    if (isMongoConnected()) {
      const userExists = await User.findOne({ email: normalizedEmail });

      if (userExists) {
        return res.status(400).json({ success: false, message: "User with this email already exists" });
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: assignedRole,
        isVerified: false,
        verificationToken,
        verificationTokenExpires: tokenExpires,
        verificationOTP: otp,
        verificationOTPExpires: otpExpires,
      });

      // Send confirmation email
      await sendVerificationEmail({
        to: normalizedEmail,
        name: user.name,
        token: verificationToken,
        otp,
        baseUrl: originUrl,
      });

      return res.status(201).json({
        success: true,
        requiresVerification: true,
        message: `Registration successful! A 6-digit confirmation code has been sent to ${normalizedEmail}. Please check your email inbox and spam folder.`,
        email: normalizedEmail,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      });
    }

    // Memory Mode
    const userExists = memoryUsers.find((u) => u.email === normalizedEmail);
    if (userExists) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: "user_" + Date.now().toString(),
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: tokenExpires,
      verificationOTP: otp,
      verificationOTPExpires: otpExpires,
      createdAt: new Date(),
    };

    memoryUsers.push(newUser);

    // Send confirmation email
    await sendVerificationEmail({
      to: normalizedEmail,
      name: newUser.name,
      token: verificationToken,
      otp,
      baseUrl: originUrl,
    });

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: `Registration successful! A 6-digit confirmation code has been sent to ${normalizedEmail}. Please check your email inbox and spam folder.`,
      email: normalizedEmail,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address using token or 6-digit OTP code
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token, otp, email } = req.body;

    if (!token && !otp) {
      return res.status(400).json({ success: false, message: "Please provide a verification token or 6-digit OTP code" });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    if (isMongoConnected()) {
      let user = null;

      if (token) {
        user = await User.findOne({
          verificationToken: token,
          verificationTokenExpires: { $gt: Date.now() },
        });
      } else if (otp && normalizedEmail) {
        user = await User.findOne({
          email: normalizedEmail,
          verificationOTP: otp,
          verificationOTPExpires: { $gt: Date.now() },
        });
      } else if (otp) {
        user = await User.findOne({
          verificationOTP: otp,
          verificationOTPExpires: { $gt: Date.now() },
        });
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification code/token. Please request a new confirmation email."
        });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      user.verificationOTP = undefined;
      user.verificationOTPExpires = undefined;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Email confirmed successfully! Your account is now active. Please sign in to access your dashboard.",
        email: user.email,
      });
    }

    // Memory Mode
    let user = null;
    if (token) {
      user = memoryUsers.find(u => u.verificationToken === token && u.verificationTokenExpires > new Date());
    } else if (otp && normalizedEmail) {
      user = memoryUsers.find(u => u.email === normalizedEmail && u.verificationOTP === otp && u.verificationOTPExpires > new Date());
    } else if (otp) {
      user = memoryUsers.find(u => u.verificationOTP === otp && u.verificationOTPExpires > new Date());
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code/token. Please request a new confirmation email."
      });
    }

    user.isVerified = true;
    delete user.verificationToken;
    delete user.verificationTokenExpires;
    delete user.verificationOTP;
    delete user.verificationOTPExpires;

    res.status(200).json({
      success: true,
      message: "Email confirmed successfully! Your account is now active. Please sign in to access your dashboard.",
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend confirmation email
// @route   POST /api/users/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email address" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otp = generateOTP();
    const verificationToken = generateRandomToken();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const originUrl = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null) || process.env.APP_URL;

    if (isMongoConnected()) {
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        return res.status(404).json({ success: false, message: "No account found with this email address" });
      }

      if (user.isVerified) {
        return res.status(400).json({ success: false, message: "This email address is already verified" });
      }

      user.verificationToken = verificationToken;
      user.verificationTokenExpires = tokenExpires;
      user.verificationOTP = otp;
      user.verificationOTPExpires = otpExpires;
      await user.save();

      await sendVerificationEmail({
        to: normalizedEmail,
        name: user.name,
        token: verificationToken,
        otp,
        baseUrl: originUrl,
      });

      return res.status(200).json({
        success: true,
        message: `A new 6-digit confirmation code has been sent to ${normalizedEmail}. Please check your email inbox and spam folder.`,
      });
    }

    // Memory Mode
    const user = memoryUsers.find((u) => u.email === normalizedEmail);

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "This email address is already verified" });
    }

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = tokenExpires;
    user.verificationOTP = otp;
    user.verificationOTPExpires = otpExpires;

    await sendVerificationEmail({
      to: normalizedEmail,
      name: user.name,
      token: verificationToken,
      otp,
      baseUrl: originUrl,
    });

    res.status(200).json({
      success: true,
      message: `A new 6-digit confirmation code has been sent to ${normalizedEmail}. Please check your email inbox and spam folder.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isMongoConnected()) {
      const user = await User.findOne({ email: normalizedEmail });

      if (user && (await user.matchPassword(password))) {
        if (user.isBanned) {
          return res.status(403).json({
            success: false,
            message: "Your account has been banned by an administrator. Access restricted."
          });
        }

        if (user.isVerified === false) {
          return res.status(403).json({
            success: false,
            requiresVerification: true,
            email: user.email,
            message: "Your email address is not verified yet. Please check your inbox for the confirmation email or enter your verification code."
          });
        }

        const token = generateToken(user._id);
        setTokenCookieAndSession(req, res, token);

        return res.json({
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            age: user.age ?? null,
            location: user.location || "",
            gender: user.gender || "",
            role: user.role || "user",
            isBanned: user.isBanned || false,
            isVerified: true,
            createdAt: user.createdAt,
          },
          token,
        });
      }

      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Memory Mode
    const user = memoryUsers.find((u) => u.email === normalizedEmail);
    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned by an administrator. Access restricted."
        });
      }

      if (user.isVerified === false) {
        return res.status(403).json({
          success: false,
          requiresVerification: true,
          email: user.email,
          message: "Your email address is not verified yet. Please check your inbox for the confirmation email or enter your verification code."
        });
      }

      const token = generateToken(user._id);
      setTokenCookieAndSession(req, res, token);

      return res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age ?? null,
          location: user.location || "",
          gender: user.gender || "",
          role: user.role || "user",
          isBanned: user.isBanned || false,
          isVerified: true,
          createdAt: user.createdAt,
        },
        token,
      });
    }

    return res.status(401).json({ success: false, message: "Invalid email or password" });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookies / session
// @route   POST /api/users/logout
// @access  Public
const logoutUser = async (req, res) => {
  if (res.clearCookie) {
    res.clearCookie("token");
  }
  if (req.session) {
    req.session.destroy(() => {});
  }
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      const users = await User.find({}).select("-password").sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: users.length, data: users });
    }

    // Memory Mode
    const users = memoryUsers.map(({ password, ...u }) => u);
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    if (isMongoConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      user.role = role;
      await user.save();
      return res.status(200).json({
        success: true,
        message: `User role updated to ${role}`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Memory Mode
    const userIndex = memoryUsers.findIndex((u) => u._id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    memoryUsers[userIndex].role = role;
    const { password, ...updatedUser } = memoryUsers[userIndex];

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(200).json({ success: true, message: "User deleted successfully" });
    }

    // Memory Mode
    const index = memoryUsers.findIndex((u) => u._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    memoryUsers.splice(index, 1);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user ban status (Admin only)
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
const toggleBanUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    // Prevent admin from banning themselves
    if (req.user && req.user._id && (req.user._id.toString() === targetUserId.toString())) {
      return res.status(400).json({ success: false, message: "You cannot ban your own administrator account" });
    }

    if (isMongoConnected()) {
      const user = await User.findById(targetUserId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const newBanState = typeof req.body.isBanned === "boolean" ? req.body.isBanned : !user.isBanned;
      user.isBanned = newBanState;
      await user.save();

      return res.status(200).json({
        success: true,
        message: `User ${user.name} was successfully ${newBanState ? "banned" : "unbanned"}`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
        },
      });
    }

    // Memory Mode
    const userIndex = memoryUsers.findIndex((u) => u._id === targetUserId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentBan = memoryUsers[userIndex].isBanned || false;
    const newBanState = typeof req.body.isBanned === "boolean" ? req.body.isBanned : !currentBan;
    memoryUsers[userIndex].isBanned = newBanState;

    const { password, ...updatedUser } = memoryUsers[userIndex];

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.name} was successfully ${newBanState ? "banned" : "unbanned"}`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin statistics
// @route   GET /api/users/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    let totalUsers = 0;
    let totalAdmins = 0;
    let totalBanned = 0;

    if (isMongoConnected()) {
      totalUsers = await User.countDocuments();
      totalAdmins = await User.countDocuments({ role: "admin" });
      totalBanned = await User.countDocuments({ isBanned: true });
    } else {
      totalUsers = memoryUsers.length;
      totalAdmins = memoryUsers.filter((u) => u.role === "admin").length;
      totalBanned = memoryUsers.filter((u) => u.isBanned).length;
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalBanned,
        databaseMode: isMongoConnected() ? "MongoDB Connected" : "In-Memory Engine",
        systemUptime: Math.floor(process.uptime()) + "s",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin create new user account
// @route   POST /api/users/admin/create
// @access  Private/Admin
const adminCreateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, isVerified } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide name, email, and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === "admin" ? "admin" : "user";
    const verifiedStatus = isVerified !== false;

    if (isMongoConnected()) {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: "User with this email already exists" });
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: userRole,
        isVerified: verifiedStatus,
        isBanned: false,
      });

      return res.status(201).json({
        success: true,
        message: `User ${name} created successfully`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isBanned: user.isBanned,
          createdAt: user.createdAt,
        },
      });
    }

    // Memory Mode
    const userExists = memoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (userExists) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const newUser = {
      _id: `user_admin_created_${Date.now()}`,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      isVerified: verifiedStatus,
      isBanned: false,
      createdAt: new Date(),
    };

    memoryUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: `User ${name} created successfully`,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin modify user password
// @route   PUT /api/users/:id/password
// @access  Private/Admin
const adminUpdatePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongoConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      user.password = hashedPassword;
      await user.save();
      return res.status(200).json({ success: true, message: `Password updated successfully for ${user.name}` });
    }

    // Memory Mode
    const userIndex = memoryUsers.findIndex((u) => u._id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    memoryUsers[userIndex].password = hashedPassword;
    res.status(200).json({ success: true, message: `Password updated successfully for ${memoryUsers[userIndex].name}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile (age, location, gender, name)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, age, location, gender } = req.body;
    const userId = req.user._id;

    if (isMongoConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (name !== undefined && name.trim()) user.name = name.trim();
      if (age !== undefined) {
        user.age = (age === "" || age === null) ? null : Number(age);
      }
      if (location !== undefined) user.location = location ? location.trim() : "";
      if (gender !== undefined) user.gender = gender;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age ?? null,
          location: user.location || "",
          gender: user.gender || "",
          role: user.role,
          isVerified: user.isVerified,
          isBanned: user.isBanned,
          createdAt: user.createdAt,
        },
      });
    }

    // Memory Mode
    const userIndex = memoryUsers.findIndex((u) => u._id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name !== undefined && name.trim()) memoryUsers[userIndex].name = name.trim();
    if (age !== undefined) {
      memoryUsers[userIndex].age = (age === "" || age === null) ? null : Number(age);
    }
    if (location !== undefined) memoryUsers[userIndex].location = location ? location.trim() : "";
    if (gender !== undefined) memoryUsers[userIndex].gender = gender;

    const { password: _, ...updatedUser } = memoryUsers[userIndex];

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user password
// @route   PUT /api/users/password
// @access  Private
const updateUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide both current and new password" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
    }

    if (isMongoConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }

      user.password = newPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    }

    // Memory Mode
    const userIndex = memoryUsers.findIndex((u) => u._id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, memoryUsers[userIndex].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    memoryUsers[userIndex].password = await bcrypt.hash(newPassword, 10);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Contact form message
// @route   POST /api/users/contact
// @access  Public
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const emailResult = await sendContactEmail({
      name,
      email,
      subject,
      message,
      userRole: req.user ? req.user.role : null,
    });

    res.status(200).json({
      success: true,
      message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      delivered: emailResult.delivered,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  logoutUser,
  getMe,
  getAllUsers,
  updateUserRole,
  toggleBanUser,
  deleteUser,
  getAdminStats,
  adminCreateUser,
  adminUpdatePassword,
  updateUserProfile,
  updateUserPassword,
  submitContactMessage,
  memoryUsers,
  isMongoConnected,
  JWT_SECRET,
};
