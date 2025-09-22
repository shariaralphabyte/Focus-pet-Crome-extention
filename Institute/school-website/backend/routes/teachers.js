const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStats,
  getDepartments,
  getDesignations
} = require('../controllers/teacherController');

// Validation rules
const teacherValidation = [
  body('name.en').notEmpty().withMessage('English name is required'),
  body('name.bn').notEmpty().withMessage('Bengali name is required'),
  body('designation.en').notEmpty().withMessage('English designation is required'),
  body('designation.bn').notEmpty().withMessage('Bengali designation is required'),
  body('department.en').notEmpty().withMessage('English department is required'),
  body('department.bn').notEmpty().withMessage('Bengali department is required'),
  body('teacherId').notEmpty().withMessage('Teacher ID is required'),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('contactInfo.phone').optional().isMobilePhone().withMessage('Valid phone number is required')
];

// Public routes
router.get('/', getTeachers);
router.get('/stats', getTeacherStats);
router.get('/departments', getDepartments);
router.get('/designations', getDesignations);
router.get('/:id', getTeacher);

// Protected routes (Admin only)
router.post('/',
  protect,
  authorize('admin'),
  uploadSingle('photo'),
  teacherValidation,
  createTeacher
);

router.put('/:id',
  protect,
  authorize('admin'),
  uploadSingle('photo'),
  teacherValidation,
  updateTeacher
);

router.delete('/:id',
  protect,
  authorize('admin'),
  deleteTeacher
);

module.exports = router;
