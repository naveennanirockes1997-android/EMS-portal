const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getMyAttendance,
  getDailyAttendance,
  adminMarkAttendance,
  getMonthlySummary,
  qrMarkOption,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/qr-mark-option', qrMarkOption);

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/my-attendance', getMyAttendance);

// Monthly summary for current user or targeted user
router.get('/summary', getMonthlySummary);
router.get('/summary/:employeeId', getMonthlySummary);

// Admin & HR routes
router.get('/daily', authorize('admin', 'hr'), getDailyAttendance);
router.post('/admin-mark', authorize('admin', 'hr'), adminMarkAttendance);

module.exports = router;
