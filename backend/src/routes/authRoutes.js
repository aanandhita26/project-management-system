const express = require("express");
const {
  register,
  login,
} = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, (req, res) => {
  res.json({
    message: "Authentication successful",
    user: req.user,
  });
});

module.exports = router;