const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Public
exports.getTeachers = async (req, res) => {
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
        { 'designation.en': { $regex: req.query.search, $options: 'i' } },
        { 'designation.bn': { $regex: req.query.search, $options: 'i' } },
        { 'department.en': { $regex: req.query.search, $options: 'i' } },
        { 'department.bn': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Add filters
    if (req.query.department) {
      query.$or = [
        { 'department.en': req.query.department },
        { 'department.bn': req.query.department }
      ];
    }
    if (req.query.designation) {
      query.$or = [
        { 'designation.en': req.query.designation },
        { 'designation.bn': req.query.designation }
      ];
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const teachers = await Teacher.find(query)
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Teacher.countDocuments(query);

    res.json({
      success: true,
      data: teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teachers'
    });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Public
exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'name email phone avatar');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teacher'
    });
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin only)
exports.createTeacher = async (req, res) => {
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
          folder: 'teachers',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
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

    const teacherData = {
      ...req.body,
      personalInfo: {
        ...req.body.personalInfo,
        photo: photoData
      }
    };

    const teacher = await Teacher.create(teacherData);
    await teacher.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      data: teacher,
      message: 'Teacher created successfully'
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating teacher'
    });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin only)
exports.updateTeacher = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Handle photo upload
    let photoData = teacher.personalInfo.photo;
    if (req.file) {
      try {
        // Delete old photo if exists
        if (teacher.personalInfo.photo && teacher.personalInfo.photo.publicId) {
          await cloudinary.uploader.destroy(teacher.personalInfo.photo.publicId);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'teachers',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
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

    teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    res.json({
      success: true,
      data: teacher,
      message: 'Teacher updated successfully'
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating teacher'
    });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin only)
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Soft delete - set isActive to false
    teacher.isActive = false;
    teacher.status = 'Terminated';
    teacher.leaveDate = new Date();
    await teacher.save();

    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting teacher'
    });
  }
};

// @desc    Get teacher statistics
// @route   GET /api/teachers/stats
// @access  Public
exports.getTeacherStats = async (req, res) => {
  try {
    const [
      totalTeachers,
      activeTeachers,
      departmentStats,
      designationStats,
      genderStats,
      experienceStats
    ] = await Promise.all([
      Teacher.countDocuments(),
      Teacher.countDocuments({ isActive: true, status: 'Active' }),
      Teacher.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department.en', count: { $sum: 1 } } }
      ]),
      Teacher.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$designation.en', count: { $sum: 1 } } }
      ]),
      Teacher.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$personalInfo.gender', count: { $sum: 1 } } }
      ]),
      Teacher.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            avgExperience: { $avg: '$experience.totalYears' },
            maxExperience: { $max: '$experience.totalYears' },
            minExperience: { $min: '$experience.totalYears' }
          }
        }
      ])
    ]);

    const stats = {
      totalTeachers,
      activeTeachers,
      inactiveTeachers: totalTeachers - activeTeachers,
      departmentBreakdown: departmentStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      designationBreakdown: designationStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      genderBreakdown: genderStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      experienceStats: experienceStats[0] || {
        avgExperience: 0,
        maxExperience: 0,
        minExperience: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching teacher statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teacher statistics'
    });
  }
};

// @desc    Get departments
// @route   GET /api/teachers/departments
// @access  Public
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Teacher.distinct('department.en', { isActive: true });
    
    res.json({
      success: true,
      data: departments.filter(dept => dept) // Remove null/undefined values
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching departments'
    });
  }
};

// @desc    Get designations
// @route   GET /api/teachers/designations
// @access  Public
exports.getDesignations = async (req, res) => {
  try {
    const designations = await Teacher.distinct('designation.en', { isActive: true });
    
    res.json({
      success: true,
      data: designations.filter(designation => designation) // Remove null/undefined values
    });
  } catch (error) {
    console.error('Error fetching designations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching designations'
    });
  }
};
