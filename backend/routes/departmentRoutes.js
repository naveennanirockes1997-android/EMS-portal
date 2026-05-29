const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'hr'));

router.route('/')
  .get(getDepartments)
  .post(createDepartment);

router.route('/:id')
  .put(updateDepartment)
  .delete(authorize('admin'), deleteDepartment); // Only admin can delete

module.exports = router;
