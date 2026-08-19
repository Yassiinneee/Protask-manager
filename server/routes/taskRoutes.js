const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { validateTaskCreate, validateTaskUpdate } = require("../middleware/validators");

router.route("/")
  .get(optionalProtect, getTasks)
  .post(protect, validateTaskCreate, createTask);

router.route("/:id")
  .put(protect, validateTaskUpdate, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
