const express = require("express");
const router = express.Router();
const { 
  generateTaskDescription, 
  refineTaskDescription 
} = require("../controllers/aiController");

// AI endpoints (open or session/token verified)
router.post("/generate-description", generateTaskDescription);
router.post("/refine-description", refineTaskDescription);

module.exports = router;
