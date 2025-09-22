const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const {
  getSyllabi,
  getSyllabus,
  getSyllabusByClassAndSubject,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
  approveSyllabus,
  publishSyllabus,
  getClassesWithSyllabi,
  getSubjectsByClass
} = require('../controllers/syllabusController');

// Validation rules
const syllabusValidation = [
  body('title.en').notEmpty().withMessage('English title is required'),
  body('title.bn').notEmpty().withMessage('Bengali title is required'),
  body('class.en').notEmpty().withMessage('English class is required'),
  body('class.bn').notEmpty().withMessage('Bengali class is required'),
  body('subject.en').notEmpty().withMessage('English subject is required'),
  body('subject.bn').notEmpty().withMessage('Bengali subject is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required')
];

// Public routes
router.get('/', getSyllabi);
router.get('/classes', getClassesWithSyllabi);
router.get('/subjects/:class', getSubjectsByClass);
router.get('/class/:class/subject/:subject', getSyllabusByClassAndSubject);
router.get('/:id', getSyllabus);

// Protected routes (Admin/Teacher)
router.post('/',
  protect,
  authorize('admin', 'teacher'),
  uploadMultiple('attachments'),
  syllabusValidation,
  createSyllabus
);

router.put('/:id',
  protect,
  authorize('admin', 'teacher'),
  uploadMultiple('attachments'),
  syllabusValidation,
  updateSyllabus
);

// Admin only routes
router.delete('/:id', protect, authorize('admin'), deleteSyllabus);
router.put('/:id/approve', protect, authorize('admin'), approveSyllabus);
router.put('/:id/publish', protect, authorize('admin'), publishSyllabus);

module.exports = router;
