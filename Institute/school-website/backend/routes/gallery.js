const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple, uploadSingle } = require('../middleware/upload');

const {
  getGalleries,
  getGallery,
  getGalleryBySlug,
  createGallery,
  updateGallery,
  deleteGallery,
  addMediaToGallery,
  removeMediaFromGallery,
  getFeaturedGalleries,
  getRecentGalleries,
  getGalleriesByCategory,
  getGalleryCategories
} = require('../controllers/galleryController');

// Validation rules
const galleryValidation = [
  body('title.en').notEmpty().withMessage('English title is required'),
  body('title.bn').notEmpty().withMessage('Bengali title is required'),
  body('category').notEmpty().withMessage('Category is required')
];

// Public routes
router.get('/', getGalleries);
router.get('/featured', getFeaturedGalleries);
router.get('/recent', getRecentGalleries);
router.get('/categories', getGalleryCategories);
router.get('/category/:category', getGalleriesByCategory);
router.get('/slug/:slug', getGalleryBySlug);
router.get('/:id', getGallery);

// Protected routes (Admin only)
router.post('/',
  protect,
  authorize('admin'),
  uploadMultiple('media'),
  galleryValidation,
  createGallery
);

router.put('/:id',
  protect,
  authorize('admin'),
  uploadMultiple('media'),
  galleryValidation,
  updateGallery
);

router.delete('/:id',
  protect,
  authorize('admin'),
  deleteGallery
);

// Media management routes
router.post('/:id/media',
  protect,
  authorize('admin'),
  uploadSingle('media'),
  addMediaToGallery
);

router.delete('/:id/media/:mediaIndex',
  protect,
  authorize('admin'),
  removeMediaFromGallery
);

module.exports = router;
