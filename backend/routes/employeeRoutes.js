const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Admin & HR can get all employees, get specific employee, create employees, or update employees
router
  .route('/')
  .get(authorize('admin', 'hr'), getEmployees)
  .post(authorize('admin', 'hr'), createEmployee);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('admin', 'hr'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee); // Only Admin can delete

module.exports = router;
