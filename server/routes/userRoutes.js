const express = require("express");
const router = express.Router();
const { 
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
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateAdminCreateUser,
  validateAdminUpdatePassword,
  validateUpdateProfile,
  validateUpdatePassword,
  validateContactMessage,
} = require("../middleware/validators");

// Public Auth & Email Verification Routes
router.post("/register", validateRegister, registerUser);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/resend-verification", validateResendVerification, resendVerificationEmail);
router.post("/login", validateLogin, loginUser);
router.post("/logout", logoutUser);
router.post("/contact", validateContactMessage, submitContactMessage);

// Private User Routes
router.get("/me", protect, getMe);
router.put("/profile", protect, validateUpdateProfile, updateUserProfile);
router.put("/password", protect, validateUpdatePassword, updateUserPassword);

// Admin Control Routes
router.get("/", protect, admin, getAllUsers);
router.get("/admin/stats", protect, admin, getAdminStats);
router.post("/admin/create", protect, admin, validateAdminCreateUser, adminCreateUser);
router.put("/:id/role", protect, admin, updateUserRole);
router.put("/:id/ban", protect, admin, toggleBanUser);
router.put("/:id/password", protect, admin, validateAdminUpdatePassword, adminUpdatePassword);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
