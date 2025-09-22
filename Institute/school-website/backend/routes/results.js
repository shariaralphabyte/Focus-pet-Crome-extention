const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const {
  getResults,
  getResult,
  getResultsByStudent,
  getResultsByClass,
  createResult,
  updateResult,
  deleteResult,
  publishResult,
  getPublishedResults,
  getExamTypes,
  getClassesWithResults
} = require('../controllers/resultController');

// Validation rules
const resultValidation = [
  body('title.en').notEmpty().withMessage('English title is required'),
  body('title.bn').notEmpty().withMessage('Bengali title is required'),
  body('examName.en').notEmpty().withMessage('English exam name is required'),
  body('examName.bn').notEmpty().withMessage('Bengali exam name is required'),
  body('class.en').notEmpty().withMessage('English class is required'),
  body('class.bn').notEmpty().withMessage('Bengali class is required'),
  body('section').notEmpty().withMessage('Section is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('examType').notEmpty().withMessage('Exam type is required'),
  body('examDate').isISO8601().withMessage('Valid exam date is required')
];

// Public routes
router.get('/published', getPublishedResults);
router.get('/exam-types', getExamTypes);
router.get('/classes', getClassesWithResults);

// Protected routes (Admin/Teacher)
router.get('/', protect, authorize('admin', 'teacher'), getResults);
router.get('/student/:studentId', protect, authorize('admin', 'teacher'), getResultsByStudent);
router.get('/class/:class/:section', protect, authorize('admin', 'teacher'), getResultsByClass);
router.get('/:id', protect, authorize('admin', 'teacher'), getResult);

// Admin/Teacher routes
router.post('/',
  protect,
  authorize('admin', 'teacher'),
  uploadMultiple('attachments'),
  resultValidation,
  createResult
);

router.put('/:id',
  protect,
  authorize('admin', 'teacher'),
  uploadMultiple('attachments'),
  resultValidation,
  updateResult
);

// Admin only routes
router.delete('/:id', protect, authorize('admin'), deleteResult);
router.put('/:id/publish', protect, authorize('admin'), publishResult);

module.exports = router;
