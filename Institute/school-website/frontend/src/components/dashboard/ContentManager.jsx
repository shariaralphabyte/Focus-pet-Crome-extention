import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSave,
  FiX,
  FiImage,
  FiEye,
  FiTarget,
  FiSliders
} from 'react-icons/fi';

import { 
  fetchHeroSlides,
  fetchVisionMission,
  createContent,
  updateContent,
  deleteContent
} from '../../store/slices/contentSlice';

import LoadingSpinner from '../common/LoadingSpinner';

const ContentManager = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const { heroSlides, visionMission, loading } = useSelector(state => state.content);
  
  const [activeTab, setActiveTab] = useState('hero');
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    type: 'hero-slide',
    title: { en: '', bn: '' },
    content: { en: '', bn: '' },
    media: null,
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchHeroSlides());
    dispatch(fetchVisionMission());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const contentData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'media') return;
      if (typeof formData[key] === 'object' && formData[key] !== null) {
        contentData.append(key, JSON.stringify(formData[key]));
      } else {
        contentData.append(key, formData[key]);
      }
    });
    
    if (formData.media) {
      contentData.append('media', formData.media);
    }

    try {
      if (editingContent) {
        await dispatch(updateContent({ id: editingContent._id, contentData }));
      } else {
        await dispatch(createContent(contentData));
      }
      
      setShowModal(false);
      resetForm();
      dispatch(fetchHeroSlides());
      dispatch(fetchVisionMission());
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      type: 'hero-slide',
      title: { en: '', bn: '' },
      content: { en: '', bn: '' },
      media: null,
      isActive: true
    });
    setEditingContent(null);
  };

  const openEditModal = (content) => {
    setEditingContent(content);
    setFormData({
      key: content.key || '',
      type: content.type || 'hero-slide',
      title: content.title || { en: '', bn: '' },
      content: content.content || { en: '', bn: '' },
      media: null,
      isActive: content.isActive !== false
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentLang === 'bn' ? 'কন্টেন্ট ব্যবস্থাপনা' : 'Content Management'}
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          {currentLang === 'bn' ? 'নতুন কন্টেন্ট' : 'New Content'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'hero'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <FiSliders className="w-4 h-4 mr-2 inline" />
            {currentLang === 'bn' ? 'হিরো স্লাইড' : 'Hero Slides'}
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'vision'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <FiEye className="w-4 h-4 mr-2 inline" />
            {currentLang === 'bn' ? 'দৃষ্টিভঙ্গি ও লক্ষ্য' : 'Vision & Mission'}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentLang === 'bn' ? 'হিরো স্লাইড সমূহ' : 'Hero Slides'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroSlides?.map((slide, index) => (
                  <div key={slide._id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {slide.title?.[currentLang] || slide.title?.en || `Slide ${index + 1}`}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {slide.content?.[currentLang] || slide.content?.en}
                    </p>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => openEditModal(slide)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vision' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentLang === 'bn' ? 'দৃষ্টিভঙ্গি ও লক্ষ্য' : 'Vision & Mission'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FiEye className="w-5 h-5 text-primary-600 mr-2" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {currentLang === 'bn' ? 'দৃষ্টিভঙ্গি' : 'Vision'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {visionMission?.vision?.content?.[currentLang] || 
                     visionMission?.vision?.content?.en ||
                     (currentLang === 'bn' ? 'দৃষ্টিভঙ্গি এখনো যোগ করা হয়নি' : 'Vision not yet added')
                    }
                  </p>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FiTarget className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {currentLang === 'bn' ? 'লক্ষ্য' : 'Mission'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {visionMission?.mission?.content?.[currentLang] || 
                     visionMission?.mission?.content?.en ||
                     (currentLang === 'bn' ? 'লক্ষ্য এখনো যোগ করা হয়নি' : 'Mission not yet added')
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingContent 
                    ? (currentLang === 'bn' ? 'কন্টেন্ট সম্পাদনা' : 'Edit Content')
                    : (currentLang === 'bn' ? 'নতুন কন্টেন্ট' : 'New Content')
                  }
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.title.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        title: { ...formData.title, en: e.target.value }
                      })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bengali)'}
                    </label>
                    <input
                      type="text"
                      value={formData.title.bn}
                      onChange={(e) => setFormData({
                        ...formData,
                        title: { ...formData.title, bn: e.target.value }
                      })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'বিবরণ (ইংরেজি)' : 'Content (English)'}
                    </label>
                    <textarea
                      value={formData.content.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        content: { ...formData.content, en: e.target.value }
                      })}
                      className="form-input h-24"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'বিবরণ (বাংলা)' : 'Content (Bengali)'}
                    </label>
                    <textarea
                      value={formData.content.bn}
                      onChange={(e) => setFormData({
                        ...formData,
                        content: { ...formData.content, bn: e.target.value }
                      })}
                      className="form-input h-24"
                      rows="3"
                    />
                  </div>
                </div>

                {/* Media */}
                <div>
                  <label className="form-label">
                    {currentLang === 'bn' ? 'মিডিয়া ফাইল' : 'Media File'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, media: e.target.files[0] })}
                    className="form-input"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-ghost"
                  >
                    {currentLang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {currentLang === 'bn' ? 'সংরক্ষণ' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
