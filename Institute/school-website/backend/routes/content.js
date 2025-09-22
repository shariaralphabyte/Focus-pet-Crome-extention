const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const {
  getContentByKey,
  getContentByType,
  getHeroSlides,
  getVisionMission,
  createContent,
  updateContent,
  deleteContent,
  publishContent,
  unpublishContent,
  getAllContent,
  inlineUpdateContent
} = require('../controllers/contentController');

// Validation rules
const contentValidation = [
  body('key').notEmpty().withMessage('Content key is required'),
  body('type').notEmpty().withMessage('Content type is required')
];

// Public routes
router.get('/key/:key', getContentByKey);
router.get('/type/:type', getContentByType);
router.get('/hero-slides', getHeroSlides);
router.get('/vision-mission', getVisionMission);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin'), getAllContent);

router.post('/',
  protect,
  authorize('admin'),
  uploadMultiple('media'),
  contentValidation,
  createContent
);

router.put('/:id',
  protect,
  authorize('admin'),
  uploadMultiple('media'),
  updateContent
);

router.delete('/:id',
  protect,
  authorize('admin'),
  deleteContent
);

router.put('/:id/publish',
  protect,
  authorize('admin'),
  publishContent
);

router.put('/:id/unpublish',
  protect,
  authorize('admin'),
  unpublishContent
);

// Inline editing route
router.patch('/:key/inline',
  protect,
  authorize('admin'),
  inlineUpdateContent
);

module.exports = router;
