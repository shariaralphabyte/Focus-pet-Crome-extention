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
  FiGrid,
  FiFilter,
  FiSearch,
  FiUpload
} from 'react-icons/fi';

import LoadingSpinner from '../common/LoadingSpinner';

const GalleryManager = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [galleryImages, setGalleryImages] = useState([]);
  const [formData, setFormData] = useState({
    title: { en: '', bn: '' },
    description: { en: '', bn: '' },
    category: '',
    tags: [],
    image: null,
    isActive: true
  });

  const categories = [
    { value: 'events', label: currentLang === 'bn' ? 'ইভেন্ট' : 'Events' },
    { value: 'campus', label: currentLang === 'bn' ? 'ক্যাম্পাস' : 'Campus' },
    { value: 'activities', label: currentLang === 'bn' ? 'কার্যক্রম' : 'Activities' },
    { value: 'achievements', label: currentLang === 'bn' ? 'অর্জন' : 'Achievements' },
    { value: 'sports', label: currentLang === 'bn' ? 'খেলাধুলা' : 'Sports' },
    { value: 'cultural', label: currentLang === 'bn' ? 'সাংস্কৃতিক' : 'Cultural' }
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    setGalleryImages([
      {
        _id: '1',
        title: { en: 'Annual Sports Day', bn: 'বার্ষিক ক্রীড়া দিবস' },
        description: { en: 'Students participating in various sports', bn: 'বিভিন্ন খেলায় অংশগ্রহণকারী শিক্ষার্থীরা' },
        category: 'sports',
        image: { url: '/images/gallery/sports-1.jpg' },
        isActive: true,
        createdAt: '2024-01-15'
      },
      {
        _id: '2',
        title: { en: 'Science Fair 2024', bn: 'বিজ্ঞান মেলা ২০২৪' },
        description: { en: 'Students showcasing their science projects', bn: 'শিক্ষার্থীরা তাদের বিজ্ঞান প্রকল্প প্রদর্শন করছে' },
        category: 'events',
        image: { url: '/images/gallery/science-fair.jpg' },
        isActive: true,
        createdAt: '2024-02-10'
      }
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingImage) {
        // Update existing image
        setGalleryImages(prev => prev.map(img => 
          img._id === editingImage._id 
            ? { ...img, ...formData, updatedAt: new Date().toISOString() }
            : img
        ));
      } else {
        // Add new image
        const newImage = {
          _id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setGalleryImages(prev => [newImage, ...prev]);
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (window.confirm(currentLang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setGalleryImages(prev => prev.filter(img => img._id !== imageId));
      } catch (error) {
        console.error('Error deleting image:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: { en: '', bn: '' },
      description: { en: '', bn: '' },
      category: '',
      tags: [],
      image: null,
      isActive: true
    });
    setEditingImage(null);
  };

  const openEditModal = (image) => {
    setEditingImage(image);
    setFormData({
      title: image.title || { en: '', bn: '' },
      description: image.description || { en: '', bn: '' },
      category: image.category || '',
      tags: image.tags || [],
      image: null,
      isActive: image.isActive !== false
    });
    setShowModal(true);
  };

  const filteredImages = galleryImages.filter(image => {
    const matchesSearch = searchTerm === '' || 
      image.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.title.bn.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentLang === 'bn' ? 'গ্যালারি ব্যবস্থাপনা' : 'Gallery Management'}
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          {currentLang === 'bn' ? 'নতুন ছবি' : 'Add Image'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={currentLang === 'bn' ? 'অনুসন্ধান...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="all">
                {currentLang === 'bn' ? 'সব ক্যাটেগরি' : 'All Categories'}
              </option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden group"
            >
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {image.image?.url ? (
                  <img 
                    src={image.image.url} 
                    alt={image.title?.[currentLang] || image.title?.en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiImage className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(image)}
                      className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(image._id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                  {image.title?.[currentLang] || image.title?.en}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {image.description?.[currentLang] || image.description?.en}
                </p>
                <div className="flex justify-between items-center">
                  <span className="badge bg-primary-100 text-primary-800 text-xs">
                    {categories.find(cat => cat.value === image.category)?.label || image.category}
                  </span>
                  <span className={`badge text-xs ${
                    image.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {image.isActive 
                      ? (currentLang === 'bn' ? 'সক্রিয়' : 'Active')
                      : (currentLang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')
                    }
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredImages.length === 0 && !loading && (
        <div className="text-center py-12">
          <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {currentLang === 'bn' ? 'কোন ছবি পাওয়া যায়নি' : 'No images found'}
          </p>
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
                  {editingImage 
                    ? (currentLang === 'bn' ? 'ছবি সম্পাদনা' : 'Edit Image')
                    : (currentLang === 'bn' ? 'নতুন ছবি যোগ' : 'Add New Image')
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
                {/* Image Upload */}
                <div>
                  <label className="form-label">
                    {currentLang === 'bn' ? 'ছবি' : 'Image'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                      className="hidden"
                      id="image-upload"
                      required={!editingImage}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-primary-600 hover:text-primary-700">
                        {currentLang === 'bn' ? 'ছবি নির্বাচন করুন' : 'Choose image'}
                      </span>
                    </label>
                  </div>
                </div>

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
                      required
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
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}
                    </label>
                    <textarea
                      value={formData.description.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, en: e.target.value }
                      })}
                      className="form-input h-20"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bengali)'}
                    </label>
                    <textarea
                      value={formData.description.bn}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, bn: e.target.value }
                      })}
                      className="form-input h-20"
                      rows="3"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="form-label">
                    {currentLang === 'bn' ? 'ক্যাটেগরি' : 'Category'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">
                      {currentLang === 'bn' ? 'ক্যাটেগরি নির্বাচন করুন' : 'Select Category'}
                    </option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4">
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
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <FiSave className="w-4 h-4 mr-2" />
                    )}
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

export default GalleryManager;
