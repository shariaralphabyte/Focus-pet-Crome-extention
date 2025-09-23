const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: String,
    required: [true, 'Teacher ID is required'],
    unique: true,
    trim: true
  },
  designation: {
    en: {
      type: String,
      required: [true, 'English designation is required']
    },
    bn: {
      type: String,
      required: [true, 'Bengali designation is required']
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Bangla',
      'English',
      'Mathematics',
      'Science',
      'Physics',
      'Chemistry',
      'Biology',
      'Social Science',
      'History',
      'Geography',
      'Civics',
      'Economics',
      'Accounting',
      'Business Studies',
      'ICT',
      'Physical Education',
      'Islamic Studies',
      'Hindu Religion',
      'Christian Religion',
      'Buddhist Religion',
      'Arts & Crafts',
      'Music',
      'General'
    ]
  },
  subjects: [{
    type: String
  }],
  classes: [{
    class: {
      type: String
    },
    section: {
      type: String
    },
    subject: {
      type: String
    }
  }],
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    result: String,
    certificate: {
      public_id: String,
      url: String
    }
  }],
  experience: {
    totalYears: {
      type: Number,
      default: 0
    },
    previousInstitutions: [{
      name: String,
      designation: String,
      duration: String,
      responsibilities: String
    }]
  },
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required']
  },
  employeeType: {
    type: String,
    enum: ['Permanent', 'Temporary', 'Part-time', 'Contract'],
    default: 'Permanent'
  },
  mpoStatus: {
    type: String,
    enum: ['MPO', 'Non-MPO', 'Pending'],
    default: 'Non-MPO'
  },
  mpoIndex: {
    type: String,
    trim: true
  },
  salary: {
    basic: {
      type: Number,
      default: 0
    },
    houseRent: {
      type: Number,
      default: 0
    },
    medical: {
      type: Number,
      default: 0
    },
    transport: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  personalInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    bloodGroup: String,
    nationality: {
      en: String,
      bn: String
    },
    religion: {
      en: String,
      bn: String
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed']
    },
    photo: {
      url: String,
      publicId: String
    }
  },
  contactInfo: {
    phone: String,
    alternatePhone: String,
    email: String,
    address: {
      present: {
        en: String,
        bn: String
      },
      permanent: {
        en: String,
        bn: String
      }
    },
    socialMedia: {
      facebook: String,
      linkedin: String,
      twitter: String
    }
  },
  emergencyContact: {
    name: {
      en: String,
      bn: String
    },
    relationship: {
      en: String,
      bn: String
    },
    phone: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['CV', 'Certificate', 'ID', 'Photo', 'Other']
    },
    url: String,
    filename: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  salary: {
    basic: Number,
    allowances: [{
      type: {
        en: String,
        bn: String
      },
      amount: Number
    }],
    deductions: [{
      type: {
        en: String,
        bn: String
      },
      amount: Number
    }]
  },
  schedule: {
    workingDays: [{
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }],
    workingHours: {
      start: String,
      end: String
    },
    classSchedule: [{
      day: String,
      time: String,
      subject: {
        en: String,
        bn: String
      },
      class: {
        en: String,
        bn: String
      },
      room: String
    }]
  },
  performance: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    reviews: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: Number,
      comment: {
        en: String,
        bn: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    studentFeedback: [{
      rating: Number,
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  leaveDate: Date,
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Suspended', 'Terminated'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Indexes for better performance
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ designation: 1 });
// teacherSchema.index({ 'personalInfo.nid': 1 }); // Commented out as nid field doesn't exist

// Virtual for full name
teacherSchema.virtual('fullName').get(function() {
  return this.user ? this.user.name : '';
});

// Virtual for age
teacherSchema.virtual('age').get(function() {
  if (this.personalInfo && this.personalInfo.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.personalInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
});

// Virtual for years of service
teacherSchema.virtual('yearsOfService').get(function() {
  if (this.joiningDate) {
    const today = new Date();
    const joinDate = new Date(this.joiningDate);
    const years = today.getFullYear() - joinDate.getFullYear();
    const monthDiff = today.getMonth() - joinDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < joinDate.getDate())) {
      return Math.max(0, years - 1);
    }
    
    return years;
  }
  return 0;
});

// Ensure teacherId exists before validation
teacherSchema.pre('validate', async function(next) {
  if (!this.teacherId) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await this.constructor.countDocuments();
    this.teacherId = `TCH${year}${String(count + 1).padStart(4, '0')}`;
  }

  next();
});

module.exports = mongoose.model('Teacher', teacherSchema);
