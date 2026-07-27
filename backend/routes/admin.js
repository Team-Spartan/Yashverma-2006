const express = require('express');
const { getDashboard, getUsers, toggleUserStatus, getVillageOverview } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(auth);
router.use(authorize('admin', 'official'));

router.get('/dashboard', getDashboard);
router.get('/villages', getVillageOverview);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
