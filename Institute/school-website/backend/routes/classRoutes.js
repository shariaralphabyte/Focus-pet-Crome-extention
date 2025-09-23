const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getActiveClasses,
  getClassesByLevel
} = require('../controllers/classController');
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Validation middleware
const classValidation = [
  body('name.en').notEmpty().withMessage('English name is required'),
  body('name.bn').notEmpty().withMessage('Bengali name is required'),
  body('level').isIn(['Primary', 'Secondary', 'Higher Secondary', 'Honors', 'Masters']).withMessage('Invalid level'),
  body('grade').notEmpty().withMessage('Grade is required')
];

// Public routes
router.get('/', getClasses);
router.get('/active', getActiveClasses);
router.get('/level/:level', getClassesByLevel);
router.get('/:id', getClassById);

// Protected routes (Admin only)
router.post('/', [protect, adminAuth, ...classValidation], createClass);
router.put('/:id', [protect, adminAuth, ...classValidation], updateClass);
router.delete('/:id', [protect, adminAuth], deleteClass);

module.exports = router;
