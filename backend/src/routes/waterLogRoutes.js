const express = require('express');
const { getWaterLogs, createWaterLog, getWaterLogById } = require('../controllers/waterLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWaterLogs)
  .post(authorize('village_rep', 'admin'), createWaterLog);

router.route('/:id')
  .get(getWaterLogById);

module.exports = router;
