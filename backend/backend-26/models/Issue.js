const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true
    },
    severity: {
      type: String,
      required: [true, "Severity is required"],
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },
    issueType: {
      type: String,
      default: "General Contamination"
    },
    reporterName: {
      type: String,
      default: "Anonymous Representative"
    },
    reporterEmail: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Issue", issueSchema);
