const express = require("express");
const router = express.Router();
const { createIssue, getIssues, deleteIssue } = require("../controllers/issueController");

// Endpoint to list all reported water quality issues
router.get("/", getIssues);

// Endpoint to create a new water quality issue report
router.post("/", createIssue);

// Endpoint to delete a water quality issue report by ID
router.delete("/:id", deleteIssue);

module.exports = router;
