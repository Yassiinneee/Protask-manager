const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const { memoryUsers } = require("./userController");
const { getCache, setCache, delCache } = require("../config/redis");

let memoryTasks = [
  {
    _id: "1",
    title: "Welcome to MERN Task Manager",
    description: "Explore the fully functional dashboard with search, filtering, and priority management.",
    status: "In Progress",
    priority: "High",
    category: "Development",
    dueDate: new Date(),
    assignedToName: "Admin User",
    assignedToEmail: "admin@taskmaster.pro",
    createdBy: "System Admin",
    createdAt: new Date()
  },
  {
    _id: "2",
    title: "Implement REST API endpoints",
    description: "Create robust backend routes for CRUD operations.",
    status: "Completed",
    priority: "Medium",
    category: "Backend",
    dueDate: new Date(),
    assignedToName: "Admin User",
    assignedToEmail: "admin@taskmaster.pro",
    createdBy: "System Admin",
    createdAt: new Date()
  }
];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @desc    Get tasks (personalized per user with Redis caching)
// @route   GET /api/tasks
// @access  Public / Private
const getTasks = async (req, res, next) => {
  try {
    const user = req.user;
    const isAdmin = user && user.role === "admin";
    const cacheKey = user ? (isAdmin ? "tasks:admin:all" : `tasks:user:${user._id}`) : "tasks:public";
    
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        count: cachedData.length,
        cacheHit: true,
        data: cachedData,
      });
    }

    let tasks = [];
    if (isMongoConnected()) {
      if (isAdmin) {
        // Admin can view all tasks across the system
        tasks = await Task.find({}).sort({ createdAt: -1 });
      } else if (user) {
        // Standard authenticated user gets personalized task list:
        // 1. Tasks they created (user)
        // 2. Tasks assigned directly to them (assignedTo or assignedToEmail)
        const userObjId = mongoose.Types.ObjectId.isValid(user._id) ? new mongoose.Types.ObjectId(user._id) : null;
        const queryConditions = [];

        if (userObjId) {
          queryConditions.push({ user: userObjId });
          queryConditions.push({ assignedTo: userObjId });
        }
        if (user.email) {
          queryConditions.push({ assignedToEmail: user.email.toLowerCase() });
        }

        if (queryConditions.length > 0) {
          tasks = await Task.find({ $or: queryConditions }).sort({ createdAt: -1 });
        } else {
          tasks = await Task.find({ user: user._id }).sort({ createdAt: -1 });
        }
      } else {
        // Public fallback
        tasks = await Task.find({}).sort({ createdAt: -1 }).limit(10);
      }
    } else {
      // Memory fallback
      if (isAdmin) {
        tasks = memoryTasks;
      } else if (user) {
        tasks = memoryTasks.filter(t => 
          (t.user && t.user === user._id) ||
          (t.assignedTo && t.assignedTo === user._id) ||
          (t.assignedToEmail && t.assignedToEmail.toLowerCase() === user.email.toLowerCase())
        );
      } else {
        tasks = memoryTasks;
      }
    }

    // Cache results in Redis for 60 seconds
    await setCache(cacheKey, tasks, 60);

    res.status(200).json({
      success: true,
      count: tasks.length,
      cacheHit: false,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private / Authenticated User
const createTask = async (req, res, next) => {
  try {
    const { 
      title, description, status, priority, category, dueDate, 
      assignedTo, assignedToName, assignedToEmail 
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a valid task title" });
    }

    const user = req.user;
    const isAdmin = user && user.role === "admin";
    const createdByName = user ? `${user.name}${isAdmin ? " (Admin)" : ""}` : "System Admin";
    const creatorUserId = user ? user._id : undefined;

    // Safe Due Date Parsing
    let parsedDueDate = new Date();
    if (dueDate) {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) {
        parsedDueDate = d;
      }
    }

    // Determine target assignee
    let finalAssignedTo = undefined;
    let finalAssignedToName = user ? user.name : "Unassigned";
    let finalAssignedToEmail = user ? user.email : "";

    if (assignedTo && assignedTo !== "all") {
      finalAssignedTo = assignedTo;
      if (assignedToName) finalAssignedToName = assignedToName;
      if (assignedToEmail) finalAssignedToEmail = assignedToEmail;
    } else if (user) {
      finalAssignedTo = user._id;
      finalAssignedToName = user.name;
      finalAssignedToEmail = user.email;
    }

    let newTask;
    if (isMongoConnected()) {
      const validCreatorId = (creatorUserId && mongoose.Types.ObjectId.isValid(creatorUserId)) ? new mongoose.Types.ObjectId(creatorUserId) : undefined;
      const validAssignedId = (finalAssignedTo && mongoose.Types.ObjectId.isValid(finalAssignedTo)) ? new mongoose.Types.ObjectId(finalAssignedTo) : undefined;

      newTask = await Task.create({
        title: title.trim(),
        description: description ? description.trim() : "",
        status: status || "Pending",
        priority: priority || "Medium",
        category: category ? category.trim() : "General",
        dueDate: parsedDueDate,
        user: validCreatorId,
        assignedTo: validAssignedId || validCreatorId,
        assignedToName: finalAssignedToName,
        assignedToEmail: finalAssignedToEmail,
        createdBy: createdByName,
      });
    } else {
      newTask = {
        _id: Date.now().toString(),
        title: title.trim(),
        description: description ? description.trim() : "",
        status: status || "Pending",
        priority: priority || "Medium",
        category: category ? category.trim() : "General",
        dueDate: parsedDueDate,
        user: creatorUserId,
        assignedTo: finalAssignedTo || (user ? user._id : null),
        assignedToName: finalAssignedToName,
        assignedToEmail: finalAssignedToEmail,
        createdBy: createdByName,
        createdAt: new Date(),
      };
      memoryTasks.unshift(newTask);
    }

    // Invalidate all task Redis caches
    await delCache("tasks:*");

    res.status(201).json({
      success: true,
      data: newTask,
      message: "Task created successfully"
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private / Authorized User
const updateTask = async (req, res, next) => {
  try {
    const user = req.user;
    const isAdmin = user && user.role === "admin";

    let updatedTask;
    if (isMongoConnected()) {
      let task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      // Check authorization
      if (!isAdmin && user) {
        const isOwner = task.user && task.user.toString() === user._id.toString();
        const isAssigned = (task.assignedTo && task.assignedTo.toString() === user._id.toString()) ||
                           (task.assignedToEmail && task.assignedToEmail.toLowerCase() === user.email.toLowerCase());
        if (!isOwner && !isAssigned) {
          return res.status(403).json({ success: false, message: "Not authorized to modify this task" });
        }
      }

      const updateData = { ...req.body };
      if (updateData.assignedTo && !mongoose.Types.ObjectId.isValid(updateData.assignedTo)) {
        delete updateData.assignedTo;
      }

      updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      const index = memoryTasks.findIndex(t => t._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      const task = memoryTasks[index];
      if (!isAdmin && user) {
        const isOwner = task.user && task.user === user._id;
        const isAssigned = (task.assignedTo && task.assignedTo === user._id) ||
                           (task.assignedToEmail && task.assignedToEmail.toLowerCase() === user.email.toLowerCase());
        if (!isOwner && !isAssigned) {
          return res.status(403).json({ success: false, message: "Not authorized to modify this task" });
        }
      }

      memoryTasks[index] = { ...memoryTasks[index], ...req.body };
      updatedTask = memoryTasks[index];
    }

    // Invalidate Redis cache
    await delCache("tasks:*");

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private / Authorized User
const deleteTask = async (req, res, next) => {
  try {
    const user = req.user;
    const isAdmin = user && user.role === "admin";

    if (isMongoConnected()) {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      // Check authorization: Admin can delete any task; standard user can only delete tasks they created
      if (!isAdmin && user) {
        const isOwner = task.user && task.user.toString() === user._id.toString();
        if (!isOwner) {
          return res.status(403).json({ success: false, message: "Not authorized to delete this task. Only the creator or an administrator can delete it." });
        }
      }

      await task.deleteOne();
    } else {
      const index = memoryTasks.findIndex(t => t._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      const task = memoryTasks[index];
      if (!isAdmin && user) {
        const isOwner = task.user && task.user === user._id;
        if (!isOwner) {
          return res.status(403).json({ success: false, message: "Not authorized to delete this task. Only the creator or an administrator can delete it." });
        }
      }

      memoryTasks.splice(index, 1);
    }

    // Invalidate Redis cache
    await delCache("tasks:*");

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};