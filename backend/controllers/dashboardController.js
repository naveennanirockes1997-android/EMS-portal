const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Department = require('../models/Department');
const os = require('os');

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
};

// Helper to get start and end of today
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Get admin analytics and summary stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin & HR only)
const getAdminStats = async (req, res) => {
  try {
    // 1. Total Counts
    const totalEmployees = await Employee.countDocuments({});
    
    // Departments: we can count from Department model or aggregate unique from Employee.
    // Let's do both: count Department model, if 0 count distinct employee departments.
    let totalDepartments = await Department.countDocuments({});
    if (totalDepartments === 0) {
      const distinctDeps = await Employee.distinct('department');
      totalDepartments = distinctDeps.length;
    }

    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // 2. Today's Attendance
    const { start, end } = getTodayRange();
    const todayAttendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    });

    const attendanceStats = {
      present: 0,
      late: 0,
      absent: 0,
      halfDay: 0,
      markedCount: todayAttendance.length,
    };

    todayAttendance.forEach((record) => {
      if (record.status === 'Present') attendanceStats.present++;
      else if (record.status === 'Late') attendanceStats.late++;
      else if (record.status === 'Absent') attendanceStats.absent++;
      else if (record.status === 'Half-day') attendanceStats.halfDay++;
    });

    attendanceStats.presentRate = totalEmployees > 0 
      ? Math.round(((attendanceStats.present + attendanceStats.late + attendanceStats.halfDay) / totalEmployees) * 100) 
      : 0;

    // 3. Department breakdown
    const departmentBreakdown = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
        },
      },
      {
        $project: {
          department: '$_id',
          count: 1,
          avgSalary: { $round: ['$avgSalary', 2] },
          _id: 0,
        },
      },
    ]);

    // 4. Role breakdown
    const roleBreakdown = await Employee.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 5. Recent Leaves (limit 5)
    const recentLeaves = await Leave.find({})
      .populate('employeeId', 'name email department designation')
      .sort({ appliedDate: -1 })
      .limit(5);

    // 6. Recent Added Employees (limit 5)
    const recentEmployees = await Employee.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        summary: {
          totalEmployees,
          totalDepartments,
          pendingLeaves,
          attendancePresentRate: attendanceStats.presentRate,
        },
        attendanceToday: attendanceStats,
        departmentBreakdown,
        roleBreakdown,
        recentLeaves,
        recentEmployees,
        localIp: getLocalIp(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee self statistics
// @route   GET /api/dashboard/employee
// @access  Private
const getEmployeeStats = async (req, res) => {
  try {
    const employeeId = req.user._id;

    // 1. Get total leave statistics
    const leaves = await Leave.find({ employeeId });
    const leaveStats = {
      total: leaves.length,
      pending: leaves.filter(l => l.status === 'Pending').length,
      approved: leaves.filter(l => l.status === 'Approved').length,
      rejected: leaves.filter(l => l.status === 'Rejected').length,
    };

    // 2. Get attendance statistics (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyAttendance = await Attendance.find({
      employeeId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const attendanceStats = {
      present: monthlyAttendance.filter(a => a.status === 'Present').length,
      late: monthlyAttendance.filter(a => a.status === 'Late').length,
      absent: monthlyAttendance.filter(a => a.status === 'Absent').length,
      halfDay: monthlyAttendance.filter(a => a.status === 'Half-day').length,
      totalMarked: monthlyAttendance.length,
    };

    // 3. Check if clocked in today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayRecord = await Attendance.findOne({
      employeeId,
      date: { $gte: startOfToday, $lte: endOfToday },
    });

    const todayClockStatus = {
      isClockedIn: !!todayRecord,
      isClockedOut: todayRecord ? !!todayRecord.clockOut : false,
      clockInTime: todayRecord ? todayRecord.clockIn : null,
      clockOutTime: todayRecord ? todayRecord.clockOut : null,
      statusToday: todayRecord ? todayRecord.status : null,
    };

    res.json({
      success: true,
      data: {
        leaveStats,
        attendanceStats,
        todayClockStatus,
        localIp: getLocalIp(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getEmployeeStats,
};
