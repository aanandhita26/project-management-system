const express = require("express");
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
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

router.get(
  "/projects/:projectId/tasks/:taskId",
  authenticate,
  getTask
);

router.put(
  "/projects/:projectId/tasks/:taskId",
  authenticate,
  updateTask
);

router.delete(
  "/projects/:projectId/tasks/:taskId",
  authenticate,
  deleteTask
);
module.exports = router;