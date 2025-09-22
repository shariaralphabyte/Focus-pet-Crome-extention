const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const {
  getManagementCommittee,
  getManagementCommitteeMember,
  createManagementCommitteeMember,
  updateManagementCommitteeMember,
  deleteManagementCommitteeMember,
  getManagementCommitteeStats
} = require('../controllers/managementCommitteeController');

// Validation rules
const memberValidation = [
  body('name.en').notEmpty().withMessage('English name is required'),
  body('name.bn').notEmpty().withMessage('Bengali name is required'),
  body('position.en').notEmpty().withMessage('English position is required'),
  body('position.bn').notEmpty().withMessage('Bengali position is required'),
  body('category').isIn(['administrative', 'academic', 'parent', 'community']).withMessage('Valid category is required'),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('contactInfo.phone').optional().isMobilePhone().withMessage('Valid phone number is required')
];

// Public routes
router.get('/', getManagementCommittee);
router.get('/stats', getManagementCommitteeStats);
router.get('/:id', getManagementCommitteeMember);

// Protected routes (Admin only)
router.post('/', 
  protect, 
  authorize('admin'), 
  uploadSingle('photo'), 
  memberValidation, 
  createManagementCommitteeMember
);

router.put('/:id', 
  protect, 
  authorize('admin'), 
  uploadSingle('photo'), 
  memberValidation, 
  updateManagementCommitteeMember
);

router.delete('/:id', 
  protect, 
  authorize('admin'), 
  deleteManagementCommitteeMember
);

module.exports = router;
