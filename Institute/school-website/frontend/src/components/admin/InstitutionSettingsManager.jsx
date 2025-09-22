import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiSave,
  FiRefreshCw,
  FiUpload,
  FiImage,
  FiSettings,
  FiBarChart,
  FiInfo,
  FiGlobe,
  FiPhone,
  FiMail,
  FiMapPin
} from 'react-icons/fi';

import {
  fetchInstitutionSettings,
  fetchInstitutionStatistics,
  updateInstitutionSettings,
  uploadInstitutionMedia
} from '../../store/slices/institutionSlice';

const InstitutionSettingsManager = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const { settings, statistics, loading, error } = useSelector(state => state.institution);

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    institutionName: { en: '', bn: '' },
    establishmentYear: '',
    founder: { en: '', bn: '' },
    location: { en: '', bn: '' },
    vision: { en: '', bn: '' },
    mission: { en: '', bn: '' },
    about: { en: '', bn: '' },
    contactInfo: {
      address: { en: '', bn: '' },
      phone: [''],
      email: [''],
      website: '',
      fax: ''
    },
    academicInfo: {
      totalClasses: 0,
      totalSections: 0,
      academicYear: '',
      sessionStart: '',
      sessionEnd: ''
    },
    statistics: {
      totalAlumni: 0,
      successRate: 0,
      parentRating: 0,
      totalBooks: 0,
      totalClassrooms: 0,
      totalLabs: 0
    },
    socialLinks: {
      facebook: '',
      youtube: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  useEffect(() => {
    dispatch(fetchInstitutionSettings());
    dispatch(fetchInstitutionStatistics());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        institutionName: settings.institutionName || { en: '', bn: '' },
        establishmentYear: settings.establishmentYear || '',
        founder: settings.founder || { en: '', bn: '' },
        location: settings.location || { en: '', bn: '' },
        vision: settings.vision || { en: '', bn: '' },
        mission: settings.mission || { en: '', bn: '' },
        about: settings.about || { en: '', bn: '' },
        contactInfo: settings.contactInfo || {
          address: { en: '', bn: '' },
          phone: [''],
          email: [''],
          website: '',
          fax: ''
        },
        academicInfo: settings.academicInfo || {
          totalClasses: 0,
          totalSections: 0,
          academicYear: '',
          sessionStart: '',
          sessionEnd: ''
        },
        statistics: settings.statistics || {
          totalAlumni: 0,
          successRate: 0,
          parentRating: 0,
          totalBooks: 0,
          totalClassrooms: 0,
          totalLabs: 0
        },
        socialLinks: settings.socialLinks || {
          facebook: '',
          youtube: '',
          twitter: '',
          instagram: '',
          linkedin: ''
        }
      });
    }
  }, [settings]);

  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else if (field.includes('.')) {
      const [parent, child, subChild] = field.split('.');
      if (subChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: prev[parent][child].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addArrayItem = (field) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: [...prev[parent][child], '']
      }
    }));
  };

  const removeArrayItem = (field, index) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: prev[parent][child].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateInstitutionSettings(formData)).unwrap();
      toast.success(currentLang === 'bn' ? 'সেটিংস সফলভাবে আপডেট হয়েছে' : 'Settings updated successfully');
    } catch (error) {
      toast.error(error || 'Failed to update settings');
    }
  };

  const handleMediaUpload = async (type, file, additionalData = {}) => {
    try {
      await dispatch(uploadInstitutionMedia({ type, file, additionalData })).unwrap();
      toast.success(currentLang === 'bn' ? 'মিডিয়া আপলোড সফল' : 'Media uploaded successfully');
      dispatch(fetchInstitutionSettings()); // Refresh settings
    } catch (error) {
      toast.error(error || 'Failed to upload media');
    }
  };

  const tabs = [
    { id: 'basic', label: currentLang === 'bn' ? 'মৌলিক তথ্য' : 'Basic Info', icon: FiInfo },
    { id: 'vision-mission', label: currentLang === 'bn' ? 'দৃষ্টিভঙ্গি ও লক্ষ্য' : 'Vision & Mission', icon: FiGlobe },
    { id: 'contact', label: currentLang === 'bn' ? 'যোগাযোগ' : 'Contact', icon: FiPhone },
    { id: 'academic', label: currentLang === 'bn' ? 'একাডেমিক' : 'Academic', icon: FiBarChart },
    { id: 'statistics', label: currentLang === 'bn' ? 'পরিসংখ্যান' : 'Statistics', icon: FiBarChart },
    { id: 'media', label: currentLang === 'bn' ? 'মিডিয়া' : 'Media', icon: FiImage },
    { id: 'social', label: currentLang === 'bn' ? 'সামাজিক লিংক' : 'Social Links', icon: FiSettings }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {currentLang === 'bn' ? 'প্রতিষ্ঠান সেটিংস' : 'Institution Settings'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {currentLang === 'bn' 
            ? 'প্রতিষ্ঠানের সকল তথ্য এবং সেটিংস পরিচালনা করুন'
            : 'Manage all institution information and settings'
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'প্রতিষ্ঠানের নাম (ইংরেজি)' : 'Institution Name (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.institutionName.en}
                  onChange={(e) => handleInputChange('institutionName', e.target.value, 'en')}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'প্রতিষ্ঠানের নাম (বাংলা)' : 'Institution Name (Bengali)'} *
                </label>
                <input
                  type="text"
                  value={formData.institutionName.bn}
                  onChange={(e) => handleInputChange('institutionName', e.target.value, 'bn')}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'প্রতিষ্ঠার বছর' : 'Establishment Year'} *
                </label>
                <input
                  type="number"
                  value={formData.establishmentYear}
                  onChange={(e) => handleInputChange('establishmentYear', parseInt(e.target.value))}
                  className="input-field"
                  min="1800"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'প্রতিষ্ঠাতা (ইংরেজি)' : 'Founder (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.founder.en}
                  onChange={(e) => handleInputChange('founder', e.target.value, 'en')}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'প্রতিষ্ঠাতা (বাংলা)' : 'Founder (Bengali)'} *
                </label>
                <input
                  type="text"
                  value={formData.founder.bn}
                  onChange={(e) => handleInputChange('founder', e.target.value, 'bn')}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'অবস্থান (ইংরেজি)' : 'Location (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.location.en}
                  onChange={(e) => handleInputChange('location', e.target.value, 'en')}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentLang === 'bn' ? 'অবস্থান (বাংলা)' : 'Location (Bengali)'} *
              </label>
              <input
                type="text"
                value={formData.location.bn}
                onChange={(e) => handleInputChange('location', e.target.value, 'bn')}
                className="input-field"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'সম্পর্কে (ইংরেজি)' : 'About (English)'} *
                </label>
                <textarea
                  value={formData.about.en}
                  onChange={(e) => handleInputChange('about', e.target.value, 'en')}
                  className="input-field"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'সম্পর্কে (বাংলা)' : 'About (Bengali)'} *
                </label>
                <textarea
                  value={formData.about.bn}
                  onChange={(e) => handleInputChange('about', e.target.value, 'bn')}
                  className="input-field"
                  rows={4}
                  required
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Vision & Mission Tab */}
        {activeTab === 'vision-mission' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'দৃষ্টিভঙ্গি (ইংরেজি)' : 'Vision (English)'} *
                </label>
                <textarea
                  value={formData.vision.en}
                  onChange={(e) => handleInputChange('vision', e.target.value, 'en')}
                  className="input-field"
                  rows={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'দৃষ্টিভঙ্গি (বাংলা)' : 'Vision (Bengali)'} *
                </label>
                <textarea
                  value={formData.vision.bn}
                  onChange={(e) => handleInputChange('vision', e.target.value, 'bn')}
                  className="input-field"
                  rows={6}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'লক্ষ্য (ইংরেজি)' : 'Mission (English)'} *
                </label>
                <textarea
                  value={formData.mission.en}
                  onChange={(e) => handleInputChange('mission', e.target.value, 'en')}
                  className="input-field"
                  rows={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'লক্ষ্য (বাংলা)' : 'Mission (Bengali)'} *
                </label>
                <textarea
                  value={formData.mission.bn}
                  onChange={(e) => handleInputChange('mission', e.target.value, 'bn')}
                  className="input-field"
                  rows={6}
                  required
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
              <p className="text-blue-800 dark:text-blue-200">
                {currentLang === 'bn' 
                  ? 'কিছু পরিসংখ্যান স্বয়ংক্রিয়ভাবে গণনা করা হয়। আপনি ম্যানুয়ালি মান সেট করতে পারেন।'
                  : 'Some statistics are calculated automatically. You can set manual values here.'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'মোট স্নাতক' : 'Total Alumni'}
                </label>
                <input
                  type="number"
                  value={formData.statistics.totalAlumni}
                  onChange={(e) => handleInputChange('statistics.totalAlumni', parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'সফলতার হার (%)' : 'Success Rate (%)'}
                </label>
                <input
                  type="number"
                  value={formData.statistics.successRate}
                  onChange={(e) => handleInputChange('statistics.successRate', parseFloat(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'অভিভাবক রেটিং (৫ এর মধ্যে)' : 'Parent Rating (out of 5)'}
                </label>
                <input
                  type="number"
                  value={formData.statistics.parentRating}
                  onChange={(e) => handleInputChange('statistics.parentRating', parseFloat(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'মোট বই' : 'Total Books'}
                </label>
                <input
                  type="number"
                  value={formData.statistics.totalBooks}
                  onChange={(e) => handleInputChange('statistics.totalBooks', parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'মোট শ্রেণীকক্ষ' : 'Total Classrooms'}
                </label>
                <input
                  type="number"
                  value={formData.statistics.totalClassrooms}
                  onChange={(e) => handleInputChange('statistics.totalClassrooms', parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'bn' ? 'মোট ল্যাব' : 'Total Labs'}
                </label>
                <input
                  type="number"
                  value={formData.statistics.totalLabs}
                  onChange={(e) => handleInputChange('statistics.totalLabs', parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>

            {/* Real-time Statistics Display */}
            {statistics && (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {currentLang === 'bn' ? 'বর্তমান পরিসংখ্যান' : 'Current Statistics'}
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{statistics.students?.total || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentLang === 'bn' ? 'মোট শিক্ষার্থী' : 'Total Students'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{statistics.teachers?.total || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentLang === 'bn' ? 'মোট শিক্ষক' : 'Total Teachers'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{statistics.institution?.yearsOfExcellence || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentLang === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years of Excellence'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{statistics.institution?.successRate || 0}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentLang === 'bn' ? 'সফলতার হার' : 'Success Rate'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              dispatch(fetchInstitutionSettings());
              dispatch(fetchInstitutionStatistics());
            }}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            {currentLang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            {currentLang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstitutionSettingsManager;
