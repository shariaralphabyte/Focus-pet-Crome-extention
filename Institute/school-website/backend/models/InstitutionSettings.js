const mongoose = require('mongoose');

const institutionSettingsSchema = new mongoose.Schema({
  // Basic Institution Information
  institutionName: {
    en: {
      type: String,
      required: [true, 'English institution name is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali institution name is required']
    }
  },
  establishmentYear: {
    type: Number,
    required: [true, 'Establishment year is required']
  },
  founder: {
    en: {
      type: String,
      required: [true, 'English founder name is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali founder name is required']
    }
  },
  location: {
    en: {
      type: String,
      required: [true, 'English location is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali location is required']
    }
  },
  
  // Vision and Mission
  vision: {
    en: {
      type: String,
      required: [true, 'English vision is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali vision is required']
    }
  },
  mission: {
    en: {
      type: String,
      required: [true, 'English mission is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali mission is required']
    }
  },
  
  // About Institution
  about: {
    en: {
      type: String,
      required: [true, 'English about is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali about is required']
    }
  },
  
  // Contact Information
  contactInfo: {
    address: {
      en: {
        type: String,
        required: [true, 'English address is required']
      },
      bn: {
        type: String,
        required: [true, 'Bengali address is required']
      }
    },
    phone: [{
      type: String,
      required: true
    }],
    email: [{
      type: String,
      required: true,
      lowercase: true
    }],
    website: String,
    fax: String
  },
  
  // Academic Information
  academicInfo: {
    totalClasses: {
      type: Number,
      default: 0
    },
    totalSections: {
      type: Number,
      default: 0
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required']
    },
    sessionStart: Date,
    sessionEnd: Date
  },
  
  // Statistics (Auto-calculated but can be overridden)
  statistics: {
    totalStudents: {
      type: Number,
      default: 0
    },
    totalTeachers: {
      type: Number,
      default: 0
    },
    totalStaff: {
      type: Number,
      default: 0
    },
    totalAlumni: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    parentRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalBooks: {
      type: Number,
      default: 0
    },
    totalClassrooms: {
      type: Number,
      default: 0
    },
    totalLabs: {
      type: Number,
      default: 0
    }
  },
  
  // Accreditation and Recognition
  accreditation: [{
    title: {
      en: {
        type: String,
        required: true
      },
      bn: {
        type: String,
        required: true
      }
    },
    status: {
      en: {
        type: String,
        required: true
      },
      bn: {
        type: String,
        required: true
      }
    },
    year: {
      type: String,
      required: true
    },
    certificate: {
      public_id: String,
      url: String
    }
  }],
  
  // Facilities
  facilities: [{
    name: {
      en: {
        type: String,
        required: true
      },
      bn: {
        type: String,
        required: true
      }
    },
    description: {
      en: {
        type: String,
        required: true
      },
      bn: {
        type: String,
        required: true
      }
    },
    icon: String,
    image: {
      public_id: String,
      url: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Social Media Links
  socialLinks: {
    facebook: String,
    youtube: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  
  // Logo and Images
  media: {
    logo: {
      public_id: String,
      url: String
    },
    favicon: {
      public_id: String,
      url: String
    },
    heroImages: [{
      public_id: String,
      url: String,
      title: {
        en: String,
        bn: String
      },
      description: {
        en: String,
        bn: String
      }
    }],
    galleryImages: [{
      public_id: String,
      url: String,
      title: {
        en: String,
        bn: String
      },
      category: String
    }]
  },
  
  // Settings
  settings: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    registrationOpen: {
      type: Boolean,
      default: true
    },
    defaultLanguage: {
      type: String,
      enum: ['en', 'bn'],
      default: 'bn'
    },
    timezone: {
      type: String,
      default: 'Asia/Dhaka'
    },
    currency: {
      type: String,
      default: 'BDT'
    }
  },
  
  // Meta Information for SEO
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
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save middleware to update lastUpdated
institutionSettingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get institution settings (singleton pattern)
institutionSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    // Create default settings if none exist
    settings = new this({
      institutionName: {
        en: 'School Management System',
        bn: 'স্কুল ম্যানেজমেন্ট সিস্টেম'
      },
      establishmentYear: 1985,
      founder: {
        en: 'Professor Dr. Abdul Karim',
        bn: 'প্রফেসর ড. আব্দুল করিম'
      },
      location: {
        en: 'Dhaka, Bangladesh',
        bn: 'ঢাকা, বাংলাদেশ'
      },
      vision: {
        en: 'To be a leading educational institution recognized for academic excellence.',
        bn: 'একাডেমিক উৎকর্ষতার জন্য স্বীকৃত একটি অগ্রণী শিক্ষা প্রতিষ্ঠান হতে।'
      },
      mission: {
        en: 'To provide quality education and develop future leaders.',
        bn: 'মানসম্পন্ন শিক্ষা প্রদান এবং ভবিষ্যতের নেতা তৈরি করা।'
      },
      about: {
        en: 'Our institution has been providing quality education since 1985.',
        bn: 'আমাদের প্রতিষ্ঠান ১৯৮৫ সাল থেকে মানসম্পন্ন শিক্ষা প্রদান করে আসছে।'
      },
      contactInfo: {
        address: {
          en: 'Dhaka, Bangladesh',
          bn: 'ঢাকা, বাংলাদেশ'
        },
        phone: ['+880-1234-567890'],
        email: ['info@school.edu.bd']
      },
      academicInfo: {
        academicYear: '2024'
      }
    });
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('InstitutionSettings', institutionSettingsSchema);
