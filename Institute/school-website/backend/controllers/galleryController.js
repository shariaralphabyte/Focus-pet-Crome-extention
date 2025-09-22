const Gallery = require('../models/Gallery');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// @desc    Get all galleries
// @route   GET /api/gallery
// @access  Public
exports.getGalleries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'published', isActive: true };
    
    // Add visibility filter
    if (req.query.visibility) {
      query.visibility = req.query.visibility;
    } else {
      query.visibility = 'public'; // Default to public only
    }

    // Add filters
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.featured) {
      query.featured = req.query.featured === 'true';
    }

    // Add search functionality
    if (req.query.search) {
      query.$or = [
        { 'title.en': { $regex: req.query.search, $options: 'i' } },
        { 'title.bn': { $regex: req.query.search, $options: 'i' } },
        { 'description.en': { $regex: req.query.search, $options: 'i' } },
        { 'description.bn': { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Date filters
    if (req.query.dateFrom || req.query.dateTo) {
      query['eventDetails.eventDate'] = {};
      if (req.query.dateFrom) {
        query['eventDetails.eventDate'].$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        query['eventDetails.eventDate'].$lte = new Date(req.query.dateTo);
      }
    }

    const galleries = await Gallery.find(query)
      .populate('author', 'name email')
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Gallery.countDocuments(query);

    res.json({
      success: true,
      data: galleries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching galleries'
    });
  }
};

// @desc    Get single gallery
// @route   GET /api/gallery/:id
// @access  Public
exports.getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate('author', 'name email')
      .populate('contributors.user', 'name email');

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Check visibility
    if (gallery.visibility !== 'public' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this gallery'
      });
    }

    // Increment views
    await gallery.incrementViews();

    res.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery'
    });
  }
};

// @desc    Get gallery by slug
// @route   GET /api/gallery/slug/:slug
// @access  Public
exports.getGalleryBySlug = async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ 
      slug: req.params.slug,
      status: 'published',
      isActive: true 
    })
      .populate('author', 'name email')
      .populate('contributors.user', 'name email');

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Check visibility
    if (gallery.visibility !== 'public' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this gallery'
      });
    }

    // Increment views
    await gallery.incrementViews();

    res.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery'
    });
  }
};

// @desc    Create new gallery
// @route   POST /api/gallery
// @access  Private (Admin only)
exports.createGallery = async (req, res) => {
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
    let mediaItems = [];
    let coverImageData = {};

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'gallery',
            resource_type: 'auto',
            transformation: file.mimetype.startsWith('image/') ? [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ] : []
          });
          
          const mediaItem = {
            type: file.mimetype.startsWith('image/') ? 'image' : 'video',
            url: result.secure_url,
            publicId: result.public_id,
            title: req.body[`mediaTitle_${i}`] || {},
            caption: req.body[`mediaCaption_${i}`] || {},
            alt: req.body[`mediaAlt_${i}`] || {},
            metadata: {
              width: result.width,
              height: result.height,
              size: file.size,
              format: result.format,
              duration: result.duration || null
            },
            photographer: req.body[`photographer_${i}`] || {},
            location: req.body[`location_${i}`] || {},
            eventDate: req.body[`eventDate_${i}`] || null
          };

          mediaItems.push(mediaItem);

          // Set first image as cover if not set
          if (i === 0 && file.mimetype.startsWith('image/')) {
            coverImageData = {
              url: result.secure_url,
              publicId: result.public_id,
              alt: req.body[`mediaAlt_0`] || req.body.title
            };
          }
        } catch (uploadError) {
          console.error('Media upload error:', uploadError);
        }
      }
    }

    const galleryData = {
      ...req.body,
      media: mediaItems,
      coverImage: coverImageData,
      author: req.user.id
    };

    const gallery = await Gallery.create(galleryData);
    await gallery.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: gallery,
      message: 'Gallery created successfully'
    });
  } catch (error) {
    console.error('Error creating gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating gallery'
    });
  }
};

