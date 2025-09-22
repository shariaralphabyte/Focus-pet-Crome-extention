const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'published', isActive: true };
    
    // Add search functionality (bilingual)
    if (req.query.search) {
      query.$or = [
        { 'title.en': { $regex: req.query.search, $options: 'i' } },
        { 'title.bn': { $regex: req.query.search, $options: 'i' } },
        { 'content.en': { $regex: req.query.search, $options: 'i' } },
        { 'content.bn': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Add filters
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.featured) {
      query.featured = req.query.featured === 'true';
    }
    if (req.query.author) {
      query.author = req.query.author;
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

    const events = await Event.find(query)
      .populate('author', 'name email')
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('author', 'name email')
      .populate('relatedEvents', 'title slug featuredImage category');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment views
    await event.incrementViews();

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
};

// @desc    Get event by slug
// @route   GET /api/events/slug/:slug
// @access  Public
exports.getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ 
      slug: req.params.slug,
      status: 'published',
      isActive: true 
    })
      .populate('author', 'name email')
      .populate('relatedEvents', 'title slug featuredImage category');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment views
    await event.incrementViews();

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin only)
exports.createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Handle featured image upload
    let featuredImageData = {};
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'events',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        featuredImageData = {
          url: result.secure_url,
          publicId: result.public_id,
          alt: req.body.featuredImageAlt || req.body.title
        };
      } catch (uploadError) {
        console.error('Featured image upload error:', uploadError);
      }
    }

    const eventData = {
      ...req.body,
      featuredImage: featuredImageData,
      author: req.user.id
    };

    const event = await Event.create(eventData);
    await event.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating event'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin/Author)
exports.updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is author or admin
    if (event.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Handle featured image upload
    let featuredImageData = event.featuredImage;
    if (req.file) {
      try {
        // Delete old image if exists
        if (event.featuredImage && event.featuredImage.publicId) {
          await cloudinary.uploader.destroy(event.featuredImage.publicId);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'events',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        
        featuredImageData = {
          url: result.secure_url,
          publicId: result.public_id,
          alt: req.body.featuredImageAlt || req.body.title
        };
      } catch (uploadError) {
        console.error('Featured image upload error:', uploadError);
      }
    }

    const updateData = {
      ...req.body,
      featuredImage: featuredImageData
    };

    event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin/Author)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is author or admin
    if (event.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Soft delete - set isActive to false
    event.isActive = false;
    await event.save();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
exports.getFeaturedEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const events = await Event.getFeatured(limit);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured events'
    });
  }
};

// @desc    Get popular events
// @route   GET /api/events/popular
// @access  Public
exports.getPopularEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const events = await Event.getPopular(limit);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching popular events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular events'
    });
  }
};

// @desc    Get recent events
// @route   GET /api/events/recent
// @access  Public
exports.getRecentEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const events = await Event.getRecent(limit);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching recent events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent events'
    });
  }
};

// @desc    Add comment to event
// @route   POST /api/events/:id/comments
// @access  Public
exports.addComment = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.allowComments) {
      return res.status(403).json({
        success: false,
        message: 'Comments are not allowed for this event'
      });
    }

    const commentData = {
      author: {
        name: req.body.name,
        email: req.body.email,
        website: req.body.website
      },
      content: req.body.content,
      approved: false // Comments need approval
    };

    await event.addComment(commentData);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully and is pending approval'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

// @desc    Get event categories
// @route   GET /api/events/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Event.distinct('category', { 
      status: 'published',
      isActive: true 
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};
