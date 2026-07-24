const mongoose = require("mongoose");
const Issue = require("../models/Issue");

// In-memory fallback array for local dev/test when DB connection is offline
let inMemoryIssues = [
  {
    _id: "iss-101",
    location: "Rampur North Community Well #2",
    description: "High turbidity observed in water samples after heavy rainfall. Discolored yellow water with earthy smell.",
    severity: "High",
    issueType: "High Turbidity",
    reporterName: "Sunita Sharma",
    reporterEmail: "sunita@rampur.org",
    status: "Open",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    _id: "iss-102",
    location: "Central Storage Tank, Block B",
    description: "Slight chemical odor reported by villagers during morning supply run.",
    severity: "Medium",
    issueType: "Chemical Odor",
    reporterName: "Rajesh Verma",
    reporterEmail: "rajesh@health.gov.in",
    status: "In Progress",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// @desc    Report a new water quality issue
// @route   POST /api/issues
// @access  Public / Protected
const createIssue = async (req, res) => {
  try {
    const { location, description, severity, issueType, reporterName, reporterEmail } = req.body;

    // Backend Validation
    if (!location || location.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Location is required."
      });
    }

    if (!description || description.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Issue description is required."
      });
    }

    if (!severity || !["Low", "Medium", "High", "Critical"].includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Valid severity level (Low, Medium, High, Critical) is required."
      });
    }

    // Determine user info if present from req.user
    const rName = reporterName || (req.user ? req.user.name : "Anonymous Representative");
    const rEmail = reporterEmail || (req.user ? req.user.email : "");

    let newIssue;

    // Check if Mongoose is connected to DB
    if (mongoose.connection.readyState === 1) {
      newIssue = await Issue.create({
        location: location.trim(),
        description: description.trim(),
        severity,
        issueType: issueType || "General Contamination",
        reporterName: rName,
        reporterEmail: rEmail
      });
    } else {
      // In-memory fallback if DB is not connected
      newIssue = {
        _id: `iss-${Date.now()}`,
        location: location.trim(),
        description: description.trim(),
        severity,
        issueType: issueType || "General Contamination",
        reporterName: rName,
        reporterEmail: rEmail,
        status: "Open",
        createdAt: new Date().toISOString()
      };
      inMemoryIssues.unshift(newIssue);
    }

    return res.status(201).json({
      success: true,
      message: "Water quality issue reported successfully!",
      issue: newIssue
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process issue report."
    });
  }
};

// @desc    Get all water quality issues
// @route   GET /api/issues
// @access  Public / Protected
const getIssues = async (req, res) => {
  try {
    let issues;
    if (mongoose.connection.readyState === 1) {
      issues = await Issue.find().sort({ createdAt: -1 });
    } else {
      issues = inMemoryIssues;
    }

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error fetching issues"
    });
  }
};

module.exports = {
  createIssue,
  getIssues
};
