const express = require("express");
const router = express.Router();
const { loginUser, registerUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", loginUser);
router.post("/register", registerUser);

// Protected routes (Requires valid JWT header)
router.get("/me", protect, getMe);

module.exports = router;
