const express = require('express');
const { body } = require('express-validator');
const {
  createIssue, getIssues, getIssueById, updateIssue, deleteIssue,
} = require('../controllers/issueController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');

const router = express.Router();

const issueValidation = [
  body('village').trim().notEmpty().withMessage('Village is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category')
    .isIn(['contamination', 'infrastructure', 'supply_shortage', 'flooding', 'other'])
    .withMessage('Invalid category'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
];

router.use(auth);

router.route('/')
  .get(getIssues)
  .post(authorize('health_worker', 'official', 'admin'), issueValidation, validate, createIssue);

router.route('/:id')
  .get(getIssueById)
  .put(authorize('health_worker', 'official', 'admin'), updateIssue)
  .delete(authorize('admin'), deleteIssue);

module.exports = router;
