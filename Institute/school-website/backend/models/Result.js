const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  examName: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  examType: {
    type: String,
    enum: ['First Term', 'Second Term', 'Third Term', 'Final', 'Half Yearly', 'Annual', 'Test', 'Quiz', 'Assignment'],
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
  academicYear: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  results: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    rollNumber: {
      type: Number,
      required: true
    },
    subjects: [{
      subject: {
        en: { type: String, required: true },
        bn: { type: String, required: true }
      },
      fullMarks: {
        type: Number,
        required: true
      },
      passMarks: {
        type: Number,
        required: true
      },
      obtainedMarks: {
        type: Number,
        required: true
      },
      grade: String,
      gpa: Number,
      isPassed: {
        type: Boolean,
        default: function() {
          return this.obtainedMarks >= this.passMarks;
        }
      },
      remarks: {
        en: String,
        bn: String
      }
    }],
    totalMarks: Number,
    obtainedMarks: Number,
    percentage: Number,
    overallGrade: String,
    overallGPA: Number,
    position: Number,
    isPassed: Boolean,
    attendance: {
      totalDays: Number,
      presentDays: Number,
      percentage: Number
    },
    remarks: {
      en: String,
      bn: String
    },
    teacherComments: [{
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
      },
      subject: {
        en: String,
        bn: String
      },
      comment: {
        en: String,
        bn: String
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      }
    }],
    principalComment: {
      en: String,
      bn: String
    }
  }],
  statistics: {
    totalStudents: Number,
    passedStudents: Number,
    failedStudents: Number,
    passPercentage: Number,
    highestMarks: Number,
    lowestMarks: Number,
    averageMarks: Number,
    gradeDistribution: {
      'A+': Number,
      'A': Number,
      'A-': Number,
      'B': Number,
      'C': Number,
      'D': Number,
      'F': Number
    },
    subjectWiseStats: [{
      subject: {
        en: String,
        bn: String
      },
      totalStudents: Number,
      passedStudents: Number,
      passPercentage: Number,
      highestMarks: Number,
      lowestMarks: Number,
      averageMarks: Number
    }]
  },
  gradingScale: [{
    grade: String,
    minMarks: Number,
    maxMarks: Number,
    gpa: Number,
    description: {
      en: String,
      bn: String
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  notifications: {
    sms: {
      sent: { type: Boolean, default: false },
      sentDate: Date
    },
    email: {
      sent: { type: Boolean, default: false },
      sentDate: Date
    }
  },
  attachments: [{
    type: {
      type: String,
      enum: ['pdf', 'excel', 'image', 'doc']
    },
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    description: {
      en: String,
      bn: String
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
resultSchema.index({ 'class.en': 1, section: 1, academicYear: 1, examType: 1 });
resultSchema.index({ examDate: -1 });
resultSchema.index({ status: 1 });
resultSchema.index({ isPublished: 1 });
resultSchema.index({ 'results.student': 1 });

// Virtual for pass percentage
resultSchema.virtual('passPercentage').get(function() {
  if (!this.statistics || this.statistics.totalStudents === 0) return 0;
  return ((this.statistics.passedStudents / this.statistics.totalStudents) * 100).toFixed(2);
});

// Pre-save middleware to calculate statistics
resultSchema.pre('save', function(next) {
  if (this.isModified('results')) {
    this.calculateStatistics();
  }
  next();
});

// Method to calculate statistics
resultSchema.methods.calculateStatistics = function() {
  const results = this.results;
  const totalStudents = results.length;
  let passedStudents = 0;
  let totalMarks = 0;
  let highestMarks = 0;
  let lowestMarks = Infinity;
  const gradeDistribution = { 'A+': 0, 'A': 0, 'A-': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };

  results.forEach(result => {
    if (result.isPassed) passedStudents++;
    totalMarks += result.obtainedMarks;
    if (result.obtainedMarks > highestMarks) highestMarks = result.obtainedMarks;
    if (result.obtainedMarks < lowestMarks) lowestMarks = result.obtainedMarks;
    if (gradeDistribution[result.overallGrade] !== undefined) {
      gradeDistribution[result.overallGrade]++;
    }
  });

  this.statistics = {
    totalStudents,
    passedStudents,
    failedStudents: totalStudents - passedStudents,
    passPercentage: totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : 0,
    highestMarks,
    lowestMarks: lowestMarks === Infinity ? 0 : lowestMarks,
    averageMarks: totalStudents > 0 ? (totalMarks / totalStudents).toFixed(2) : 0,
    gradeDistribution
  };
};

// Static method to get results by student
resultSchema.statics.getByStudent = function(studentId, academicYear) {
  return this.find({
    'results.student': studentId,
    academicYear: academicYear,
    status: 'published',
    isActive: true
  }).sort({ examDate: -1 })
    .populate('results.student', 'name rollNumber')
    .populate('createdBy', 'name');
};

// Static method to get class results
resultSchema.statics.getByClass = function(className, section, academicYear) {
  return this.find({
    'class.en': className,
    section: section,
    academicYear: academicYear,
    status: 'published',
    isActive: true
  }).sort({ examDate: -1 })
    .populate('results.student', 'name rollNumber')
    .populate('createdBy', 'name');
};

module.exports = mongoose.model('Result', resultSchema);
