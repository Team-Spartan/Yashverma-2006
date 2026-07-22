const express = require("express");
const router = express.Router();
const { getUsers, updateUserRole } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Apply protect middleware to all user routes
router.use(protect);

// Get all users (Admin only)
router.get("/", authorize("Admin"), getUsers);

// Update user role (Admin only)
router.put("/:id/role", authorize("Admin"), updateUserRole);

module.exports = router;