// @desc    Update gallery
// @route   PUT /api/gallery/:id
// @access  Private (Admin/Author)
exports.updateGallery = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Check if user is author or admin
    if (gallery.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this gallery'
      });
    }

    // Handle new media uploads
    let mediaItems = gallery.media || [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'gallery',
            resource_type: 'auto',
            transformation: file.mimetype.startsWith('image/') ? [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ] : []
          });
          
          const mediaItem = {
            type: file.mimetype.startsWith('image/') ? 'image' : 'video',
            url: result.secure_url,
            publicId: result.public_id,
            title: req.body[`mediaTitle_${i}`] || {},
            caption: req.body[`mediaCaption_${i}`] || {},
            alt: req.body[`mediaAlt_${i}`] || {},
            metadata: {
              width: result.width,
              height: result.height,
              size: file.size,
              format: result.format,
              duration: result.duration || null
            },
            photographer: req.body[`photographer_${i}`] || {},
            location: req.body[`location_${i}`] || {},
            eventDate: req.body[`eventDate_${i}`] || null
          };

          mediaItems.push(mediaItem);
        } catch (uploadError) {
          console.error('Media upload error:', uploadError);
        }
      }
    }

    const updateData = {
      ...req.body,
      media: mediaItems
    };

    gallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email')
     .populate('contributors.user', 'name email');

    res.json({
      success: true,
      data: gallery,
      message: 'Gallery updated successfully'
    });
  } catch (error) {
    console.error('Error updating gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating gallery'
    });
  }
};

// @desc    Delete gallery
// @route   DELETE /api/gallery/:id
// @access  Private (Admin/Author)
exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Check if user is author or admin
    if (gallery.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this gallery'
      });
    }

    // Soft delete - set isActive to false
    gallery.isActive = false;
    await gallery.save();

    res.json({
      success: true,
      message: 'Gallery deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting gallery'
    });
  }
};

// @desc    Add media to gallery
// @route   POST /api/gallery/:id/media
// @access  Private (Admin/Author)
exports.addMediaToGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Check if user is author or admin
    if (gallery.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add media to this gallery'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No media file provided'
      });
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'gallery',
        resource_type: 'auto',
        transformation: req.file.mimetype.startsWith('image/') ? [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ] : []
      });
      
      const mediaItem = {
        type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
        url: result.secure_url,
        publicId: result.public_id,
        title: req.body.title || {},
        caption: req.body.caption || {},
        alt: req.body.alt || {},
        metadata: {
          width: result.width,
          height: result.height,
          size: req.file.size,
          format: result.format,
          duration: result.duration || null
        },
        photographer: req.body.photographer || {},
        location: req.body.location || {},
        eventDate: req.body.eventDate || null
      };

      await gallery.addMedia(mediaItem);

      res.json({
        success: true,
        message: 'Media added to gallery successfully'
      });
    } catch (uploadError) {
      console.error('Media upload error:', uploadError);
      res.status(500).json({
        success: false,
        message: 'Error uploading media file'
      });
    }
  } catch (error) {
    console.error('Error adding media to gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding media to gallery'
    });
  }
};

// @desc    Remove media from gallery
// @route   DELETE /api/gallery/:id/media/:mediaIndex
// @access  Private (Admin/Author)
exports.removeMediaFromGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Check if user is author or admin
    if (gallery.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove media from this gallery'
      });
    }

    const mediaIndex = parseInt(req.params.mediaIndex);
    await gallery.removeMedia(mediaIndex);

    res.json({
      success: true,
      message: 'Media removed from gallery successfully'
    });
  } catch (error) {
    console.error('Error removing media from gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing media from gallery'
    });
  }
};

// @desc    Get featured galleries
// @route   GET /api/gallery/featured
// @access  Public
exports.getFeaturedGalleries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const galleries = await Gallery.getFeatured(limit);

    res.json({
      success: true,
      data: galleries
    });
  } catch (error) {
    console.error('Error fetching featured galleries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured galleries'
    });
  }
};

// @desc    Get recent galleries
// @route   GET /api/gallery/recent
// @access  Public
exports.getRecentGalleries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const galleries = await Gallery.getRecent(limit);

    res.json({
      success: true,
      data: galleries
    });
  } catch (error) {
    console.error('Error fetching recent galleries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent galleries'
    });
  }
};

// @desc    Get galleries by category
// @route   GET /api/gallery/category/:category
// @access  Public
exports.getGalleriesByCategory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const galleries = await Gallery.getByCategory(req.params.category, limit);

    res.json({
      success: true,
      data: galleries
    });
  } catch (error) {
    console.error('Error fetching galleries by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching galleries by category'
    });
  }
};

// @desc    Get gallery categories
// @route   GET /api/gallery/categories
// @access  Public
exports.getGalleryCategories = async (req, res) => {
  try {
    const categories = await Gallery.distinct('category', { 
      status: 'published',
      visibility: 'public',
      isActive: true 
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery categories'
    });
  }
};
