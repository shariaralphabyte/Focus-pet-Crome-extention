const InstitutionSettings = require('../models/InstitutionSettings');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const cloudinary = require('../config/cloudinary');
const { validationResult } = require('express-validator');

// @desc    Get institution settings
// @route   GET /api/institution/settings
// @access  Public
exports.getInstitutionSettings = async (req, res) => {
  try {
    const settings = await InstitutionSettings.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching institution settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching institution settings'
    });
  }
};

// @desc    Update institution settings
// @route   PUT /api/institution/settings
// @access  Private (Admin only)
exports.updateInstitutionSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let settings = await InstitutionSettings.getSettings();
    
    const {
      institutionName,
      establishmentYear,
      founder,
      location,
      vision,
      mission,
      about,
      contactInfo,
      academicInfo,
      accreditation,
      facilities,
      socialLinks,
      settings: institutionSettings,
      seo
    } = req.body;

    // Update fields
    if (institutionName) settings.institutionName = institutionName;
    if (establishmentYear) settings.establishmentYear = establishmentYear;
    if (founder) settings.founder = founder;
    if (location) settings.location = location;
    if (vision) settings.vision = vision;
    if (mission) settings.mission = mission;
    if (about) settings.about = about;
    if (contactInfo) settings.contactInfo = contactInfo;
    if (academicInfo) settings.academicInfo = academicInfo;
    if (accreditation) settings.accreditation = accreditation;
    if (facilities) settings.facilities = facilities;
    if (socialLinks) settings.socialLinks = socialLinks;
    if (institutionSettings) settings.settings = institutionSettings;
    if (seo) settings.seo = seo;

    settings.updatedBy = req.user.id;
    await settings.save();

    res.json({
      success: true,
      message: 'Institution settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating institution settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating institution settings'
    });
  }
};

// @desc    Get institution statistics (auto-calculated)
// @route   GET /api/institution/statistics
// @access  Public
exports.getInstitutionStatistics = async (req, res) => {
  try {
    // Get real-time statistics from database
    const [
      totalStudents,
      totalTeachers,
      totalActiveStudents,
      totalActiveTeachers,
      studentsByClass,
      teachersByDepartment
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Student.countDocuments({ isActive: true }),
      Teacher.countDocuments({ isActive: true }),
      Student.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$class', count: { $sum: 1 } } }
      ]),
      Teacher.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ])
    ]);

    // Calculate success rate (you can implement based on your result system)
    const successRate = 95; // Placeholder - implement based on actual results

    // Get institution settings for additional stats
    const settings = await InstitutionSettings.getSettings();

    const statistics = {
      students: {
        total: totalStudents,
        active: totalActiveStudents,
        byClass: studentsByClass.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      teachers: {
        total: totalTeachers,
        active: totalActiveTeachers,
        byDepartment: teachersByDepartment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      institution: {
        establishmentYear: settings.establishmentYear,
        yearsOfExcellence: new Date().getFullYear() - settings.establishmentYear,
        successRate,
        parentRating: settings.statistics.parentRating || 4.9,
        totalAlumni: settings.statistics.totalAlumni || 15000,
        totalBooks: settings.statistics.totalBooks || 12000,
        totalClassrooms: settings.statistics.totalClassrooms || 45,
        totalLabs: settings.statistics.totalLabs || 8
      },
      lastUpdated: new Date()
    };

    // Update statistics in settings
    settings.statistics.totalStudents = totalStudents;
    settings.statistics.totalTeachers = totalTeachers;
    settings.statistics.totalStaff = totalTeachers; // Assuming teachers are staff
    await settings.save();

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching institution statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching institution statistics'
    });
  }
};

// @desc    Upload institution media (logo, images, etc.)
// @route   POST /api/institution/media
// @access  Private (Admin only)
exports.uploadInstitutionMedia = async (req, res) => {
  try {
    const { type } = req.body; // 'logo', 'favicon', 'hero', 'gallery'
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let uploadOptions = {
      folder: `institution/${type}`,
      quality: 'auto'
    };

    // Set specific transformations based on type
    switch (type) {
      case 'logo':
        uploadOptions.transformation = [
          { width: 200, height: 100, crop: 'fit' },
          { quality: 'auto', format: 'png' }
        ];
        break;
      case 'favicon':
        uploadOptions.transformation = [
          { width: 32, height: 32, crop: 'fill' },
          { quality: 'auto', format: 'ico' }
        ];
        break;
      case 'hero':
        uploadOptions.transformation = [
          { width: 1920, height: 1080, crop: 'fill' },
          { quality: 'auto' }
        ];
        break;
      case 'gallery':
        uploadOptions.transformation = [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto' }
        ];
        break;
    }

    const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);

    const mediaData = {
      public_id: result.public_id,
      url: result.secure_url
    };

    // Update institution settings with new media
    const settings = await InstitutionSettings.getSettings();
    
    if (type === 'logo') {
      // Delete old logo if exists
      if (settings.media.logo && settings.media.logo.public_id) {
        await cloudinary.uploader.destroy(settings.media.logo.public_id);
      }
      settings.media.logo = mediaData;
    } else if (type === 'favicon') {
      // Delete old favicon if exists
      if (settings.media.favicon && settings.media.favicon.public_id) {
        await cloudinary.uploader.destroy(settings.media.favicon.public_id);
      }
      settings.media.favicon = mediaData;
    } else if (type === 'hero') {
      const { title, description } = req.body;
      settings.media.heroImages.push({
        ...mediaData,
        title,
        description
      });
    } else if (type === 'gallery') {
      const { title, category } = req.body;
      settings.media.galleryImages.push({
        ...mediaData,
        title,
        category
      });
    }

    settings.updatedBy = req.user.id;
    await settings.save();

    res.json({
      success: true,
      message: `${type} uploaded successfully`,
      data: mediaData
    });
  } catch (error) {
    console.error('Error uploading institution media:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading media'
    });
  }
};

// @desc    Delete institution media
// @route   DELETE /api/institution/media/:type/:id
// @access  Private (Admin only)
exports.deleteInstitutionMedia = async (req, res) => {
  try {
    const { type, id } = req.params;
    
    const settings = await InstitutionSettings.getSettings();
    
    if (type === 'hero') {
      const heroImage = settings.media.heroImages.id(id);
      if (heroImage) {
        await cloudinary.uploader.destroy(heroImage.public_id);
        settings.media.heroImages.pull(id);
      }
    } else if (type === 'gallery') {
      const galleryImage = settings.media.galleryImages.id(id);
      if (galleryImage) {
        await cloudinary.uploader.destroy(galleryImage.public_id);
        settings.media.galleryImages.pull(id);
      }
    }

    settings.updatedBy = req.user.id;
    await settings.save();

    res.json({
      success: true,
      message: `${type} image deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting institution media:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting media'
    });
  }
};

// @desc    Get institution dashboard data
// @route   GET /api/institution/dashboard
// @access  Private (Admin only)
exports.getInstitutionDashboard = async (req, res) => {
  try {
    const [statistics, settings, recentActivity] = await Promise.all([
      // Get statistics
      this.getInstitutionStatistics(req, res),
      // Get settings
      InstitutionSettings.getSettings(),
      // Get recent activity (you can implement based on your needs)
      Promise.resolve([])
    ]);

    res.json({
      success: true,
      data: {
        statistics: statistics.data,
        settings,
        recentActivity,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching institution dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching institution dashboard'
    });
  }
};
