const Class = require('../models/Class');
const { validationResult } = require('express-validator');

// Get all classes
const getClasses = async (req, res) => {
  try {
    const { academicYear, level, isActive } = req.query;
    const filter = {};
    
    if (academicYear) filter.academicYear = academicYear;
    if (level) filter.level = level;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const classes = await Class.find(filter)
      .populate('sections.classTeacher', 'name designation')
      .populate('subjects.teacher', 'name designation')
      .populate('createdBy', 'name')
      .sort({ grade: 1, 'name.en': 1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching classes'
    });
  }
};

// Get class by ID
const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('sections.classTeacher', 'name designation')
      .populate('subjects.teacher', 'name designation')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching class'
    });
  }
};

// Create new class
const createClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name,
      level,
      grade,
      sections,
      department,
      semester,
      subjects,
      academicYear
    } = req.body;

    // Check if class already exists
    const existingClass = await Class.findOne({
      'name.en': name.en,
      grade: grade,
      academicYear: academicYear || new Date().getFullYear().toString()
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class with this name and grade already exists for this academic year'
      });
    }

    const newClass = new Class({
      name,
      level,
      grade,
      sections: sections || [],
      department,
      semester,
      subjects: subjects || [],
      academicYear: academicYear || new Date().getFullYear().toString(),
      createdBy: req.user.id
    });

    await newClass.save();

    // Populate the created class
    await newClass.populate('sections.classTeacher', 'name designation');
    await newClass.populate('subjects.teacher', 'name designation');
    await newClass.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating class'
    });
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const {
      name,
      level,
      grade,
      sections,
      department,
      semester,
      subjects,
      academicYear,
      isActive
    } = req.body;

    // Update fields
    if (name) classData.name = name;
    if (level) classData.level = level;
    if (grade) classData.grade = grade;
    if (sections) classData.sections = sections;
    if (department) classData.department = department;
    if (semester) classData.semester = semester;
    if (subjects) classData.subjects = subjects;
    if (academicYear) classData.academicYear = academicYear;
    if (isActive !== undefined) classData.isActive = isActive;
    
    classData.updatedBy = req.user.id;

    await classData.save();

    // Populate the updated class
    await classData.populate('sections.classTeacher', 'name designation');
    await classData.populate('subjects.teacher', 'name designation');
    await classData.populate('createdBy', 'name');
    await classData.populate('updatedBy', 'name');

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classData
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating class'
    });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Soft delete by setting isActive to false
    classData.isActive = false;
    classData.updatedBy = req.user.id;
    await classData.save();

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting class'
    });
  }
};

// Get active classes
const getActiveClasses = async (req, res) => {
  try {
    const classes = await Class.getActiveClasses();
    
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching active classes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active classes'
    });
  }
};

// Get classes by level
const getClassesByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const classes = await Class.find({ level, isActive: true })
      .populate('sections.classTeacher', 'name designation')
      .populate('subjects.teacher', 'name designation')
      .sort({ grade: 1, 'name.en': 1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching classes by level:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching classes by level'
    });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getActiveClasses,
  getClassesByLevel
};
