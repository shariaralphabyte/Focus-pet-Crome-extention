const Notice = require('../models/Notice');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');
const { getFileInfo, deleteFile } = require('../middleware/upload');

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
exports.getNotices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      priority, 
      isPublished = true,
      search 
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (isPublished !== undefined) {
      query.isPublished = isPublished === true || isPublished === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.bn': { $regex: search, $options: 'i' } },
        { 'content.en': { $regex: search, $options: 'i' } },
        { 'content.bn': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const [notices, total] = await Promise.all([
      Notice.find(query)
        .populate('author', 'name email')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notice.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: notices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: notices
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notices'
    });
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Public
exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('author', 'name email');
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Increment view count
    notice.views += 1;
    await notice.save();

    res.json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Error fetching notice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notice'
    });
  }
};

// @desc    Create notice
// @route   POST /api/notices
// @access  Private (Admin/Teacher)
exports.createNotice = async (req, res) => {
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
      title,
      content,
      category,
      priority,
      targetAudience,
      specificClasses,
      publishDate,
      expiryDate,
      isPublished
    } = req.body;

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // Upload to cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'notices',
            resource_type: 'auto', // Handles both images and documents
            quality: 'auto'
          });

          attachments.push({
            fileName: file.originalname,
            fileType: file.mimetype.split('/')[1],
            fileSize: file.size,
            public_id: result.public_id,
            url: result.secure_url
          });

          // Delete local file after upload
          await deleteFile(file.path);
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          // Continue with other files, don't fail the entire request
        }
      }
    }

    const notice = new Notice({
      title,
      content,
      category,
      priority: priority || 'Medium',
      targetAudience: targetAudience || ['All'],
      specificClasses: specificClasses || [],
      attachments,
      publishDate: publishDate || new Date(),
      expiryDate,
      isPublished: isPublished !== undefined ? isPublished : true,
      author: req.user.id
    });

    await notice.save();

    // Populate creator info
    await notice.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating notice'
    });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (Admin/Creator)
exports.updateNotice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user is admin or creator
    if (req.user.role !== 'admin' && notice.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notice'
      });
    }

    const {
      title,
      content,
      category,
      priority,
      targetAudience,
      specificClasses,
      publishDate,
      expiryDate,
      isPublished,
      removeAttachments
    } = req.body;

    // Handle attachment removal
    if (removeAttachments && removeAttachments.length > 0) {
      for (const attachmentId of removeAttachments) {
        const attachment = notice.attachments.id(attachmentId);
        if (attachment) {
          try {
            // Delete from cloudinary
            await cloudinary.uploader.destroy(attachment.public_id);
            // Remove from array
            notice.attachments.pull(attachmentId);
          } catch (deleteError) {
            console.error('Error deleting attachment:', deleteError);
          }
        }
      }
    }

    // Handle new file attachments
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // Upload to cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'notices',
            resource_type: 'auto',
            quality: 'auto'
          });

          notice.attachments.push({
            fileName: file.originalname,
            fileType: file.mimetype.split('/')[1],
            fileSize: file.size,
            public_id: result.public_id,
            url: result.secure_url
          });

          // Delete local file after upload
          await deleteFile(file.path);
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
        }
      }
    }

    // Update fields
    if (title) notice.title = title;
    if (content) notice.content = content;
    if (category) notice.category = category;
    if (priority) notice.priority = priority;
    if (targetAudience) notice.targetAudience = targetAudience;
    if (specificClasses) notice.specificClasses = specificClasses;
    if (publishDate) notice.publishDate = publishDate;
    if (expiryDate) notice.expiryDate = expiryDate;
    if (isPublished !== undefined) notice.isPublished = isPublished;

    notice.updatedBy = req.user.id;
    await notice.save();

    // Populate creator info
    await notice.populate('author', 'name email');

    res.json({
      success: true,
      message: 'Notice updated successfully',
      data: notice
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notice'
    });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin/Creator)
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user is admin or creator
    if (req.user.role !== 'admin' && notice.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notice'
      });
    }

    // Delete attachments from cloudinary
    for (const attachment of notice.attachments) {
      try {
        await cloudinary.uploader.destroy(attachment.public_id);
      } catch (deleteError) {
        console.error('Error deleting attachment from cloudinary:', deleteError);
      }
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notice'
    });
  }
};

// @desc    Get notice statistics
// @route   GET /api/notices/stats
// @access  Private (Admin)
exports.getNoticeStats = async (req, res) => {
  try {
    const [
      totalNotices,
      publishedNotices,
      draftNotices,
      categoryStats,
      priorityStats,
      recentNotices
    ] = await Promise.all([
      Notice.countDocuments(),
      Notice.countDocuments({ isPublished: true }),
      Notice.countDocuments({ isPublished: false }),
      Notice.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Notice.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Notice.find({ isPublished: true })
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt views category priority')
    ]);

    const stats = {
      totalNotices,
      publishedNotices,
      draftNotices,
      categoryBreakdown: categoryStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      priorityBreakdown: priorityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      recentNotices
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching notice stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notice statistics'
    });
  }
};

// @desc    Toggle notice publication status
// @route   PATCH /api/notices/:id/toggle-publish
// @access  Private (Admin/Creator)
exports.togglePublishStatus = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user is admin or creator
    if (req.user.role !== 'admin' && notice.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this notice'
      });
    }

    notice.isPublished = !notice.isPublished;
    notice.updatedBy = req.user.id;
    await notice.save();

    res.json({
      success: true,
      message: `Notice ${notice.isPublished ? 'published' : 'unpublished'} successfully`,
      data: { isPublished: notice.isPublished }
    });
  } catch (error) {
    console.error('Error toggling notice status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notice status'
    });
  }
};
