const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  getClasses,
  getSectionsByClass
} = require('../controllers/studentController');

// Validation rules
const studentValidation = [
  body('name.en').notEmpty().withMessage('English name is required'),
  body('name.bn').notEmpty().withMessage('Bengali name is required'),
  body('class.en').notEmpty().withMessage('English class is required'),
  body('class.bn').notEmpty().withMessage('Bengali class is required'),
  body('section').notEmpty().withMessage('Section is required'),
  body('rollNumber').isInt({ min: 1 }).withMessage('Valid roll number is required'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('session').notEmpty().withMessage('Session is required')
];

// Public routes
router.get('/public', getStudents); // Public access to student list (limited info)
router.get('/classes', getClasses);
router.get('/sections/:class', getSectionsByClass);

// Protected routes (Admin/Teacher)
router.get('/', protect, authorize('admin', 'teacher'), getStudents);
router.get('/stats', protect, authorize('admin', 'teacher'), getStudentStats);
router.get('/:id', protect, authorize('admin', 'teacher'), getStudent);

// Admin only routes
router.post('/',
  protect,
  authorize('admin'),
  uploadSingle('photo'),
  studentValidation,
  createStudent
);

router.put('/:id',
  protect,
  authorize('admin'),
  uploadSingle('photo'),
  studentValidation,
  updateStudent
);

router.delete('/:id',
  protect,
  authorize('admin'),
  deleteStudent
);

module.exports = router;
