const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  rollNumber: {
    type: Number,
    required: true
  },
  class: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  section: {
    type: String,
    required: true
  },
  session: {
    type: String,
    required: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
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
    photo: {
      url: String,
      publicId: String
    },
    birthCertificateNo: String,
    nid: String
  },
  parentInfo: {
    father: {
      name: {
        en: String,
        bn: String
      },
      occupation: {
        en: String,
        bn: String
      },
      phone: String,
      email: String,
      nid: String,
      monthlyIncome: Number,
      education: {
        en: String,
        bn: String
      }
    },
    mother: {
      name: {
        en: String,
        bn: String
      },
      occupation: {
        en: String,
        bn: String
      },
      phone: String,
      email: String,
      nid: String,
      monthlyIncome: Number,
      education: {
        en: String,
        bn: String
      }
    },
    guardian: {
      name: {
        en: String,
        bn: String
      },
      relation: {
        en: String,
        bn: String
      },
      phone: String,
      email: String,
      address: {
        en: String,
        bn: String
      },
      occupation: {
        en: String,
        bn: String
      }
    }
  },
  contactInfo: {
    phone: String,
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
    emergencyContact: {
      name: {
        en: String,
        bn: String
      },
      relation: {
        en: String,
        bn: String
      },
      phone: String
    }
  },
  academicInfo: {
    previousSchool: {
      name: {
        en: String,
        bn: String
      },
      lastClass: {
        en: String,
        bn: String
      },
      passingYear: Number,
      grade: String,
      gpa: Number
    },
    subjects: [{
      en: String,
      bn: String
    }],
    group: {
      en: String,
      bn: String
    },
    shift: {
      type: String,
      enum: ['Morning', 'Day', 'Evening']
    },
    specialNeeds: {
      en: String,
      bn: String
    },
    extracurricular: [{
      activity: {
        en: String,
        bn: String
      },
      level: String,
      achievements: [{
        title: {
          en: String,
          bn: String
        },
        year: Number,
        description: {
          en: String,
          bn: String
        }
      }]
    }]
  },
  fees: {
    admissionFee: {
      type: Number,
      default: 0
    },
    monthlyFee: {
      type: Number,
      default: 0
    },
    examFee: {
      type: Number,
      default: 0
    },
    transport: {
      type: Number,
      default: 0
    },
    library: {
      type: Number,
      default: 0
    },
    lab: {
      type: Number,
      default: 0
    },
    sports: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    paymentHistory: [{
      amount: Number,
      paymentDate: Date,
      method: String,
      receipt: String,
      description: {
        en: String,
        bn: String
      }
    }],
    scholarship: {
      type: {
        en: String,
        bn: String
      },
      amount: Number,
      percentage: Number
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['Birth Certificate', 'Previous Certificate', 'Photo', 'ID', 'Medical', 'Other']
    },
    name: {
      en: String,
      bn: String
    },
    url: String,
    filename: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  healthInfo: {
    height: Number,
    weight: Number,
    allergies: [{
      en: String,
      bn: String
    }],
    medications: [{
      name: {
        en: String,
        bn: String
      },
      dosage: String,
      frequency: String
    }],
    medicalHistory: [{
      condition: {
        en: String,
        bn: String
      },
      date: Date,
      treatment: {
        en: String,
        bn: String
      }
    }],
    vaccinations: [{
      vaccine: {
        en: String,
        bn: String
      },
      date: Date,
      nextDue: Date
    }]
  },
  attendance: {
    totalDays: {
      type: Number,
      default: 0
    },
    presentDays: {
      type: Number,
      default: 0
    },
    absentDays: {
      type: Number,
      default: 0
    },
    lateDays: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    monthlyAttendance: [{
      month: String,
      year: Number,
      totalDays: Number,
      presentDays: Number,
      percentage: Number
    }]
  },
  performance: {
    currentGPA: {
      type: Number,
      default: 0
    },
    currentGrade: String,
    currentPosition: Number,
    examResults: [{
      examName: {
        en: String,
        bn: String
      },
      examType: String,
      year: Number,
      subjects: [{
        subject: {
          en: String,
          bn: String
        },
        marks: Number,
        grade: String,
        gpa: Number
      }],
      totalMarks: Number,
      obtainedMarks: Number,
      gpa: Number,
      grade: String,
      position: Number,
      remarks: {
        en: String,
        bn: String
      }
    }],
    behaviorReports: [{
      date: Date,
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
      },
      behavior: {
        en: String,
        bn: String
      },
      action: {
        en: String,
        bn: String
      }
    }]
  },
  transport: {
    required: {
      type: Boolean,
      default: false
    },
    route: {
      en: String,
      bn: String
    },
    stoppage: {
      en: String,
      bn: String
    },
    vehicleNumber: String,
    driverContact: String
  },
  library: {
    cardNumber: String,
    booksIssued: [{
      bookId: String,
      bookName: {
        en: String,
        bn: String
      },
      issueDate: Date,
      returnDate: Date,
      actualReturnDate: Date,
      fine: Number
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Transferred', 'Graduated', 'Dropped'],
    default: 'Active'
  },
  graduationDate: Date,
  transferDate: Date,
  transferReason: {
    en: String,
    bn: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
studentSchema.index({ studentId: 1 });
studentSchema.index({ 'class.en': 1, section: 1 });
studentSchema.index({ session: 1 });
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ 'name.en': 1 });
studentSchema.index({ 'name.bn': 1 });
studentSchema.index({ status: 1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return {
    en: this.name.en,
    bn: this.name.bn
  };
});

// Virtual for attendance percentage
studentSchema.virtual('attendancePercentage').get(function() {
  if (this.attendance.totalDays === 0) return 0;
  return ((this.attendance.presentDays / this.attendance.totalDays) * 100).toFixed(2);
});

module.exports = mongoose.model('Student', studentSchema);
