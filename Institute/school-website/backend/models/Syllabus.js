const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  class: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  subject: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    enum: ['First', 'Second', 'Third', 'Annual'],
    default: 'Annual'
  },
  description: {
    en: String,
    bn: String
  },
  objectives: [{
    en: String,
    bn: String
  }],
  chapters: [{
    chapterNumber: Number,
    title: {
      en: { type: String, required: true },
      bn: { type: String, required: true }
    },
    description: {
      en: String,
      bn: String
    },
    topics: [{
      topicNumber: Number,
      title: {
        en: String,
        bn: String
      },
      description: {
        en: String,
        bn: String
      },
      learningOutcomes: [{
        en: String,
        bn: String
      }],
      duration: String, // e.g., "2 weeks", "5 classes"
      resources: [{
        type: {
          type: String,
          enum: ['book', 'video', 'website', 'document', 'other']
        },
        title: {
          en: String,
          bn: String
        },
        url: String,
        description: {
          en: String,
          bn: String
        }
      }]
    }],
    duration: String,
    assessments: [{
      type: {
        type: String,
        enum: ['quiz', 'assignment', 'project', 'presentation', 'exam']
      },
      title: {
        en: String,
        bn: String
      },
      marks: Number,
      duration: String
    }]
  }],
  textbooks: [{
    title: {
      en: String,
      bn: String
    },
    author: {
      en: String,
      bn: String
    },
    publisher: {
      en: String,
      bn: String
    },
    edition: String,
    isbn: String,
    type: {
      type: String,
      enum: ['primary', 'reference', 'supplementary'],
      default: 'primary'
    }
  }],
  assessmentCriteria: {
    continuousAssessment: Number, // percentage
    midtermExam: Number,
    finalExam: Number,
    practicalWork: Number,
    projectWork: Number,
    classParticipation: Number
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
  prerequisites: [{
    subject: {
      en: String,
      bn: String
    },
    class: {
      en: String,
      bn: String
    }
  }],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  department: {
    en: String,
    bn: String
  },
  creditHours: Number,
  totalClasses: Number,
  weeklyClasses: Number,
  practicalHours: Number,
  fieldWorkHours: Number,
  attachments: [{
    type: {
      type: String,
      enum: ['pdf', 'doc', 'ppt', 'video', 'other']
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
  status: {
    type: String,
    enum: ['draft', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  effectiveDate: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  version: {
    type: String,
    default: '1.0'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
syllabusSchema.index({ 'class.en': 1, 'subject.en': 1, academicYear: 1 });
syllabusSchema.index({ status: 1 });
syllabusSchema.index({ teacher: 1 });
syllabusSchema.index({ effectiveDate: 1 });

// Virtual for total duration
syllabusSchema.virtual('totalDuration').get(function() {
  return this.chapters.reduce((total, chapter) => {
    const chapterDuration = parseInt(chapter.duration) || 0;
    return total + chapterDuration;
  }, 0);
});

// Static method to get by class and subject
syllabusSchema.statics.getByClassAndSubject = function(className, subjectName, academicYear) {
  return this.findOne({
    'class.en': className,
    'subject.en': subjectName,
    academicYear: academicYear,
    status: 'published',
    isActive: true
  }).populate('teacher', 'name designation');
};

module.exports = mongoose.model('Syllabus', syllabusSchema);
