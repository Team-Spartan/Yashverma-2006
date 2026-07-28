const express = require('express');
const { getDashboard, getUsers, toggleUserStatus, getVillageOverview } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(auth);

router.get('/dashboard', authorize('admin', 'official'), getDashboard);
router.get('/villages', authorize('admin', 'official'), getVillageOverview);
router.get('/users', authorize('admin'), getUsers);
router.patch('/users/:id/toggle-status', authorize('admin'), toggleUserStatus);

module.exports = router;
