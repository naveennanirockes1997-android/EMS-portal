const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Apply for leave or get my leave history
router.route('/').post(applyLeave);
router.route('/my-leaves').get(getMyLeaves);

// Admin & HR: view all leave requests or update their status
router.route('/all').get(authorize('admin', 'hr'), getAllLeaves);
router.route('/:id').put(authorize('admin', 'hr'), updateLeaveStatus);

module.exports = router;
