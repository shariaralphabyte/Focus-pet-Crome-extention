const ManagementCommittee = require('../models/ManagementCommittee');
const cloudinary = require('../config/cloudinary');
const { validationResult } = require('express-validator');

// @desc    Get all management committee members
// @route   GET /api/management-committee
// @access  Public
exports.getManagementCommittee = async (req, res) => {
  try {
    const { category, isActive = true } = req.query;
    
    const query = { isActive };
    if (category) query.category = category;
    
    const members = await ManagementCommittee.find(query)
      .sort({ priority: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error fetching management committee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching management committee'
    });
  }
};

// @desc    Get single management committee member
// @route   GET /api/management-committee/:id
// @access  Public
exports.getManagementCommitteeMember = async (req, res) => {
  try {
    const member = await ManagementCommittee.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Management committee member not found'
      });
    }
    
    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error fetching management committee member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching management committee member'
    });
  }
};

// @desc    Create management committee member
// @route   POST /api/management-committee
// @access  Private (Admin only)
exports.createManagementCommitteeMember = async (req, res) => {
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
      position,
      qualification,
      experience,
      bio,
      contactInfo,
      joinDate,
      category,
      priority,
      socialLinks
    } = req.body;

    // Handle photo upload
    let photoData = {};
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'management-committee',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        photoData = {
          public_id: result.public_id,
          url: result.secure_url
        };
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Error uploading photo'
        });
      }
    }

    const member = new ManagementCommittee({
      name,
      position,
      qualification,
      experience,
      bio,
      contactInfo,
      photo: photoData,
      joinDate,
      category,
      priority: priority || 0,
      socialLinks
    });

    await member.save();

    res.status(201).json({
      success: true,
      message: 'Management committee member created successfully',
      data: member
    });
  } catch (error) {
    console.error('Error creating management committee member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating management committee member'
    });
  }
};

// @desc    Update management committee member
// @route   PUT /api/management-committee/:id
// @access  Private (Admin only)
exports.updateManagementCommitteeMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let member = await ManagementCommittee.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Management committee member not found'
      });
    }

    const {
      name,
      position,
      qualification,
      experience,
      bio,
      contactInfo,
      joinDate,
      category,
      priority,
      socialLinks,
      isActive
    } = req.body;

    // Handle photo upload
    if (req.file) {
      try {
        // Delete old photo if exists
        if (member.photo && member.photo.public_id) {
          await cloudinary.uploader.destroy(member.photo.public_id);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'management-committee',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        member.photo = {
          public_id: result.public_id,
          url: result.secure_url
        };
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Error uploading photo'
        });
      }
    }

    // Update fields
    if (name) member.name = name;
    if (position) member.position = position;
    if (qualification) member.qualification = qualification;
    if (experience) member.experience = experience;
    if (bio) member.bio = bio;
    if (contactInfo) member.contactInfo = contactInfo;
    if (joinDate) member.joinDate = joinDate;
    if (category) member.category = category;
    if (priority !== undefined) member.priority = priority;
    if (socialLinks) member.socialLinks = socialLinks;
    if (isActive !== undefined) member.isActive = isActive;

    await member.save();

    res.json({
      success: true,
      message: 'Management committee member updated successfully',
      data: member
    });
  } catch (error) {
    console.error('Error updating management committee member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating management committee member'
    });
  }
};

// @desc    Delete management committee member
// @route   DELETE /api/management-committee/:id
// @access  Private (Admin only)
exports.deleteManagementCommitteeMember = async (req, res) => {
  try {
    const member = await ManagementCommittee.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Management committee member not found'
      });
    }

    // Delete photo from cloudinary
    if (member.photo && member.photo.public_id) {
      try {
        await cloudinary.uploader.destroy(member.photo.public_id);
      } catch (deleteError) {
        console.error('Error deleting photo from cloudinary:', deleteError);
      }
    }

    await ManagementCommittee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Management committee member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting management committee member:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting management committee member'
    });
  }
};

// @desc    Get management committee statistics
// @route   GET /api/management-committee/stats
// @access  Public
exports.getManagementCommitteeStats = async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      categoryStats,
      recentMembers
    ] = await Promise.all([
      ManagementCommittee.countDocuments(),
      ManagementCommittee.countDocuments({ isActive: true }),
      ManagementCommittee.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      ManagementCommittee.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name position category createdAt')
    ]);

    const stats = {
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      categoryBreakdown: categoryStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      recentMembers
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching management committee stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching management committee statistics'
    });
  }
};
