const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true, trim: true },
    bn: { type: String, required: true, trim: true }
  },
  level: {
    type: String,
    required: true,
    enum: ['Primary', 'Secondary', 'Higher Secondary', 'Honors', 'Masters']
  },
  grade: {
    type: String,
    required: true // e.g., "1", "2", "JSC", "SSC", "HSC", "BA", "MA"
  },
  sections: [{
    name: { type: String, required: true }, // A, B, C, etc.
    capacity: { type: Number, default: 40 },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }
  }],
  department: {
    en: { type: String, trim: true },
    bn: { type: String, trim: true }
  },
  semester: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
  },
  subjects: [{
    name: {
      en: { type: String, required: true },
      bn: { type: String, required: true }
    },
    code: { type: String, required: true },
    credits: { type: Number, default: 1 },
    type: {
      type: String,
      enum: ['Core', 'Elective', 'Optional'],
      default: 'Core'
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }
  }],
  academicYear: {
    type: String,
    required: true,
    default: () => new Date().getFullYear().toString()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
classSchema.index({ grade: 1, level: 1, academicYear: 1 });
classSchema.index({ 'name.en': 1 });
classSchema.index({ isActive: 1 });

// Virtual for full class name
classSchema.virtual('fullName').get(function() {
  return {
    en: `${this.name.en} - ${this.grade}`,
    bn: `${this.name.bn} - ${this.grade}`
  };
});

// Static method to get active classes
classSchema.statics.getActiveClasses = function() {
  return this.find({ isActive: true })
    .populate('sections.classTeacher', 'name designation')
    .populate('subjects.teacher', 'name designation')
    .sort({ grade: 1, 'name.en': 1 });
};

module.exports = mongoose.model('Class', classSchema);
