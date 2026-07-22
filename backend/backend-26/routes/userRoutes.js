const express = require("express");
const router = express.Router();
const { getUsers, updateUserRole } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Apply protect & authorize middleware to user administration endpoints
router.use(protect);
router.use(authorize("Admin"));

// Get all users
router.get("/", getUsers);

// Update user role (PATCH & PUT)
router.patch("/:id/role", updateUserRole);
router.put("/:id/role", updateUserRole);

module.exports = router;
