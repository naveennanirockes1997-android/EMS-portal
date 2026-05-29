const Employee = require('../models/Employee');
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

module.exports = {
  loginUser,
  getMe,
  updateProfile,
};
