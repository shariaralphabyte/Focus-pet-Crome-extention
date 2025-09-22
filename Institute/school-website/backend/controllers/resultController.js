const Result = require('../models/Result');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// @desc    Get all results
// @route   GET /api/results
// @access  Private (Admin/Teacher)
exports.getResults = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
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
    if (req.query.examType) {
      query.examType = req.query.examType;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Add search functionality
    if (req.query.search) {
      query.$or = [
        { 'title.en': { $regex: req.query.search, $options: 'i' } },
        { 'title.bn': { $regex: req.query.search, $options: 'i' } },
        { 'examName.en': { $regex: req.query.search, $options: 'i' } },
        { 'examName.bn': { $regex: req.query.search, $options: 'i' } },
        { 'class.en': { $regex: req.query.search, $options: 'i' } },
        { 'class.bn': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const results = await Result.find(query)
      .populate('results.student', 'name studentId rollNumber')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .populate('publishedBy', 'name')
      .sort({ examDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Result.countDocuments(query);

    res.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching results'
    });
  }
};

// @desc    Get single result
// @route   GET /api/results/:id
// @access  Private (Admin/Teacher/Own Student)
exports.getResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('results.student', 'name studentId rollNumber class section')
      .populate('results.teacherComments.teacher', 'name designation')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .populate('publishedBy', 'name');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching result'
    });
  }
};

// @desc    Get results by student
// @route   GET /api/results/student/:studentId
// @access  Private (Admin/Teacher/Own Student)
exports.getResultsByStudent = async (req, res) => {
  try {
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();
    const results = await Result.getByStudent(req.params.studentId, academicYear);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student results'
    });
  }
};

// @desc    Get results by class
// @route   GET /api/results/class/:class/:section
// @access  Private (Admin/Teacher)
exports.getResultsByClass = async (req, res) => {
  try {
    const { class: className, section } = req.params;
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();
    
    const results = await Result.getByClass(className, section, academicYear);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching class results:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching class results'
    });
  }
};

// @desc    Create new result
// @route   POST /api/results
// @access  Private (Admin/Teacher)
exports.createResult = async (req, res) => {
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
            folder: 'results',
            resource_type: 'auto'
          });
          
          attachments.push({
            type: file.mimetype.includes('pdf') ? 'pdf' : 
                  file.mimetype.includes('excel') ? 'excel' : 
                  file.mimetype.includes('image') ? 'image' : 'doc',
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

    const resultData = {
      ...req.body,
      attachments,
      createdBy: req.user.id
    };

    const examResult = await Result.create(resultData);
    await examResult.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: examResult,
      message: 'Result created successfully'
    });
  } catch (error) {
    console.error('Error creating result:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating result'
    });
  }
};

// @desc    Update result
// @route   PUT /api/results/:id
// @access  Private (Admin/Creator)
exports.updateResult = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Check if user is creator or admin
    if (result.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this result'
      });
    }

    // Handle file attachments
    let attachments = result.attachments || [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: 'results',
            resource_type: 'auto'
          });
          
          attachments.push({
            type: file.mimetype.includes('pdf') ? 'pdf' : 
                  file.mimetype.includes('excel') ? 'excel' : 
                  file.mimetype.includes('image') ? 'image' : 'doc',
            filename: uploadResult.public_id,
            originalName: file.originalname,
            url: uploadResult.secure_url,
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
      attachments
    };

    result = await Result.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('results.student', 'name studentId rollNumber')
     .populate('createdBy', 'name')
     .populate('approvedBy', 'name');

    res.json({
      success: true,
      data: result,
      message: 'Result updated successfully'
    });
  } catch (error) {
    console.error('Error updating result:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating result'
    });
  }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private (Admin only)
exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Soft delete - set isActive to false
    result.isActive = false;
    result.status = 'archived';
    await result.save();

    res.json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting result'
    });
  }
};

// @desc    Publish result
// @route   PUT /api/results/:id/publish
// @access  Private (Admin only)
exports.publishResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    result.status = 'published';
    result.isPublished = true;
    result.publishedBy = req.user.id;
    result.publishDate = new Date();
    await result.save();

    await result.populate('publishedBy', 'name');

    res.json({
      success: true,
      data: result,
      message: 'Result published successfully'
    });
  } catch (error) {
    console.error('Error publishing result:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while publishing result'
    });
  }
};

// @desc    Get published results (public)
// @route   GET /api/results/published
// @access  Public
exports.getPublishedResults = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query for published results only
    let query = { 
      status: 'published', 
      isPublished: true, 
      isActive: true 
    };
    
    // Add filters
    if (req.query.class) {
      query.$or = [
        { 'class.en': req.query.class },
        { 'class.bn': req.query.class }
      ];
    }
    if (req.query.examType) {
      query.examType = req.query.examType;
    }
    if (req.query.academicYear) {
      query.academicYear = req.query.academicYear;
    }

    const results = await Result.find(query)
      .select('title examName class section examType examDate publishDate statistics')
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Result.countDocuments(query);

    res.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching published results:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching published results'
    });
  }
};

// @desc    Get exam types
// @route   GET /api/results/exam-types
// @access  Public
exports.getExamTypes = async (req, res) => {
  try {
    const examTypes = await Result.distinct('examType', { 
      status: 'published',
      isActive: true 
    });
    
    res.json({
      success: true,
      data: examTypes
    });
  } catch (error) {
    console.error('Error fetching exam types:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching exam types'
    });
  }
};

// @desc    Get classes with results
// @route   GET /api/results/classes
// @access  Public
exports.getClassesWithResults = async (req, res) => {
  try {
    const classes = await Result.distinct('class.en', { 
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
