const Routine = require('../models/Routine');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// @desc    Get all routines
// @route   GET /api/routines
// @access  Public
exports.getRoutines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'published', isActive: true };
    
    // Add filters
    if (req.query.class) {
      query.$or = [
        { 'class.en': req.query.class },
        { 'class.bn': req.query.class }
      ];
    }
    if (req.query.section) {
      query.section = req.query.section;
    }
    if (req.query.academicYear) {
      query.academicYear = req.query.academicYear;
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.semester) {
      query.semester = req.query.semester;
    }

    // Add search functionality
    if (req.query.search) {
      query.$or = [
        { 'title.en': { $regex: req.query.search, $options: 'i' } },
        { 'title.bn': { $regex: req.query.search, $options: 'i' } },
        { 'class.en': { $regex: req.query.search, $options: 'i' } },
        { 'class.bn': { $regex: req.query.search, $options: 'i' } },
        { section: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const routines = await Routine.find(query)
      .populate('schedule.periods.teacher', 'name designation')
      .populate('examSchedule.invigilator', 'name designation')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ effectiveFrom: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Routine.countDocuments(query);

    res.json({
      success: true,
      data: routines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching routines'
    });
  }
};

// @desc    Get single routine
// @route   GET /api/routines/:id
// @access  Public
exports.getRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)
      .populate('schedule.periods.teacher', 'name designation department')
      .populate('examSchedule.invigilator', 'name designation')
      .populate('examSchedule.assistantInvigilator', 'name designation')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    res.json({
      success: true,
      data: routine
    });
  } catch (error) {
    console.error('Error fetching routine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching routine'
    });
  }
};

// @desc    Get current routine for class
// @route   GET /api/routines/current/:class/:section
// @access  Public
exports.getCurrentRoutine = async (req, res) => {
  try {
    const { class: className, section } = req.params;
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();

    const routine = await Routine.getCurrent(className, section, academicYear);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'No current routine found for the specified class and section'
      });
    }

    res.json({
      success: true,
      data: routine
    });
  } catch (error) {
    console.error('Error fetching current routine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching current routine'
    });
  }
};

// @desc    Get exam routines for class
// @route   GET /api/routines/exams/:class/:section
// @access  Public
exports.getExamRoutines = async (req, res) => {
  try {
    const { class: className, section } = req.params;
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();

    const routines = await Routine.getExamRoutines(className, section, academicYear);

    res.json({
      success: true,
      data: routines
    });
  } catch (error) {
    console.error('Error fetching exam routines:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching exam routines'
    });
  }
};

// @desc    Create new routine
// @route   POST /api/routines
// @access  Private (Admin/Teacher)
exports.createRoutine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'routines',
            resource_type: 'auto'
          });
          
          attachments.push({
            type: file.mimetype.includes('pdf') ? 'pdf' : 
                  file.mimetype.includes('excel') ? 'excel' : 
                  file.mimetype.includes('image') ? 'image' : 'doc',
            filename: result.public_id,
            originalName: file.originalname,
            url: result.secure_url,
            size: file.size
          });
        } catch (uploadError) {
          console.error('Attachment upload error:', uploadError);
        }
      }
    }

    const routineData = {
      ...req.body,
      attachments,
      createdBy: req.user.id
    };

    const routine = await Routine.create(routineData);
    await routine.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: routine,
      message: 'Routine created successfully'
    });
  } catch (error) {
    console.error('Error creating routine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating routine'
    });
  }
};

// @desc    Update routine
// @route   PUT /api/routines/:id
// @access  Private (Admin/Creator)
exports.updateRoutine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check if user is creator or admin
    if (routine.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this routine'
      });
    }

    // Handle file attachments
    let attachments = routine.attachments || [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'routines',
            resource_type: 'auto'
          });
          
          attachments.push({
            type: file.mimetype.includes('pdf') ? 'pdf' : 
                  file.mimetype.includes('excel') ? 'excel' : 
                  file.mimetype.includes('image') ? 'image' : 'doc',
            filename: result.public_id,
            originalName: file.originalname,
            url: result.secure_url,
            size: file.size
          });
        } catch (uploadError) {
          console.error('Attachment upload error:', uploadError);
        }
      }
    }

    const updateData = {
      ...req.body,
      attachments
    };

    routine = await Routine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('schedule.periods.teacher', 'name designation')
     .populate('examSchedule.invigilator', 'name designation')
     .populate('createdBy', 'name')
     .populate('approvedBy', 'name');

    res.json({
      success: true,
      data: routine,
      message: 'Routine updated successfully'
    });
  } catch (error) {
    console.error('Error updating routine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating routine'
    });
  }
};

// @desc    Delete routine
// @route   DELETE /api/routines/:id
// @access  Private (Admin only)
exports.deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Soft delete - set isActive to false
    routine.isActive = false;
    routine.status = 'archived';
    await routine.save();

    res.json({
      success: true,
      message: 'Routine deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting routine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting routine'
    });
  }
};

// @desc    Approve routine
// @route   PUT /api/routines/:id/approve
// @access  Private (Admin only)
exports.approveRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    routine.status = 'approved';
    routine.approvedBy = req.user.id;
    routine.approvalDate = new Date();
    await routine.save();

    await routine.populate('approvedBy', 'name');

    res.json({
      success: true,
      data: routine,
      message: 'Routine approved successfully'
    });
  } catch (error) {
    console.error('Error approving routine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving routine'
    });
  }
};

// @desc    Publish routine
// @route   PUT /api/routines/:id/publish
// @access  Private (Admin only)
exports.publishRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    if (routine.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Routine must be approved before publishing'
      });
    }

    routine.status = 'published';
    routine.publishedDate = new Date();
    await routine.save();

    res.json({
      success: true,
      data: routine,
      message: 'Routine published successfully'
    });
  } catch (error) {
    console.error('Error publishing routine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while publishing routine'
    });
  }
};

// @desc    Get classes with routines
// @route   GET /api/routines/classes
// @access  Public
exports.getClassesWithRoutines = async (req, res) => {
  try {
    const classes = await Routine.distinct('class.en', { 
      status: 'published',
      isActive: true 
    });
    
    res.json({
      success: true,
      data: classes.filter(cls => cls)
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching classes'
    });
  }
};

// @desc    Get sections by class
// @route   GET /api/routines/sections/:class
// @access  Public
exports.getSectionsByClass = async (req, res) => {
  try {
    const sections = await Routine.distinct('section', { 
      'class.en': req.params.class,
      status: 'published',
      isActive: true 
    });
    
    res.json({
      success: true,
      data: sections.filter(section => section)
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sections'
    });
  }
};
