const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');

const {
  getManagementCommittee,
  getManagementCommitteeMember,
  createManagementCommitteeMember,
  updateManagementCommitteeMember,
  deleteManagementCommitteeMember,
  getManagementCommitteeStats
} = require('../controllers/managementCommitteeController');

const { protect, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation rules
const createValidation = [
  body('name.en').notEmpty().withMessage('English name is required'),
  body('name.bn').notEmpty().withMessage('Bengali name is required'),
  body('position.en').notEmpty().withMessage('English position is required'),
  body('position.bn').notEmpty().withMessage('Bengali position is required'),
  body('qualification.en').notEmpty().withMessage('English qualification is required'),
  body('qualification.bn').notEmpty().withMessage('Bengali qualification is required'),
  body('experience.en').notEmpty().withMessage('English experience is required'),
  body('experience.bn').notEmpty().withMessage('Bengali experience is required'),
  body('bio.en').notEmpty().withMessage('English bio is required'),
  body('bio.bn').notEmpty().withMessage('Bengali bio is required'),
  body('contactInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required'),
  body('joinDate').isISO8601().withMessage('Valid join date is required'),
  body('category').isIn(['leadership', 'academic', 'administration', 'finance']).withMessage('Valid category is required')
];

const updateValidation = [
  body('name.en').optional().notEmpty().withMessage('English name cannot be empty'),
  body('name.bn').optional().notEmpty().withMessage('Bengali name cannot be empty'),
  body('position.en').optional().notEmpty().withMessage('English position cannot be empty'),
  body('position.bn').optional().notEmpty().withMessage('Bengali position cannot be empty'),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('joinDate').optional().isISO8601().withMessage('Valid join date is required'),
  body('category').optional().isIn(['leadership', 'academic', 'administration', 'finance']).withMessage('Valid category is required')
];

// Public routes
router.get('/', getManagementCommittee);
router.get('/stats', getManagementCommitteeStats);
router.get('/:id', getManagementCommitteeMember);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), upload.single('photo'), createValidation, createManagementCommitteeMember);
router.put('/:id', protect, authorize('admin'), upload.single('photo'), updateValidation, updateManagementCommitteeMember);
router.delete('/:id', protect, authorize('admin'), deleteManagementCommitteeMember);

module.exports = router;
