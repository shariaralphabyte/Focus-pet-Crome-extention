const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { uploadMultiple } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
  getNoticeStats,
  togglePublishStatus
} = require('../controllers/noticeController');

// Validation rules
const createValidation = [
  body('title.en').notEmpty().withMessage('English title is required'),
  body('title.bn').notEmpty().withMessage('Bengali title is required'),
  body('content.en').notEmpty().withMessage('English content is required'),
  body('content.bn').notEmpty().withMessage('Bengali content is required'),
  body('category').isIn([
    'General', 'Academic', 'Examination', 'Admission', 'Holiday',
    'Event', 'Sports', 'Cultural', 'Emergency', 'Fee', 'Result',
    'Meeting', 'Training', 'Workshop'
  ]).withMessage('Valid category is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('targetAudience').optional().isArray(),
  body('publishDate').optional().isISO8601().withMessage('Valid publish date required'),
  body('expiryDate').optional().isISO8601().withMessage('Valid expiry date required')
];

const updateValidation = [
  body('title.en').optional().notEmpty().withMessage('English title cannot be empty'),
  body('title.bn').optional().notEmpty().withMessage('Bengali title cannot be empty'),
  body('content.en').optional().notEmpty().withMessage('English content cannot be empty'),
  body('content.bn').optional().notEmpty().withMessage('Bengali content cannot be empty'),
  body('category').optional().isIn([
    'General', 'Academic', 'Examination', 'Admission', 'Holiday',
    'Event', 'Sports', 'Cultural', 'Emergency', 'Fee', 'Result',
    'Meeting', 'Training', 'Workshop'
  ]).withMessage('Valid category is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('publishDate').optional().isISO8601().withMessage('Valid publish date required'),
  body('expiryDate').optional().isISO8601().withMessage('Valid expiry date required')
];

// Public routes
router.get('/', getNotices);
router.get('/stats', getNoticeStats);
router.get('/:id', getNotice);

// Protected routes (Admin/Teacher)
router.post('/', 
  protect, 
  authorize('admin', 'teacher'), 
  uploadMultiple('attachments', 5), 
  createValidation, 
  createNotice
);

router.put('/:id', 
  protect, 
  authorize('admin', 'teacher'), 
  uploadMultiple('attachments', 5), 
  updateValidation, 
  updateNotice
);

router.delete('/:id', 
  protect, 
  authorize('admin', 'teacher'), 
  deleteNotice
);

router.patch('/:id/toggle-publish', 
  protect, 
  authorize('admin', 'teacher'), 
  togglePublishStatus
);

module.exports = router;
