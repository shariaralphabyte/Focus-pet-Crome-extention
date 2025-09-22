const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true },
    bn: { type: String, required: true, trim: true }
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    en: String,
    bn: String
  },
  category: {
    type: String,
    enum: [
      'Academic', 'Sports', 'Cultural', 'Science Fair', 'Annual Function',
      'Graduation', 'Field Trip', 'Workshop', 'Competition', 'Achievement',
      'Infrastructure', 'Events', 'Celebration', 'Other'
    ],
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'mixed'],
    default: 'image'
  },
  coverImage: {
    url: String,
    publicId: String,
    alt: {
      en: String,
      bn: String
    }
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: String,
    thumbnail: String,
    title: {
      en: String,
      bn: String
    },
    caption: {
      en: String,
      bn: String
    },
    alt: {
      en: String,
      bn: String
    },
    tags: [{
      en: String,
      bn: String
    }],
    metadata: {
      width: Number,
      height: Number,
      size: Number,
      format: String,
      duration: Number, // for videos
      resolution: String
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    photographer: {
      en: String,
      bn: String
    },
    location: {
      en: String,
      bn: String
    },
    eventDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  albums: [{
    name: {
      en: String,
      bn: String
    },
    description: {
      en: String,
      bn: String
    },
    mediaItems: [Number], // indexes of media array
    coverIndex: Number,
    createdDate: {
      type: Date,
      default: Date.now
    }
  }],
  eventDetails: {
    eventName: {
      en: String,
      bn: String
    },
    eventDate: Date,
    venue: {
      en: String,
      bn: String
    },
    organizer: {
      en: String,
      bn: String
    },
    participants: [{
      en: String,
      bn: String
    }]
  },
  tags: [{
    en: String,
    bn: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contributors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['photographer', 'editor', 'uploader', 'organizer']
    },
    contribution: {
      en: String,
      bn: String
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'private'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'students', 'teachers', 'parents', 'admin'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  allowDownload: {
    type: Boolean,
    default: true
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  comments: [{
    author: {
      name: String,
      email: String,
      role: String
    },
    content: String,
    date: {
      type: Date,
      default: Date.now
    },
    approved: {
      type: Boolean,
      default: false
    },
    mediaIndex: Number, // which media item the comment is for
    replies: [{
      author: {
        name: String,
        email: String
      },
      content: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    }
  },
  seo: {
    metaTitle: {
      en: String,
      bn: String
    },
    metaDescription: {
      en: String,
      bn: String
    },
    keywords: [{
      en: String,
      bn: String
    }]
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
gallerySchema.index({ slug: 1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ status: 1 });
gallerySchema.index({ featured: 1 });
gallerySchema.index({ publishDate: -1 });
gallerySchema.index({ 'eventDetails.eventDate': -1 });
gallerySchema.index({ 'title.en': 'text', 'title.bn': 'text', 'description.en': 'text', 'description.bn': 'text' });

// Virtual for URL
gallerySchema.virtual('url').get(function() {
  return `/gallery/${this.slug}`;
});

// Virtual for media count
gallerySchema.virtual('mediaCount').get(function() {
  return this.media ? this.media.filter(item => item.isActive).length : 0;
});

// Virtual for image count
gallerySchema.virtual('imageCount').get(function() {
  return this.media ? this.media.filter(item => item.type === 'image' && item.isActive).length : 0;
});

// Virtual for video count
gallerySchema.virtual('videoCount').get(function() {
  return this.media ? this.media.filter(item => item.type === 'video' && item.isActive).length : 0;
});

// Pre-save middleware
gallerySchema.pre('save', function(next) {
  // Generate slug if not exists
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  
  // Update lastModified
  this.lastModified = new Date();
  
  // Set cover image if not set and media exists
  if (!this.coverImage.url && this.media && this.media.length > 0) {
    const firstImage = this.media.find(item => item.type === 'image' && item.isActive);
    if (firstImage) {
      this.coverImage = {
        url: firstImage.url,
        publicId: firstImage.publicId,
        alt: firstImage.alt
      };
    }
  }
  
  next();
});

// Static method to get featured galleries
gallerySchema.statics.getFeatured = function(limit = 6) {
  return this.find({
    status: 'published',
    featured: true,
    isActive: true
  })
  .sort({ publishDate: -1 })
  .limit(limit)
  .populate('author', 'name email');
};

// Static method to get recent galleries
gallerySchema.statics.getRecent = function(limit = 12) {
  return this.find({
    status: 'published',
    isActive: true
  })
  .sort({ publishDate: -1 })
  .limit(limit)
  .populate('author', 'name email');
};

// Static method to get by category
gallerySchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({
    category: category,
    status: 'published',
    isActive: true
  })
  .sort({ publishDate: -1 })
  .limit(limit)
  .populate('author', 'name email');
};

// Instance method to increment views
gallerySchema.methods.incrementViews = function() {
  this.engagement.views += 1;
  return this.save();
};

// Instance method to add media
gallerySchema.methods.addMedia = function(mediaData) {
  this.media.push(mediaData);
  return this.save();
};

// Instance method to remove media
gallerySchema.methods.removeMedia = function(mediaIndex) {
  if (this.media[mediaIndex]) {
    this.media[mediaIndex].isActive = false;
  }
  return this.save();
};

module.exports = mongoose.model('Gallery', gallerySchema);
