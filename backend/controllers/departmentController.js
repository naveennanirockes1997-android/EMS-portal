const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (Admin & HR)
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).populate('manager', 'name email designation');
    res.json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin & HR)
const createDepartment = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const deptExists = await Department.findOne({ name });
    if (deptExists) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const departmentData = { name, description };
    if (managerId) {
      departmentData.manager = managerId;
    }

    const department = await Department.create(departmentData);
    const populated = await department.populate('manager', 'name email designation');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin & HR)
const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    department.name = req.body.name || department.name;
    department.description = req.body.description !== undefined ? req.body.description : department.description;
    
    if (req.body.managerId !== undefined) {
      department.manager = req.body.managerId === '' ? null : req.body.managerId;
    }

    await department.save();
    const populated = await Department.findById(department._id).populate('manager', 'name email designation');

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
