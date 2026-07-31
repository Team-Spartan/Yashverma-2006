const express = require('express');
const { body } = require('express-validator');
const {
  createTest, getTests, getTestById, updateTest, deleteTest, getTrends, getStats, compareVillages,
} = require('../controllers/waterTestController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');

const router = express.Router();

const testValidation = [
  body('village').trim().notEmpty().withMessage('Village is required'),
  body('sourceName').trim().notEmpty().withMessage('Source name is required'),
  body('sourceType')
    .isIn(['well', 'handpump', 'tap', 'river', 'pond', 'other'])
    .withMessage('Invalid source type'),
  body('overallStatus')
    .isIn(['safe', 'caution', 'unsafe'])
    .withMessage('Overall status is required'),
  body('ph').optional().isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
  body('turbidity').optional().isFloat({ min: 0 }).withMessage('Turbidity must be positive'),
  body('tds').optional().isFloat({ min: 0 }).withMessage('TDS must be positive'),
  body('chlorine').optional().isFloat({ min: 0 }).withMessage('Chlorine must be positive'),
  body('bacteriaTest')
    .optional()
    .isIn(['safe', 'unsafe', 'not_tested'])
    .withMessage('Invalid bacteria test result'),
];

router.use(auth);

router.route('/')
  .get(authorize('health_worker', 'official', 'admin'), getTests)
  .post(authorize('health_worker', 'official', 'admin'), testValidation, validate, createTest);

router.get('/trends', authorize('health_worker', 'official', 'admin'), getTrends);
router.get('/stats', authorize('health_worker', 'official', 'admin'), getStats);
router.get('/compare', authorize('health_worker', 'official', 'admin'), compareVillages);

router.route('/:id')
  .get(authorize('health_worker', 'official', 'admin'), getTestById)
  .put(authorize('health_worker', 'official', 'admin').owner('WaterTest'), testValidation, validate, updateTest)
  .delete(authorize('admin'), deleteTest);

module.exports = router;
