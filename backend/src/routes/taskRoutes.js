const express = require("express");
const {
  createTask,
  getTasks,
} = require("../controllers/taskController");
const authenticate = require("../middleware/authMiddleware");


const router = express.Router();

router.post(
  "/projects/:projectId/tasks",
  authenticate,
  createTask
);

router.get(
  "/projects/:projectId/tasks",
  authenticate,
  getTasks
);

module.exports = router;