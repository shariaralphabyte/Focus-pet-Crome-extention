const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true },
    bn: { type: String, required: true, trim: true }
  },
  class: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  section: {
    type: String,
    required: [true, 'Section is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  semester: {
    type: String,
    enum: ['First', 'Second', 'Third', 'Annual'],
    default: 'Annual'
  },
  type: {
    type: String,
    enum: ['Class', 'Exam', 'Special'],
    required: [true, 'Type is required']
  },
  description: {
    en: String,
    bn: String
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    dayName: {
      en: String,
      bn: String
    },
    periods: [{
      periodNumber: {
        type: Number,
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      subject: {
        en: { type: String, required: true },
        bn: { type: String, required: true }
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
      },
      room: {
        en: String,
        bn: String
      },
      type: {
        type: String,
        enum: ['Regular', 'Lab', 'Library', 'Sports', 'Break', 'Assembly', 'Prayer'],
        default: 'Regular'
      },
      notes: {
        en: String,
        bn: String
      }
    }]
  }],
  examSchedule: [{
    date: {
      type: Date,
      required: function() {
        return this.parent().type === 'Exam';
      }
    },
    subject: {
      en: String,
      bn: String
    },
    startTime: String,
    endTime: String,
    duration: String,
    room: {
      en: String,
      bn: String
    },
    invigilator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    assistantInvigilator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    totalMarks: Number,
    passingMarks: Number,
    examType: {
      type: String,
      enum: ['Written', 'MCQ', 'Practical', 'Oral', 'Mixed']
    },
    instructions: [{
      en: String,
      bn: String
    }],
    materials: [{
      en: String,
      bn: String
    }]
  }],
  breaks: [{
    name: {
      en: String,
      bn: String
    },
    startTime: String,
    endTime: String,
    duration: String,
    type: {
      type: String,
      enum: ['Short Break', 'Lunch Break', 'Prayer Break', 'Assembly']
    }
  }],
  specialEvents: [{
    date: Date,
    event: {
      en: String,
      bn: String
    },
    description: {
      en: String,
      bn: String
    },
    affectedPeriods: [Number],
    replacement: {
      en: String,
      bn: String
    }
  }],
  effectiveFrom: {
    type: Date,
    required: [true, 'Effective from date is required']
  },
  effectiveTo: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'published', 'archived'],
    default: 'draft'
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
  publishedDate: Date,
  notes: {
    en: String,
    bn: String
  },
  attachments: [{
    type: {
      type: String,
      enum: ['pdf', 'image', 'doc', 'excel']
    },
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  version: {
    type: String,
    default: '1.0'
  },
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine'
  }
}, {
  timestamps: true
});

// Indexes for better performance
routineSchema.index({ 'class.en': 1, section: 1, academicYear: 1 });
routineSchema.index({ type: 1 });
routineSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
routineSchema.index({ isActive: 1, status: 1 });
routineSchema.index({ createdBy: 1 });

// Virtual for current status
routineSchema.virtual('isCurrent').get(function() {
  const now = new Date();
  const isAfterStart = now >= this.effectiveFrom;
  const isBeforeEnd = !this.effectiveTo || now <= this.effectiveTo;
  return this.isActive && isAfterStart && isBeforeEnd && this.status === 'published';
});

// Static method to get current routine
routineSchema.statics.getCurrent = function(className, section, academicYear) {
  const now = new Date();
  return this.findOne({
    'class.en': className,
    section: section,
    academicYear: academicYear,
    status: 'published',
    isActive: true,
    effectiveFrom: { $lte: now },
    $or: [
      { effectiveTo: { $exists: false } },
      { effectiveTo: { $gte: now } }
    ]
  }).populate('schedule.periods.teacher', 'name designation')
    .populate('examSchedule.invigilator', 'name designation')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name');
};

module.exports = mongoose.model('Routine', routineSchema);
