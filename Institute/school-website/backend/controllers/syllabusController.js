const Syllabus = require('../models/Syllabus');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// @desc    Get all syllabi
// @route   GET /api/syllabus
// @access  Public
exports.getSyllabi = async (req, res) => {
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
    if (req.query.subject) {
      query.$or = [
        { 'subject.en': req.query.subject },
        { 'subject.bn': req.query.subject }
      ];
    }
    if (req.query.academicYear) {
      query.academicYear = req.query.academicYear;
    }
    if (req.query.semester) {
      query.semester = req.query.semester;
    }

    // Add search functionality
    if (req.query.search) {
      query.$or = [
        { 'title.en': { $regex: req.query.search, $options: 'i' } },
        { 'title.bn': { $regex: req.query.search, $options: 'i' } },
        { 'subject.en': { $regex: req.query.search, $options: 'i' } },
        { 'subject.bn': { $regex: req.query.search, $options: 'i' } },
        { 'class.en': { $regex: req.query.search, $options: 'i' } },
        { 'class.bn': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const syllabi = await Syllabus.find(query)
      .populate('teacher', 'name designation')
      .populate('approvedBy', 'name')
      .sort({ effectiveDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Syllabus.countDocuments(query);

    res.json({
      success: true,
      data: syllabi,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching syllabi:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching syllabi'
    });
  }
};

// @desc    Get single syllabus
// @route   GET /api/syllabus/:id
// @access  Public
exports.getSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id)
      .populate('teacher', 'name designation department')
      .populate('approvedBy', 'name');

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    res.json({
      success: true,
      data: syllabus
    });
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching syllabus'
    });
  }
};

// @desc    Get syllabus by class and subject
// @route   GET /api/syllabus/class/:class/subject/:subject
// @access  Public
exports.getSyllabusByClassAndSubject = async (req, res) => {
  try {
    const { class: className, subject: subjectName } = req.params;
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();

    const syllabus = await Syllabus.getByClassAndSubject(className, subjectName, academicYear);

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found for the specified class and subject'
      });
    }

    res.json({
      success: true,
      data: syllabus
    });
  } catch (error) {
    console.error('Error fetching syllabus by class and subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching syllabus'
    });
  }
};

// @desc    Create new syllabus
// @route   POST /api/syllabus
// @access  Private (Admin/Teacher)
exports.createSyllabus = async (req, res) => {
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
            folder: 'syllabus',
            resource_type: 'auto'
          });
          
          attachments.push({
            type: file.mimetype.includes('pdf') ? 'pdf' : 
                  file.mimetype.includes('doc') ? 'doc' : 
                  file.mimetype.includes('ppt') ? 'ppt' : 'other',
            filename: result.public_id,
            originalName: file.originalname,
            url: result.secure_url,
            size: file.size,
            description: req.body.attachmentDescription || ''
          });
        } catch (uploadError) {
          console.error('Attachment upload error:', uploadError);
        }
      }
    }

    const syllabusData = {
      ...req.body,
      attachments
    };

    const syllabus = await Syllabus.create(syllabusData);
    await syllabus.populate('teacher', 'name designation');

    res.status(201).json({
      success: true,
      data: syllabus,
      message: 'Syllabus created successfully'
    });
  } catch (error) {
    console.error('Error creating syllabus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating syllabus'
    });
  }
};

// @desc    Update syllabus
// @route   PUT /api/syllabus/:id
// @access  Private (Admin/Teacher)
exports.updateSyllabus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    // Handle file attachments
    let attachments = syllabus.attachments || [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'syllabus',
            resource_type: 'auto'
          });
          
          attachments.push({
            type: file.mimetype.includes('pdf') ? 'pdf' : 
                  file.mimetype.includes('doc') ? 'doc' : 
                  file.mimetype.includes('ppt') ? 'ppt' : 'other',
            filename: result.public_id,
            originalName: file.originalname,
            url: result.secure_url,
            size: file.size,
            description: req.body.attachmentDescription || ''
          });
        } catch (uploadError) {
          console.error('Attachment upload error:', uploadError);
        }
      }
    }

    const updateData = {
      ...req.body,
      attachments,
      lastUpdated: new Date()
    };

    syllabus = await Syllabus.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('teacher', 'name designation')
     .populate('approvedBy', 'name');

    res.json({
      success: true,
      data: syllabus,
      message: 'Syllabus updated successfully'
    });
  } catch (error) {
    console.error('Error updating syllabus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating syllabus'
    });
  }
};

// @desc    Delete syllabus
// @route   DELETE /api/syllabus/:id
// @access  Private (Admin only)
exports.deleteSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    // Soft delete - set isActive to false
    syllabus.isActive = false;
    syllabus.status = 'archived';
    await syllabus.save();

    res.json({
      success: true,
      message: 'Syllabus deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting syllabus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting syllabus'
    });
  }
};

// @desc    Approve syllabus
// @route   PUT /api/syllabus/:id/approve
// @access  Private (Admin only)
exports.approveSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    syllabus.status = 'approved';
    syllabus.approvedBy = req.user.id;
    syllabus.approvalDate = new Date();
    await syllabus.save();

    await syllabus.populate('approvedBy', 'name');

    res.json({
      success: true,
      data: syllabus,
      message: 'Syllabus approved successfully'
    });
  } catch (error) {
    console.error('Error approving syllabus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving syllabus'
    });
  }
};

// @desc    Publish syllabus
// @route   PUT /api/syllabus/:id/publish
// @access  Private (Admin only)
exports.publishSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    if (syllabus.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Syllabus must be approved before publishing'
      });
    }

    syllabus.status = 'published';
    syllabus.effectiveDate = req.body.effectiveDate || new Date();
    await syllabus.save();

    res.json({
      success: true,
      data: syllabus,
      message: 'Syllabus published successfully'
    });
  } catch (error) {
    console.error('Error publishing syllabus:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while publishing syllabus'
    });
  }
};

// @desc    Get classes with syllabi
// @route   GET /api/syllabus/classes
// @access  Public
exports.getClassesWithSyllabi = async (req, res) => {
  try {
    const classes = await Syllabus.distinct('class.en', { 
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

// @desc    Get subjects by class
// @route   GET /api/syllabus/subjects/:class
// @access  Public
exports.getSubjectsByClass = async (req, res) => {
  try {
    const subjects = await Syllabus.distinct('subject.en', { 
      'class.en': req.params.class,
      status: 'published',
      isActive: true 
    });
    
    res.json({
      success: true,
      data: subjects.filter(subject => subject)
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subjects'
    });
  }
};
