const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes by verifying JWT in Authorization header
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (Format: Bearer <token>)
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret"
      );

      // Get user from database excluding password field
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found for provided token"
        });
      }

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed or expired"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided"
    });
  }
};
