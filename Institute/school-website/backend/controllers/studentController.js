const Student = require('../models/Student');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin/Teacher)
exports.getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
    // Add search functionality (bilingual)
    if (req.query.search) {
      query.$or = [
        { 'name.en': { $regex: req.query.search, $options: 'i' } },
        { 'name.bn': { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } },
        { rollNumber: parseInt(req.query.search) || 0 }
      ];
    }

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
    if (req.query.session) {
      query.session = req.query.session;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const students = await Student.find(query)
      .populate('user', 'name email phone avatar')
      .sort({ rollNumber: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private (Admin/Teacher/Own Student)
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email phone avatar');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student'
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin only)
exports.createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Handle photo upload
    let photoData = {};
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'students',
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        photoData = {
          url: result.secure_url,
          publicId: result.public_id
        };
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError);
      }
    }

    const studentData = {
      ...req.body,
      personalInfo: {
        ...req.body.personalInfo,
        photo: photoData
      }
    };

    const student = await Student.create(studentData);
    await student.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      data: student,
      message: 'Student created successfully'
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating student'
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin only)
exports.updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Handle photo upload
    let photoData = student.personalInfo.photo;
    if (req.file) {
      try {
        // Delete old photo if exists
        if (student.personalInfo.photo && student.personalInfo.photo.publicId) {
          await cloudinary.uploader.destroy(student.personalInfo.photo.publicId);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'students',
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        photoData = {
          url: result.secure_url,
          publicId: result.public_id
        };
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError);
      }
    }

    const updateData = {
      ...req.body,
      personalInfo: {
        ...req.body.personalInfo,
        photo: photoData
      }
    };

    student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    res.json({
      success: true,
      data: student,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student'
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Soft delete - set isActive to false
    student.isActive = false;
    student.status = 'Inactive';
    await student.save();

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student'
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Private (Admin/Teacher)
exports.getStudentStats = async (req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      classStats,
      genderStats,
      statusStats,
      recentAdmissions
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ isActive: true, status: 'Active' }),
      Student.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$class.en', count: { $sum: 1 } } }
      ]),
      Student.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$personalInfo.gender', count: { $sum: 1 } } }
      ]),
      Student.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Student.find({ isActive: true })
        .sort({ admissionDate: -1 })
        .limit(5)
        .select('name studentId class section admissionDate')
    ]);

    const stats = {
      totalStudents,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents,
      classBreakdown: classStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      genderBreakdown: genderStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      statusBreakdown: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      recentAdmissions
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching student statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student statistics'
    });
  }
};

// @desc    Get classes
// @route   GET /api/students/classes
// @access  Public
exports.getClasses = async (req, res) => {
  try {
    const classes = await Student.distinct('class.en', { isActive: true });
    
    res.json({
      success: true,
      data: classes.filter(cls => cls) // Remove null/undefined values
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
// @route   GET /api/students/sections/:class
// @access  Public
exports.getSectionsByClass = async (req, res) => {
  try {
    const sections = await Student.distinct('section', { 
      'class.en': req.params.class,
      isActive: true 
    });
    
    res.json({
      success: true,
      data: sections.filter(section => section) // Remove null/undefined values
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sections'
    });
  }
};
