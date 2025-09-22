const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminData = {
        name: process.env.ADMIN_NAME || 'System Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@school.edu',
        password: process.env.ADMIN_PASSWORD || 'admin123456',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        preferences: {
          language: 'en',
          theme: 'light'
        }
      };

      const admin = await User.create(adminData);
      console.log('✅ Default admin user created:', admin.email);
      console.log('🔑 Default password:', process.env.ADMIN_PASSWORD || 'admin123456');
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

module.exports = createDefaultAdmin;
