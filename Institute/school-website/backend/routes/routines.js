const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const {
  getRoutines,
  getRoutine,
  getCurrentRoutine,
  getExamRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  approveRoutine,
  publishRoutine,
  getClassesWithRoutines,
  getSectionsByClass
} = require('../controllers/routineController');

// Validation rules
const routineValidation = [
  body('title.en').notEmpty().withMessage('English title is required'),
  body('title.bn').notEmpty().withMessage('Bengali title is required'),
  body('class.en').notEmpty().withMessage('English class is required'),
  body('class.bn').notEmpty().withMessage('Bengali class is required'),
  body('section').notEmpty().withMessage('Section is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('type').notEmpty().withMessage('Routine type is required'),
  body('effectiveFrom').isISO8601().withMessage('Valid effective from date is required')
];

// Public routes
router.get('/', getRoutines);
router.get('/classes', getClassesWithRoutines);
router.get('/sections/:class', getSectionsByClass);
router.get('/current/:class/:section', getCurrentRoutine);
router.get('/exams/:class/:section', getExamRoutines);
router.get('/:id', getRoutine);

// Protected routes (Admin/Teacher)
router.post('/',
  protect,
  authorize('admin', 'teacher'),
  uploadMultiple('attachments'),
  routineValidation,
  createRoutine
);

router.put('/:id',
  protect,
  authorize('admin', 'teacher'),
  uploadMultiple('attachments'),
  routineValidation,
  updateRoutine
);

// Admin only routes
router.delete('/:id', protect, authorize('admin'), deleteRoutine);
router.put('/:id/approve', protect, authorize('admin'), approveRoutine);
router.put('/:id/publish', protect, authorize('admin'), publishRoutine);

module.exports = router;
