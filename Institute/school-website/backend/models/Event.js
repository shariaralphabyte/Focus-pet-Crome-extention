const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  content: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  excerpt: {
    en: { type: String, maxlength: 300 },
    bn: { type: String, maxlength: 300 }
  },
  featuredImage: {
    url: String,
    publicId: String,
    alt: {
      en: String,
      bn: String
    }
  },
  gallery: [{
    url: String,
    publicId: String,
    caption: {
      en: String,
      bn: String
    },
    alt: {
      en: String,
      bn: String
    }
  }],
  youtubeVideos: [{
    url: String,
    videoId: String,
    title: {
      en: String,
      bn: String
    },
    description: {
      en: String,
      bn: String
    }
  }],
  attachments: [{
    type: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'image', 'video', 'other']
    },
    url: String,
    filename: String,
    originalName: String,
    size: Number,
    description: {
      en: String,
      bn: String
    }
  }],
  category: {
    type: String,
    enum: [
      'Academic', 'Sports', 'Cultural', 'Science', 'Arts', 'Competition',
      'Workshop', 'Seminar', 'Celebration', 'Achievement', 'News', 'Announcement'
    ],
    required: true
  },
  tags: [{
    en: String,
    bn: String
  }],
  eventDetails: {
    eventDate: Date,
    startTime: String,
    endTime: String,
    venue: {
      en: String,
      bn: String
    },
    organizer: {
      en: String,
      bn: String
    },
    participants: {
      expected: Number,
      registered: Number,
      attended: Number
    },
    registrationRequired: {
      type: Boolean,
      default: false
    },
    registrationDeadline: Date,
    contactPerson: {
      name: {
        en: String,
        bn: String
      },
      phone: String,
      email: String
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
    }],
    canonicalUrl: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'scheduled'],
    default: 'draft'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  featured: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  comments: [{
    author: {
      name: String,
      email: String,
      website: String
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
    replies: [{
      author: {
        name: String,
        email: String
      },
      content: String,
      date: {
        type: Date,
        default: Date.now
      },
      approved: {
        type: Boolean,
        default: false
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
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
eventSchema.index({ slug: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ publishDate: -1 });
eventSchema.index({ 'eventDetails.eventDate': 1 });
eventSchema.index({ featured: 1 });
eventSchema.index({ 'title.en': 'text', 'title.bn': 'text', 'content.en': 'text', 'content.bn': 'text' });

// Virtual for URL
eventSchema.virtual('url').get(function() {
  return `/events/${this.slug}`;
});

// Virtual for reading time (approximate)
eventSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const contentLength = (this.content.en || '').length + (this.content.bn || '').length;
  const words = contentLength / 5; // Approximate words
  return Math.ceil(words / wordsPerMinute);
});

// Pre-save middleware to generate slug
eventSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Static method to get popular events
eventSchema.statics.getPopular = function(limit = 5) {
  return this.find({ status: 'published', isActive: true })
    .sort({ 'engagement.views': -1, 'engagement.likes': -1 })
    .limit(limit)
    .populate('author', 'name email');
};

// Static method to get recent events
eventSchema.statics.getRecent = function(limit = 10) {
  return this.find({ status: 'published', isActive: true })
    .sort({ publishDate: -1 })
    .limit(limit)
    .populate('author', 'name email');
};

// Static method to get featured events
eventSchema.statics.getFeatured = function(limit = 3) {
  return this.find({ status: 'published', featured: true, isActive: true })
    .sort({ publishDate: -1 })
    .limit(limit)
    .populate('author', 'name email');
};

// Instance method to increment views
eventSchema.methods.incrementViews = function() {
  this.engagement.views += 1;
  return this.save();
};

// Instance method to add comment
eventSchema.methods.addComment = function(commentData) {
  this.comments.push(commentData);
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema);
