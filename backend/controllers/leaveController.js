const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide leaveType, startDate, endDate and reason' });
    }

    const leave = await Leave.create({
      employeeId: req.user._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Leave applied successfully',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current employee's leaves
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user._id }).sort({ appliedDate: -1 });
    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leave requests (Admin & HR)
// @route   GET /api/leaves
// @access  Private (Admin & HR only)
const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name email department role designation')
      .populate('approvedBy', 'name email')
      .sort({ appliedDate: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id
// @access  Private (Admin & HR only)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid leave status' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    await leave.save();

    const populated = await Leave.findById(leave._id)
      .populate('employeeId', 'name email department role designation')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
