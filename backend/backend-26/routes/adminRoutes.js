const express = require("express");
const router = express.Router();
const { getUsers, updateUserRole } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All admin routes require authentication (protect) and Admin role (authorize('Admin'))
router.use(protect);
router.use(authorize("Admin"));

// @route   GET /admin/users
// @desc    Get all users
router.get("/users", getUsers);

// @route   PATCH /admin/users/:id/role
// @desc    Update a user's role (Admin permissions validated)
router.patch("/users/:id/role", updateUserRole);

// @route   PUT /admin/users/:id/role
// @desc    Update a user's role (PUT alias)
router.put("/users/:id/role", updateUserRole);

module.exports = router;
