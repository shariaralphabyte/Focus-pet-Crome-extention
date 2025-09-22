const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');

const {
  getInstitutionSettings,
  updateInstitutionSettings,
  getInstitutionStatistics,
  uploadInstitutionMedia,
  deleteInstitutionMedia,
  getInstitutionDashboard
} = require('../controllers/institutionController');

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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and some document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'), false);
    }
  }
});

// Validation rules for settings update
const settingsValidation = [
  body('institutionName.en').optional().notEmpty().withMessage('English institution name cannot be empty'),
  body('institutionName.bn').optional().notEmpty().withMessage('Bengali institution name cannot be empty'),
  body('establishmentYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Valid establishment year is required'),
  body('contactInfo.email.*').optional().isEmail().withMessage('Valid email addresses are required'),
  body('contactInfo.phone.*').optional().isMobilePhone().withMessage('Valid phone numbers are required')
];

// Public routes
router.get('/settings', getInstitutionSettings);
router.get('/statistics', getInstitutionStatistics);

// Protected routes (Admin only)
router.put('/settings', protect, authorize('admin'), settingsValidation, updateInstitutionSettings);
router.post('/media', protect, authorize('admin'), upload.single('file'), uploadInstitutionMedia);
router.delete('/media/:type/:id', protect, authorize('admin'), deleteInstitutionMedia);
router.get('/dashboard', protect, authorize('admin'), getInstitutionDashboard);

module.exports = router;
