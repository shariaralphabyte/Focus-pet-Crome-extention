const Teacher = require('../models/Teacher');

// For PUT /api/teachers/:id: if some required fields are missing from req.body,
// hydrate them from the existing teacher so controller's updateData doesn't set undefined
module.exports = async function hydrateTeacherUpdate(req, res, next) {
  try {
    const id = req.params.id;
    if (!id) return next();

    const teacher = await Teacher.findById(id).populate('user', 'name email phone');
    if (!teacher) return next();

    // Only fill when field is strictly undefined or empty string
    const fill = (key, value) => {
      if (req.body[key] === undefined || req.body[key] === '') {
        req.body[key] = value;
      }
    };

    // Top-level simple fields
    fill('department', teacher.department);
    fill('joiningDate', teacher.joiningDate ? teacher.joiningDate.toISOString().split('T')[0] : undefined);
    fill('employeeType', teacher.employeeType);
    fill('mpoStatus', teacher.mpoStatus);
    fill('status', teacher.status);
    fill('isActive', teacher.isActive);
    fill('teacherId', teacher.teacherId);

    // Nested: designation
    if (req.body.designation === undefined || req.body.designation === '') {
      req.body.designation = teacher.designation;
    }

    // Nested: personalInfo
    if (req.body.personalInfo === undefined || req.body.personalInfo === '') {
      req.body.personalInfo = teacher.personalInfo || {};
    }

    // Nested: contactInfo
    if (req.body.contactInfo === undefined || req.body.contactInfo === '') {
      req.body.contactInfo = teacher.contactInfo || {};
    }
  } catch (e) {
    console.error('hydrateTeacherUpdate error:', e);
  } finally {
    next();
  }
}
