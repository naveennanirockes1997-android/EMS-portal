const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user email
    const employee = await Employee.findOne({ email });

    if (employee && (await employee.matchPassword(password))) {
      res.json({
        success: true,
        _id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        token: generateToken(employee._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);
    if (employee) {
      res.json({
        success: true,
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        salary: employee.salary,
        joiningDate: employee.joiningDate,
        phone: employee.phone,
        designation: employee.designation,
      });
    } else {
      res.status(404).json({ success: false, message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee self profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);

    if (employee) {
      employee.name = req.body.name || employee.name;
      employee.phone = req.body.phone || employee.phone;
      
      if (req.body.password) {
        employee.password = req.body.password;
      }

      const updatedEmployee = await employee.save();

      res.json({
        success: true,
        _id: updatedEmployee._id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        role: updatedEmployee.role,
        department: updatedEmployee.department,
        phone: updatedEmployee.phone,
        designation: updatedEmployee.designation,
        token: generateToken(updatedEmployee._id),
      });
    } else {
      res.status(404).json({ success: false, message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new employee/user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in name, email and password' });
    }

    // Check if employee already exists
    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }

    const employee = await Employee.create({
      name,
      email,
      password,
      role: 'employee',
      department: 'General',
      salary: 0,
      phone,
      designation: 'Staff',
    });

    res.status(201).json({
      success: true,
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      token: generateToken(employee._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password - request reset code
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'No employee found with this email' });
    }

    // Generate random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set code and expiration (e.g. 10 minutes)
    employee.resetPasswordCode = resetCode;
    employee.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await employee.save({ validateBeforeSave: false });

    // Return the code directly for demonstration and verification
    res.json({
      success: true,
      message: 'Password reset code sent to email (simulated)',
      code: resetCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using reset code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, reset code, and new password' });
    }

    const employee = await Employee.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!employee) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    }

    // Set new password
    employee.password = newPassword;
    employee.resetPasswordCode = undefined;
    employee.resetPasswordExpire = undefined;

    await employee.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    QR Login & Clock In
// @route   POST /api/auth/qr-login-clock-in
// @access  Public
const qrLoginClockIn = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found with this email' });
    }

    // Get today's range
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: start, $lte: end },
    });

    let status = 'Present';
    let timeString;
    let alreadyClockedIn = false;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    if (hour > 9 || (hour === 9 && minute > 15)) {
      status = 'Late';
    }

    timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (!attendance) {
      attendance = await Attendance.create({
        employeeId: employee._id,
        date: now,
        status,
        clockIn: timeString,
      });
    } else {
      alreadyClockedIn = true;
      status = attendance.status;
      timeString = attendance.clockIn;
    }

    res.json({
      success: true,
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      token: generateToken(employee._id),
      clockIn: timeString,
      status,
      alreadyClockedIn,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  loginUser,
  getMe,
  updateProfile,
  registerUser,
  forgotPassword,
  resetPassword,
  qrLoginClockIn,
};
