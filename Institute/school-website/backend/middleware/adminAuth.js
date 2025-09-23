const adminAuth = (req, res, next) => {
  try {
    // Check if user exists and is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No user found.' 
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in admin authentication' 
    });
  }
};

module.exports = adminAuth;
