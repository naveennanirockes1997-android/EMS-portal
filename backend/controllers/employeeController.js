const Employee = require('../models/Employee');

// @desc    Get all employees (with search and filters)
// @route   GET /api/employees
// @access  Private (Admin & HR only)
const getEmployees = async (req, res) => {
  try {
    const { search, department, role } = req.query;

    let query = {};

    // Search query (name or email)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (department && department !== 'All') {
      query.department = department;
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    const employees = await Employee.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin & HR only)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, salary, joiningDate, phone, designation } = req.body;

    // Check if employee already exists
    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }

    const employee = await Employee.create({
      name,
      email,
      password,
      role: role || 'employee',
      department: department || 'General',
      salary,
      joiningDate: joiningDate || Date.now(),
      phone,
      designation: designation || 'Staff',
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        designation: employee.designation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin & HR only)
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.name = req.body.name || employee.name;
    employee.email = req.body.email || employee.email;
    employee.role = req.body.role || employee.role;
    employee.department = req.body.department || employee.department;
    employee.salary = req.body.salary !== undefined ? req.body.salary : employee.salary;
    employee.phone = req.body.phone !== undefined ? req.body.phone : employee.phone;
    employee.designation = req.body.designation || employee.designation;
    if (req.body.joiningDate) {
      employee.joiningDate = req.body.joiningDate;
    }

    // Update password if provided
    if (req.body.password && req.body.password.trim() !== '') {
      employee.password = req.body.password;
    }

    const updatedEmployee = await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        _id: updatedEmployee._id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        role: updatedEmployee.role,
        department: updatedEmployee.department,
        salary: updatedEmployee.salary,
        designation: updatedEmployee.designation,
        phone: updatedEmployee.phone,
        joiningDate: updatedEmployee.joiningDate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Don't allow an admin to delete themselves
    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete themselves' });
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
