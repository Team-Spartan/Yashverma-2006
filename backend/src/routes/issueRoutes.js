const express = require('express');
const { getIssues, createIssue, updateIssueStatus } = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getIssues)
  .post(createIssue);

router.route('/:id')
  .patch(authorize('health_worker', 'admin'), updateIssueStatus);

module.exports = router;
