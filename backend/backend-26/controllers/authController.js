const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper function to generate JWT token incorporating user ID and role
const generateToken = (id, role, email) => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// @desc    Authenticate user & get JWT token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user;
    let isMatch = false;

    const mongoose = require("mongoose");
    const bcrypt = require("bcryptjs");

    // Check if database is connected
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
      isMatch = await user.matchPassword(password);
    } else {
      // In-memory fallback for local development / testing without MongoDB
      const mockUsers = [
        {
          _id: "demo-user-1",
          name: "Sunita Sharma",
          email: "sunita@village.org",
          password: "password123",
          role: "Health_Worker",
          village: "Rampur Village"
        },
        {
          _id: "demo-user-2",
          name: "Admin User",
          email: "admin@jal.gov.in",
          password: "adminpassword",
          role: "Admin",
          village: "Central Headquarters"
        }
      ];

      user = mockUsers.find((u) => u.email === normalizedEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      isMatch = password === user.password;
    }

    // Verify password match result
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT containing user role, email, and ID
    const token = generateToken(user._id || user.id, user.role, user.email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        village: user.village
      }
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
      error: error.message
    });
  }
};

// @desc    Register a new user (for testing & seeding)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, village } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields"
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "Village_Representative",
      village: village || "Rampur"
    });

    const token = generateToken(user._id, user.role, user.email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        village: user.village
      }
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message
    });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private (Protected by JWT)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        village: user.village
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile",
      error: error.message
    });
  }
};
