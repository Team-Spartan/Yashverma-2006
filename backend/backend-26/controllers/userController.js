const mongoose = require("mongoose");
const User = require("../models/User");

// In-memory fallback dataset when MongoDB connection is offline
let inMemoryUsers = [
  {
    _id: "usr-1",
    id: "usr-1",
    name: "Sunita Sharma",
    email: "sunita@rampur.org",
    role: "Village_Representative",
    village: "Rampur North"
  },
  {
    _id: "usr-2",
    id: "usr-2",
    name: "Rajesh Verma",
    email: "rajesh@health.gov.in",
    role: "Health_Worker",
    village: "Rampur Central"
  },
  {
    _id: "usr-3",
    id: "usr-3",
    name: "Priya Patel",
    email: "priya@authority.org",
    role: "Authority",
    village: "District HQs"
  },
  {
    _id: "usr-4",
    id: "usr-4",
    name: "Admin Officer",
    email: "admin@jalsuraksha.org",
    role: "Admin",
    village: "State HQ"
  }
];

// @desc    Get all registered users
// @route   GET /api/users or GET /api/admin/users
// @access  Private / Admin
exports.getUsers = async (req, res) => {
  try {
    let users;

    if (mongoose.connection.readyState === 1) {
      users = await User.find().select("-password").sort({ createdAt: -1 });
    } else {
      users = inMemoryUsers;
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching user list",
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PATCH /api/users/:id/role or PUT /api/users/:id/role
// @access  Private / Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["Village_Representative", "Health_Worker", "Authority", "Admin"];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}`
      });
    }

    let updatedUser;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      user.role = role;
      await user.save();

      updatedUser = {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        village: user.village
      };
    } else {
      // In-memory fallback update
      const targetId = req.params.id;
      const user = inMemoryUsers.find((u) => u._id === targetId || u.id === targetId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      user.role = role;
      updatedUser = user;
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user role:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error updating user role",
      error: error.message
    });
  }
};
