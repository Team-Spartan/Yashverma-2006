const express = require("express");
const router = express.Router();
const { createIssue, getIssues } = require("../controllers/issueController");

// Endpoint to list all reported water quality issues
router.get("/", getIssues);

// Endpoint to create a new water quality issue report
router.post("/", createIssue);

module.exports = router;
