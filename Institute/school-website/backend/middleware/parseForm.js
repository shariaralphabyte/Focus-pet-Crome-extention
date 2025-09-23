// Middleware to parse JSON string fields from multipart/form-data before validation
// Ensures express-validator can access nested fields like user.email, designation.en, etc.

module.exports = function parseFormJsonFields(req, res, next) {
  try {
    const parseIfString = (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (_) {
          return val; // not JSON, leave as-is
        }
      }
      return val;
    };

    const setByPath = (obj, path, value) => {
      const parts = path.split('.');
      let curr = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (!curr[key] || typeof curr[key] !== 'object') curr[key] = {};
        curr = curr[key];
      }
      curr[parts[parts.length - 1]] = value;
    };

    if (req.body) {
      // First, parse known JSON string fields
      req.body.user = parseIfString(req.body.user);
      req.body.designation = parseIfString(req.body.designation);
      req.body.personalInfo = parseIfString(req.body.personalInfo);
      req.body.contactInfo = parseIfString(req.body.contactInfo);

      // Then, convert dotted keys like 'user.email' into nested structure
      const keys = Object.keys(req.body);
      for (const key of keys) {
        if (key.includes('.')) {
          setByPath(req.body, key, req.body[key]);
          // Optionally delete the flat dotted key to avoid confusion
          // but only if it doesn't conflict with JSON-parsed object
          if (key in req.body) {
            delete req.body[key];
          }
        }
      }
    }

    next();
  } catch (err) {
    console.error('parseFormJsonFields error:', err);
    next();
  }
}
