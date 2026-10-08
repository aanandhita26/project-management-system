const express = require("express");
const { createProject } = require("../controllers/projectController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createProject);

module.exports = router;