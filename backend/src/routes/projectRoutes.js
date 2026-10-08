const express = require("express");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
} = require("../controllers/projectController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createProject);
router.get("/", authenticate, getProjects);
router.get("/:id", authenticate, getProject);
router.put("/:id", authenticate, updateProject);

module.exports = router;