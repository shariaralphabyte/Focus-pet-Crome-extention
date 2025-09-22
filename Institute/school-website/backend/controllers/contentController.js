const Content = require('../models/Content');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// @desc    Get content by key
// @route   GET /api/content/:key
// @access  Public
exports.getContentByKey = async (req, res) => {
  try {
    const content = await Content.getByKey(req.params.key);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content'
    });
  }
};

// @desc    Get content by type
// @route   GET /api/content/type/:type
// @access  Public
exports.getContentByType = async (req, res) => {
  try {
    const options = {
      category: req.query.category,
      limit: parseInt(req.query.limit) || 50
    };

    const content = await Content.getByType(req.params.type, options);

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content by type:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content'
    });
  }
};

// @desc    Get hero slides
// @route   GET /api/content/hero-slides
// @access  Public
exports.getHeroSlides = async (req, res) => {
  try {
    const slides = await Content.getHeroSlides();

    res.json({
      success: true,
      data: slides
    });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hero slides'
    });
  }
};

// @desc    Get vision/mission
// @route   GET /api/content/vision-mission
// @access  Public
exports.getVisionMission = async (req, res) => {
  try {
    const visionMission = await Content.getVisionMission();

    if (!visionMission) {
      return res.status(404).json({
        success: false,
        message: 'Vision/Mission content not found'
      });
    }

    res.json({
      success: true,
      data: visionMission
    });
  } catch (error) {
    console.error('Error fetching vision/mission:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vision/mission'
    });
  }
};

// @desc    Create new content
// @route   POST /api/content
// @access  Private (Admin only)
exports.createContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Handle media uploads
    let mediaData = { images: [], videos: [], documents: [] };
    
    if (req.files) {
      // Handle multiple file uploads
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'content',
            resource_type: 'auto'
          });
          
          if (file.mimetype.startsWith('image/')) {
            mediaData.images.push({
              url: result.secure_url,
              publicId: result.public_id,
              alt: req.body.imageAlt || '',
              caption: req.body.imageCaption || ''
            });
          } else if (file.mimetype.startsWith('video/')) {
            mediaData.videos.push({
              url: result.secure_url,
              type: 'upload',
              thumbnail: result.secure_url,
              title: req.body.videoTitle || ''
            });
          } else {
            mediaData.documents.push({
              url: result.secure_url,
              filename: file.originalname,
              type: file.mimetype,
              size: file.size,
              description: req.body.documentDescription || ''
            });
          }
        } catch (uploadError) {
          console.error('Media upload error:', uploadError);
        }
      }
    }

    const contentData = {
      ...req.body,
      media: mediaData,
      author: req.user.id
    };

    const content = await Content.create(contentData);
    await content.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: content,
      message: 'Content created successfully'
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating content'
    });
  }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private (Admin only)
exports.updateContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Handle media uploads
    let mediaData = content.media || { images: [], videos: [], documents: [] };
    
    if (req.files && req.files.length > 0) {
      // Add new media files
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'content',
            resource_type: 'auto'
          });
          
          if (file.mimetype.startsWith('image/')) {
            mediaData.images.push({
              url: result.secure_url,
              publicId: result.public_id,
              alt: req.body.imageAlt || '',
              caption: req.body.imageCaption || ''
            });
          } else if (file.mimetype.startsWith('video/')) {
            mediaData.videos.push({
              url: result.secure_url,
              type: 'upload',
              thumbnail: result.secure_url,
              title: req.body.videoTitle || ''
            });
          } else {
            mediaData.documents.push({
              url: result.secure_url,
              filename: file.originalname,
              type: file.mimetype,
              size: file.size,
              description: req.body.documentDescription || ''
            });
          }
        } catch (uploadError) {
          console.error('Media upload error:', uploadError);
        }
      }
    }

    const updateData = {
      ...req.body,
      media: mediaData,
      lastModifiedBy: req.user.id
    };

    content = await Content.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email')
     .populate('lastModifiedBy', 'name email');

    res.json({
      success: true,
      data: content,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating content'
    });
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private (Admin only)
exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Soft delete - set isActive to false
    content.isActive = false;
    await content.save();

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting content'
    });
  }
};

// @desc    Publish content
// @route   PUT /api/content/:id/publish
// @access  Private (Admin only)
exports.publishContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    await content.publish();

    res.json({
      success: true,
      message: 'Content published successfully'
    });
  } catch (error) {
    console.error('Error publishing content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while publishing content'
    });
  }
};

// @desc    Unpublish content
// @route   PUT /api/content/:id/unpublish
// @access  Private (Admin only)
exports.unpublishContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    await content.unpublish();

    res.json({
      success: true,
      message: 'Content unpublished successfully'
    });
  } catch (error) {
    console.error('Error unpublishing content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unpublishing content'
    });
  }
};

// @desc    Get all content (admin)
// @route   GET /api/content
// @access  Private (Admin only)
exports.getAllContent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.status) {
      query['settings.isPublished'] = req.query.status === 'published';
    }
    if (req.query.search) {
      query.$or = [
        { key: { $regex: req.query.search, $options: 'i' } },
        { 'title.en': { $regex: req.query.search, $options: 'i' } },
        { 'title.bn': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const content = await Content.find(query)
      .populate('author', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ 'settings.order': 1, updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      data: content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content'
    });
  }
};

// @desc    Inline update content (for inline editing)
// @route   PATCH /api/content/:key/inline
// @access  Private (Admin only)
exports.inlineUpdateContent = async (req, res) => {
  try {
    const { field, value, language } = req.body;
    
    const content = await Content.findOne({ key: req.params.key });
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Update specific field
    if (language && (field === 'title' || field === 'content' || field === 'excerpt')) {
      content[field][language] = value;
    } else {
      content[field] = value;
    }

    content.lastModifiedBy = req.user.id;
    await content.save();

    res.json({
      success: true,
      data: content,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Error updating content inline:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating content'
    });
  }
};
