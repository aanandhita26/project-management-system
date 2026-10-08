const express = require("express");
const { createTask } = require("../controllers/taskController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/projects/:projectId/tasks",
  authenticate,
  createTask
);

module.exports = router;