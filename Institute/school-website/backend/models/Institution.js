const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  basicInfo: {
    name: {
      en: {
        type: String,
        required: [true, 'English name is required'],
        trim: true
      },
      bn: {
        type: String,
        required: [true, 'Bangla name is required'],
        trim: true
      }
    },
    establishedYear: {
      type: Number,
      required: [true, 'Established year is required']
    },
    eiin: {
      type: String,
      required: [true, 'EIIN is required'],
      unique: true,
      trim: true
    },
    schoolCode: {
      type: String,
      required: [true, 'School code is required'],
      unique: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Primary', 'Secondary', 'Higher Secondary', 'Combined'],
      required: true
    },
    category: {
      type: String,
      enum: ['Government', 'Non-Government', 'Private', 'Madrasa', 'Technical'],
      required: true
    },
    shift: {
      type: String,
      enum: ['Morning', 'Day', 'Evening', 'Double Shift'],
      default: 'Day'
    }
  },
  contact: {
    address: {
      en: {
        type: String,
        required: true,
        trim: true
      },
      bn: {
        type: String,
        required: true,
        trim: true
      }
    },
    district: {
      type: String,
      required: true
    },
    upazila: {
      type: String,
      required: true
    },
    union: String,
    postCode: String,
    phone: [{
      type: String,
      required: true
    }],
    email: [{
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }],
    website: String,
    fax: String
  },
  headTeacher: {
    name: {
      en: String,
      bn: String
    },
    message: {
      en: String,
      bn: String
    },
    photo: {
      public_id: String,
      url: String
    },
    qualification: String,
    experience: String,
    joiningDate: Date
  },
  history: {
    en: {
      type: String,
      trim: true
    },
    bn: {
      type: String,
      trim: true
    }
  },
  mission: {
    en: String,
    bn: String
  },
  vision: {
    en: String,
    bn: String
  },
  accreditation: {
    recognitionNumber: String,
    recognitionDate: Date,
    recognitionAuthority: String,
    mpoDate: Date,
    mpoNumber: String,
    affiliatedBoard: {
      type: String,
      enum: ['Dhaka', 'Rajshahi', 'Comilla', 'Jessore', 'Chittagong', 'Barisal', 'Sylhet', 'Dinajpur', 'Madrasa', 'Technical']
    },
    affiliationNumber: String,
    affiliationDate: Date
  },
  infrastructure: {
    totalLand: String,
    buildingArea: String,
    totalRooms: Number,
    classrooms: Number,
    laboratories: [{
      name: String,
      type: String
    }],
    library: {
      totalBooks: Number,
      readingCapacity: Number
    },
    playground: {
      available: Boolean,
      area: String,
      facilities: [String]
    },
    hostel: {
      available: Boolean,
      capacity: Number,
      type: String
    },
    transport: {
      available: Boolean,
      vehicles: Number,
      routes: [String]
    },
    other: [String]
  },
  statistics: {
    totalStudents: {
      male: Number,
      female: Number,
      total: Number
    },
    totalTeachers: {
      male: Number,
      female: Number,
      total: Number
    },
    totalStaff: {
      male: Number,
      female: Number,
      total: Number
    },
    classWiseStudents: [{
      class: String,
      male: Number,
      female: Number,
      total: Number
    }]
  },
  approvedBranches: [{
    class: String,
    group: String,
    sections: [String],
    capacity: Number,
    currentStudents: Number
  }],
  mpoInfo: {
    isMpoApproved: {
      type: Boolean,
      default: false
    },
    mpoDate: Date,
    mpoNumber: String,
    approvedPosts: [{
      designation: String,
      subject: String,
      quantity: Number,
      filled: Number
    }],
    nonMpoTeachers: Number
  },
  managingCommittee: [{
    name: {
      en: String,
      bn: String
    },
    designation: {
      en: String,
      bn: String
    },
    profession: String,
    phone: String,
    email: String,
    address: String,
    photo: {
      public_id: String,
      url: String
    },
    tenure: {
      start: Date,
      end: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  complaintOfficer: {
    name: {
      en: String,
      bn: String
    },
    designation: String,
    phone: String,
    email: String,
    officeHours: String,
    photo: {
      public_id: String,
      url: String
    }
  },
  gallery: {
    logo: {
      public_id: String,
      url: String
    },
    banner: [{
      public_id: String,
      url: String,
      caption: {
        en: String,
        bn: String
      }
    }],
    buildingPhotos: [{
      public_id: String,
      url: String,
      caption: {
        en: String,
        bn: String
      }
    }]
  },
  socialMedia: {
    facebook: String,
    youtube: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  settings: {
    academicYear: {
      current: String,
      startMonth: Number,
      endMonth: Number
    },
    workingDays: [{
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }],
    schoolHours: {
      start: String,
      end: String
    },
    breakTime: {
      start: String,
      end: String
    },
    examSchedule: {
      firstTerm: {
        start: Date,
        end: Date
      },
      secondTerm: {
        start: Date,
        end: Date
      },
      finalExam: {
        start: Date,
        end: Date
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
institutionSchema.index({ 'basicInfo.eiin': 1 });
institutionSchema.index({ 'basicInfo.schoolCode': 1 });
institutionSchema.index({ 'contact.district': 1 });

// Virtual for total students
institutionSchema.virtual('totalStudentsCount').get(function() {
  return this.statistics && this.statistics.totalStudents ? 
    this.statistics.totalStudents.total : 0;
});

// Virtual for total teachers
institutionSchema.virtual('totalTeachersCount').get(function() {
  return this.statistics && this.statistics.totalTeachers ? 
    this.statistics.totalTeachers.total : 0;
});

// Method to update statistics
institutionSchema.methods.updateStatistics = async function() {
  const Student = require('./Student');
  const Teacher = require('./Teacher');
  
  // Count students by gender
  const studentStats = await Student.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Count teachers by gender
  const teacherStats = await Teacher.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$personalInfo.gender',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Update statistics
  let maleStudents = 0, femaleStudents = 0;
  let maleTeachers = 0, femaleTeachers = 0;
  
  studentStats.forEach(stat => {
    if (stat._id === 'Male') maleStudents = stat.count;
    if (stat._id === 'Female') femaleStudents = stat.count;
  });
  
  teacherStats.forEach(stat => {
    if (stat._id === 'Male') maleTeachers = stat.count;
    if (stat._id === 'Female') femaleTeachers = stat.count;
  });
  
  this.statistics = {
    totalStudents: {
      male: maleStudents,
      female: femaleStudents,
      total: maleStudents + femaleStudents
    },
    totalTeachers: {
      male: maleTeachers,
      female: femaleTeachers,
      total: maleTeachers + femaleTeachers
    }
  };
  
  return this.save();
};

module.exports = mongoose.model('Institution', institutionSchema);
