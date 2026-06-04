const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Helper to get start and end of a specific date in UTC/local timezone
const getDateRange = (dateStr) => {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Mark attendance for current day (Employee Clock In/Out)
// @route   POST /api/attendance/clock-in
// @access  Private
const clockIn = async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDateRange(today);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (attendance) {
      return res.status(400).json({ success: false, message: 'You have already clocked in for today!' });
    }

    // Determine status based on clock in time
    // Standard time is 9:00 AM. If clocking in after 9:15 AM, status is 'Late'
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    let status = 'Present';

    if (hour > 9 || (hour === 9 && minute > 15)) {
      status = 'Late';
    }

    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    attendance = await Attendance.create({
      employeeId: req.user._id,
      date: today,
      status,
      clockIn: timeString,
      shift: 'Morning Shift (09:00 AM - 05:00 PM)',
    });

    res.status(201).json({
      success: true,
      message: `Clocked in successfully as ${status} at ${timeString}`,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clock out for current day
// @route   POST /api/attendance/clock-out
// @access  Private
const clockOut = async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDateRange(today);

    let attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'You must clock in first before clocking out!' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ success: false, message: 'You have already clocked out for today!' });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    attendance.clockOut = timeString;
    await attendance.save();

    res.json({
      success: true,
      message: `Clocked out successfully at ${timeString}`,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current employee's attendance history
// @route   GET /api/attendance/my-attendance
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ employeeId: req.user._id }).sort({ date: -1 });
    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all daily attendance (Admin & HR)
// @route   GET /api/attendance/daily
// @access  Private (Admin & HR only)
const getDailyAttendance = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const { start, end } = getDateRange(dateStr);

    const attendanceRecords = await Attendance.find({
      date: { $gte: start, $lte: end },
    }).populate('employeeId', 'name email department role designation');

    res.json({ success: true, date: dateStr, count: attendanceRecords.length, data: attendanceRecords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin mark/update attendance for any employee
// @route   POST /api/attendance/admin-mark
// @access  Private (Admin & HR only)
const adminMarkAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, clockIn, clockOut, shift } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ success: false, message: 'Please provide employeeId, date and status' });
    }

    const { start, end } = getDateRange(date);

    // Find existing record
    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: start, $lte: end },
    });

    if (attendance) {
      attendance.status = status;
      if (clockIn) attendance.clockIn = clockIn;
      if (clockOut) attendance.clockOut = clockOut;
      if (shift) attendance.shift = shift;
      await attendance.save();
    } else {
      // Create new
      attendance = await Attendance.create({
        employeeId,
        date: new Date(date),
        status,
        clockIn: clockIn || '09:00 AM',
        clockOut: clockOut || '05:00 PM',
        shift: shift || 'Morning Shift (09:00 AM - 05:00 PM)',
      });
    }

    const populated = await attendance.populate('employeeId', 'name email department');

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly summary of attendance for a user
// @route   GET /api/attendance/summary/:employeeId
// @access  Private
const getMonthlySummary = async (req, res) => {
  try {
    const employeeId = req.params.employeeId || req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1); // 1-12

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: start, $lte: end },
    });

    const summary = {
      present: 0,
      late: 0,
      absent: 0,
      halfDay: 0,
      totalDays: attendance.length,
    };

    attendance.forEach((record) => {
      if (record.status === 'Present') summary.present++;
      else if (record.status === 'Late') summary.late++;
      else if (record.status === 'Absent') summary.absent++;
      else if (record.status === 'Half-day') summary.halfDay++;
    });

    res.json({
      success: true,
      year,
      month,
      employeeId,
      data: {
        summary,
        history: attendance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance via QR Scan (Present or Absent option)
// @route   POST /api/attendance/qr-mark-option
// @access  Public
const qrMarkOption = async (req, res) => {
  const { email, option, shift } = req.body;

  try {
    if (!email || !option) {
      return res.status(400).json({ success: false, message: 'Please provide email and option' });
    }

    if (option !== 'Present' && option !== 'Absent') {
      return res.status(400).json({ success: false, message: 'Option must be Present or Absent' });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found with this email' });
    }

    // Today's range
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: start, $lte: end },
    });

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const selectedShift = shift || 'Morning Shift (09:00 AM - 05:00 PM)';

    if (option === 'Present') {
      let status = 'Present';
      const hour = now.getHours();
      const minute = now.getMinutes();

      if (selectedShift.includes('Afternoon')) {
        if (hour > 14 || (hour === 14 && minute > 15)) {
          status = 'Late';
        }
      } else if (selectedShift.includes('Night')) {
        if (hour > 22 || (hour === 22 && minute > 15)) {
          status = 'Late';
        }
      } else {
        if (hour > 9 || (hour === 9 && minute > 15)) {
          status = 'Late';
        }
      }

      if (!attendance) {
        attendance = await Attendance.create({
          employeeId: employee._id,
          date: now,
          status,
          clockIn: timeString,
          shift: selectedShift,
        });
      } else {
        attendance.status = status;
        if (!attendance.clockIn) {
          attendance.clockIn = timeString;
        }
        attendance.shift = selectedShift;
        await attendance.save();
      }
    } else {
      // option === 'Absent'
      if (!attendance) {
        attendance = await Attendance.create({
          employeeId: employee._id,
          date: now,
          status: 'Absent',
          clockIn: '',
          clockOut: '',
          shift: selectedShift,
        });
      } else {
        attendance.status = 'Absent';
        attendance.clockIn = '';
        attendance.clockOut = '';
        attendance.shift = selectedShift;
        await attendance.save();
      }
    }

    res.json({
      success: true,
      message: `Successfully marked attendance as ${option === 'Present' ? 'Present' : 'Absent'}`,
      data: {
        name: employee.name,
        email: employee.email,
        status: attendance.status,
        clockIn: attendance.clockIn,
        shift: attendance.shift,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getMyAttendance,
  getDailyAttendance,
  adminMarkAttendance,
  getMonthlySummary,
  qrMarkOption,
};
