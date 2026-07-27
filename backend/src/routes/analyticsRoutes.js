const express = require('express');
const { getDashboardData } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardData);

module.exports = router;
