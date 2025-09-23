const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const parseFormJsonFields = require('../middleware/parseForm');
const logBody = require('../middleware/logBody');
const ensureTeacherId = require('../middleware/ensureTeacherId');
const hydrateTeacherUpdate = require('../middleware/hydrateTeacherUpdate');

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
const teacherCreateValidation = [
  body('user.email').isEmail().withMessage('Valid email is required'),
  body('designation.en').notEmpty().withMessage('English designation is required'),
  body('designation.bn').notEmpty().withMessage('Bengali designation is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('joiningDate').isISO8601().withMessage('Valid joining date is required')
];

// For updates, allow partial payloads; only validate if present
const teacherUpdateValidation = [
  body('user.email').optional().isEmail().withMessage('Valid email is required'),
  body('designation.en').optional().notEmpty().withMessage('English designation is required'),
  body('designation.bn').optional().notEmpty().withMessage('Bengali designation is required'),
  body('department').optional().notEmpty().withMessage('Department is required'),
  body('joiningDate').optional().isISO8601().withMessage('Valid joining date is required')
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
  parseFormJsonFields,
  ensureTeacherId,
  logBody,
  teacherCreateValidation,
  createTeacher
);

router.put('/:id',
  protect,
  authorize('admin'),
  uploadSingle('photo'),
  parseFormJsonFields,
  ensureTeacherId,
  hydrateTeacherUpdate,
  logBody,
  teacherUpdateValidation,
  updateTeacher
);

router.delete('/:id',
  protect,
  authorize('admin'),
  deleteTeacher
);

module.exports = router;
