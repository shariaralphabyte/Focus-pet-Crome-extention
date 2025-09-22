const mongoose = require('mongoose');

const managementCommitteeSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'English name is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali name is required']
    }
  },
  position: {
    en: {
      type: String,
      required: [true, 'English position is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali position is required']
    }
  },
  qualification: {
    en: {
      type: String,
      required: [true, 'English qualification is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali qualification is required']
    }
  },
  experience: {
    en: {
      type: String,
      required: [true, 'English experience is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali experience is required']
    }
  },
  bio: {
    en: {
      type: String,
      required: [true, 'English bio is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali bio is required']
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true
    },
    address: {
      en: String,
      bn: String
    }
  },
  photo: {
    public_id: String,
    url: String
  },
  joinDate: {
    type: Date,
    required: [true, 'Join date is required']
  },
  category: {
    type: String,
    enum: ['leadership', 'academic', 'administration', 'finance'],
    required: [true, 'Category is required']
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  socialLinks: {
    facebook: String,
    linkedin: String,
    twitter: String
  }
}, {
  timestamps: true
});

// Index for better performance
managementCommitteeSchema.index({ priority: -1 });
managementCommitteeSchema.index({ category: 1 });
managementCommitteeSchema.index({ isActive: 1 });

module.exports = mongoose.model('ManagementCommittee', managementCommitteeSchema);
