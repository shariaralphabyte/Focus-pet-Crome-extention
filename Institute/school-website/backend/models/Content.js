const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'hero-slide', 'vision-mission', 'about-section', 'contact-info',
      'institution-overview', 'page-content', 'widget', 'menu-item',
      'footer-content', 'banner', 'announcement', 'testimonial'
    ],
    required: true
  },
  title: {
    en: String,
    bn: String
  },
  content: {
    en: String,
    bn: String
  },
  excerpt: {
    en: String,
    bn: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed // For flexible data storage
  },
  media: {
    images: [{
      url: String,
      publicId: String,
      alt: {
        en: String,
        bn: String
      },
      caption: {
        en: String,
        bn: String
      }
    }],
    videos: [{
      url: String,
      type: {
        type: String,
        enum: ['youtube', 'vimeo', 'upload']
      },
      thumbnail: String,
      title: {
        en: String,
        bn: String
      }
    }],
    documents: [{
      url: String,
      filename: String,
      type: String,
      size: Number,
      description: {
        en: String,
        bn: String
      }
    }]
  },
  settings: {
    isPublished: {
      type: Boolean,
      default: true
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    template: String,
    cssClasses: String,
    customCSS: String,
    customJS: String
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
    keywords: [String],
    canonicalUrl: String
  },
  schedule: {
    publishDate: Date,
    expiryDate: Date,
    timezone: {
      type: String,
      default: 'Asia/Dhaka'
    }
  },
  targeting: {
    audience: [{
      type: String,
      enum: ['all', 'students', 'teachers', 'parents', 'visitors', 'admin']
    }],
    devices: [{
      type: String,
      enum: ['desktop', 'tablet', 'mobile']
    }],
    languages: [{
      type: String,
      enum: ['en', 'bn', 'all']
    }]
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  revisions: [{
    version: Number,
    content: mongoose.Schema.Types.Mixed,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    changeLog: String
  }],
  tags: [String],
  category: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
contentSchema.index({ key: 1 });
contentSchema.index({ type: 1 });
contentSchema.index({ 'settings.isPublished': 1 });
contentSchema.index({ 'settings.order': 1 });
contentSchema.index({ category: 1 });
contentSchema.index({ tags: 1 });

// Virtual for current status
contentSchema.virtual('isCurrentlyVisible').get(function() {
  const now = new Date();
  const isPublished = this.settings.isPublished;
  const isVisible = this.settings.isVisible;
  const isActive = this.isActive;
  
  let isScheduled = true;
  if (this.schedule.publishDate && now < this.schedule.publishDate) {
    isScheduled = false;
  }
  if (this.schedule.expiryDate && now > this.schedule.expiryDate) {
    isScheduled = false;
  }
  
  return isPublished && isVisible && isActive && isScheduled;
});

// Pre-save middleware to handle versioning
contentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    // Create revision
    this.revisions.push({
      version: this.version,
      content: {
        title: this.title,
        content: this.content,
        data: this.data,
        media: this.media,
        settings: this.settings
      },
      modifiedBy: this.lastModifiedBy,
      modifiedAt: new Date(),
      changeLog: `Version ${this.version} saved`
    });
    
    // Increment version
    this.version += 1;
    
    // Keep only last 10 revisions
    if (this.revisions.length > 10) {
      this.revisions = this.revisions.slice(-10);
    }
  }
  next();
});

// Static method to get content by key
contentSchema.statics.getByKey = function(key, language = 'en') {
  return this.findOne({
    key: key,
    'settings.isPublished': true,
    isActive: true
  });
};

// Static method to get content by type
contentSchema.statics.getByType = function(type, options = {}) {
  const query = {
    type: type,
    'settings.isPublished': true,
    isActive: true
  };
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query)
    .sort({ 'settings.order': 1, createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get hero slides
contentSchema.statics.getHeroSlides = function() {
  return this.find({
    type: 'hero-slide',
    'settings.isPublished': true,
    'settings.isVisible': true,
    isActive: true
  }).sort({ 'settings.order': 1 });
};

// Static method to get vision/mission
contentSchema.statics.getVisionMission = function() {
  return this.findOne({
    type: 'vision-mission',
    'settings.isPublished': true,
    isActive: true
  });
};

// Instance method to publish
contentSchema.methods.publish = function() {
  this.settings.isPublished = true;
  return this.save();
};

// Instance method to unpublish
contentSchema.methods.unpublish = function() {
  this.settings.isPublished = false;
  return this.save();
};

// Instance method to create revision
contentSchema.methods.createRevision = function(changeLog = '') {
  this.revisions.push({
    version: this.version,
    content: {
      title: this.title,
      content: this.content,
      data: this.data,
      media: this.media,
      settings: this.settings
    },
    modifiedBy: this.lastModifiedBy,
    modifiedAt: new Date(),
    changeLog: changeLog || `Manual revision created`
  });
  
  return this.save();
};

module.exports = mongoose.model('Content', contentSchema);
