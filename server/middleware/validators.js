const { body, param, query, validationResult } = require("express-validator");

// Formats and returns validation errors if any exist
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    return res.status(400).json({
      success: false,
      message: errorArray[0].msg,
      errors: errorArray.map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation rules for User Registration
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

// Validation rules for User Login
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

// Validation rules for Email Verification
const validateVerifyEmail = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("token").optional().trim(),
  body("otp").optional().trim(),
  handleValidationErrors,
];

// Validation rules for Resending Verification
const validateResendVerification = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  handleValidationErrors,
];

// Validation rules for Task Creation
const validateTaskCreate = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Task title cannot exceed 200 characters"),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be Pending, In Progress, or Completed"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("category")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 60 })
    .withMessage("Category name cannot exceed 60 characters"),
  handleValidationErrors,
];

// Validation rules for Task Updates
const validateTaskUpdate = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Task title cannot be empty")
    .isLength({ min: 1, max: 200 })
    .withMessage("Task title cannot exceed 200 characters"),
  body("description")
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be Pending, In Progress, or Completed"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("category")
    .optional({ nullable: true })
    .isLength({ max: 60 })
    .withMessage("Category name cannot exceed 60 characters"),
  handleValidationErrors,
];

// Validation rules for Admin Create User
const validateAdminCreateUser = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 60 }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be 'user' or 'admin'"),
  handleValidationErrors,
];

// Validation rules for Admin Password Update
const validateAdminUpdatePassword = [
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  handleValidationErrors,
];

// Validation rules for User Profile Update (age, location, gender, name)
const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters"),
  body("age")
    .optional({ nullable: true, checkFalsy: false })
    .custom((val) => {
      if (val === "" || val === null || val === undefined) return true;
      const num = Number(val);
      if (isNaN(num) || num < 1 || num > 150) {
        throw new Error("Age must be a valid number between 1 and 150");
      }
      return true;
    }),
  body("location")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage("Location cannot exceed 120 characters"),
  body("gender")
    .optional({ nullable: true })
    .isIn(["Male", "Female", "Non-binary", "Other", "Prefer not to say", ""])
    .withMessage("Please select a valid gender option"),
  handleValidationErrors,
];

// Validation rules for User Password Update (self)
const validateUpdatePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  handleValidationErrors,
];

// Validation rules for Contact Us form
const validateContactMessage = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Please enter your name")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Please enter your email address")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Please enter a subject line")
    .isLength({ min: 3, max: 120 })
    .withMessage("Subject must be between 3 and 120 characters"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Please enter your message")
    .isLength({ min: 10, max: 3000 })
    .withMessage("Message must be between 10 and 3000 characters"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateTaskCreate,
  validateTaskUpdate,
  validateAdminCreateUser,
  validateAdminUpdatePassword,
  validateUpdateProfile,
  validateUpdatePassword,
  validateContactMessage,
};
