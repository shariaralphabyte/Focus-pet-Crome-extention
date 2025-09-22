const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const {
  getEvents,
  getEvent,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  getFeaturedEvents,
  getPopularEvents,
  getRecentEvents,
  addComment,
  getCategories
} = require('../controllers/eventController');

// Validation rules
const eventValidation = [
  body('title.en').notEmpty().withMessage('English title is required'),
  body('title.bn').notEmpty().withMessage('Bengali title is required'),
  body('content.en').notEmpty().withMessage('English content is required'),
  body('content.bn').notEmpty().withMessage('Bengali content is required'),
  body('category').notEmpty().withMessage('Category is required')
];

const commentValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('content').notEmpty().withMessage('Comment content is required')
];

// Public routes
router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/popular', getPopularEvents);
router.get('/recent', getRecentEvents);
router.get('/categories', getCategories);
router.get('/slug/:slug', getEventBySlug);
router.get('/:id', getEvent);
router.post('/:id/comments', commentValidation, addComment);

// Protected routes (Admin only)
router.post('/',
  protect,
  authorize('admin'),
  uploadSingle('featuredImage'),
  eventValidation,
  createEvent
);

router.put('/:id',
  protect,
  authorize('admin'),
  uploadSingle('featuredImage'),
  eventValidation,
  updateEvent
);

router.delete('/:id',
  protect,
  authorize('admin'),
  deleteEvent
);

module.exports = router;
