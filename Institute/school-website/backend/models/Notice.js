const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true, maxlength: 200 },
    bn: { type: String, required: true, trim: true, maxlength: 200 }
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
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'General', 'Academic', 'Examination', 'Admission', 'Holiday',
      'Event', 'Sports', 'Cultural', 'Emergency', 'Fee', 'Result',
      'Meeting', 'Training', 'Workshop', 'Announcement', 'Circular'
    ]
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  targetAudience: [{
    type: String,
    enum: ['All', 'Students', 'Teachers', 'Parents', 'Staff', 'Management', 'Alumni']
  }],
  attachments: [{
    type: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'image', 'video', 'excel', 'other']
    },
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    publicId: String,
    description: {
      en: String,
      bn: String
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
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
    }
  }],
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
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  expiryDate: Date,
  isPublished: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: false
  },
  noticeNumber: {
    type: String,
    unique: true
  },
  referenceNumber: String,
  department: {
    en: String,
    bn: String
  },
  effectiveDate: Date,
  tags: [{
    en: String,
    bn: String
  }],
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  notifications: {
    email: {
      sent: { type: Boolean, default: false },
      sentDate: Date,
      recipients: [String]
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentDate: Date,
      recipients: [String]
    },
    push: {
      sent: { type: Boolean, default: false },
      sentDate: Date
    }
  },
  relatedNotices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notice'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
noticeSchema.index({ slug: 1 });
noticeSchema.index({ category: 1 });
noticeSchema.index({ status: 1 });
noticeSchema.index({ publishDate: -1 });
noticeSchema.index({ expiryDate: 1 });
noticeSchema.index({ isPinned: 1 });
noticeSchema.index({ featured: 1 });
noticeSchema.index({ noticeNumber: 1 });
noticeSchema.index({ 'title.en': 'text', 'title.bn': 'text', 'content.en': 'text', 'content.bn': 'text' });

// Virtual for URL
noticeSchema.virtual('url').get(function() {
  return `/notices/${this.slug}`;
});

// Virtual for reading time
noticeSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const contentLength = (this.content.en || '').length + (this.content.bn || '').length;
  const words = contentLength / 5;
  return Math.ceil(words / wordsPerMinute);
});

// Virtual for status check
noticeSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

// Pre-save middleware to generate slug and notice number
noticeSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  
  if (this.isNew && !this.noticeNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.noticeNumber = `NOT-${year}${month}-${random}`;
  }
  
  next();
});

// Static method to get active notices
noticeSchema.statics.getActive = function(limit = 10) {
  return this.find({ 
    status: 'published', 
    isActive: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: new Date() } }
    ]
  })
  .sort({ isPinned: -1, publishDate: -1 })
  .limit(limit)
  .populate('author', 'name email');
};

// Static method to get pinned notices
noticeSchema.statics.getPinned = function() {
  return this.find({ 
    status: 'published', 
    isPinned: true, 
    isActive: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: new Date() } }
    ]
  })
  .sort({ publishDate: -1 })
  .populate('author', 'name email');
};

// Instance method to increment views
noticeSchema.methods.incrementViews = function() {
  this.engagement.views += 1;
  return this.save();
};

// Instance method to increment downloads
noticeSchema.methods.incrementDownloads = function() {
  this.engagement.downloads += 1;
  return this.save();
};

module.exports = mongoose.model('Notice', noticeSchema);
