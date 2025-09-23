const Teacher = require('../models/Teacher');

// Ensures req.body.teacherId is populated. If empty string or missing, generate next ID.
module.exports = async function ensureTeacherId(req, res, next) {
  try {
    const val = req.body?.teacherId;
    if (!val || (typeof val === 'string' && val.trim() === '')) {
      const year = new Date().getFullYear().toString().slice(-2);
      const count = await Teacher.countDocuments();
      req.body.teacherId = `TCH${year}${String(count + 1).padStart(4, '0')}`;
    }
  } catch (e) {
    console.error('ensureTeacherId error:', e);
  } finally {
    next();
  }
}
