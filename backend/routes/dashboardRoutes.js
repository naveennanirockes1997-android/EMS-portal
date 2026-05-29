const express = require('express');
const router = express.Router();
const { getAdminStats, getEmployeeStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/admin', authorize('admin', 'hr'), getAdminStats);
router.get('/employee', getEmployeeStats);

module.exports = router;
