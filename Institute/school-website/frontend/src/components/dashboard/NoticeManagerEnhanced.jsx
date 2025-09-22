import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSave,
  FiX,
  FiFileText,
  FiCalendar,
  FiEye,
  FiDownload,
  FiPaperclip,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiUpload,
  FiStar
} from 'react-icons/fi';

import { 
  fetchNotices,
  createNotice,
  updateNotice,
  deleteNotice
} from '../../store/slices/noticeSlice';

import LoadingSpinner from '../common/LoadingSpinner';

const NoticeManagerEnhanced = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const { notices, loading, pagination } = useSelector(state => state.notices);
  
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: { en: '', bn: '' },
    content: { en: '', bn: '' },
    excerpt: { en: '', bn: '' },
    category: 'General',
    priority: 'Medium',
    targetAudience: ['All'],
    publishDate: new Date().toISOString().slice(0, 16),
    expiryDate: '',
    attachments: [],
    isPublished: true,
    isPinned: false,
    isActive: true
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const categories = [
    'General', 'Academic', 'Examination', 'Admission', 'Holiday',
    'Event', 'Sports', 'Cultural', 'Emergency', 'Fee', 'Result',
    'Meeting', 'Training', 'Workshop', 'Announcement', 'Circular'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  
  const audienceOptions = ['All', 'Students', 'Teachers', 'Parents', 'Staff', 'Management', 'Alumni'];

  useEffect(() => {
    dispatch(fetchNotices());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      title: { en: '', bn: '' },
      content: { en: '', bn: '' },
      excerpt: { en: '', bn: '' },
      category: 'General',
      priority: 'Medium',
      targetAudience: ['All'],
      publishDate: new Date().toISOString().slice(0, 16),
      expiryDate: '',
      attachments: [],
      isPublished: true,
      isPinned: false,
      isActive: true
    });
    setSelectedFiles([]);
    setEditingNotice(null);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title || { en: '', bn: '' },
      content: notice.content || { en: '', bn: '' },
      excerpt: notice.excerpt || { en: '', bn: '' },
      category: notice.category || 'General',
      priority: notice.priority || 'Medium',
      targetAudience: notice.targetAudience || ['All'],
      publishDate: notice.publishDate ? new Date(notice.publishDate).toISOString().slice(0, 16) : '',
      expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().slice(0, 16) : '',
      attachments: notice.attachments || [],
      isPublished: notice.isPublished !== undefined ? notice.isPublished : true,
      isPinned: notice.isPinned || false,
      isActive: notice.isActive !== undefined ? notice.isActive : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await dispatch(deleteNotice(id)).unwrap();
        toast.success('Notice deleted successfully');
      } catch (error) {
        toast.error('Failed to delete notice');
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.en.trim() || !formData.content.en.trim()) {
      toast.error('Please fill in required fields (English title and content)');
      return;
    }

    try {
      const submitData = {
        ...formData,
        publishDate: formData.publishDate || new Date().toISOString(),
        expiryDate: formData.expiryDate || null
      };

      if (editingNotice) {
        await dispatch(updateNotice({ 
          id: editingNotice._id, 
          noticeData: submitData 
        })).unwrap();
        toast.success('Notice updated successfully');
      } else {
        await dispatch(createNotice(submitData)).unwrap();
        toast.success('Notice created successfully');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(editingNotice ? 'Failed to update notice' : 'Failed to create notice');
    }
  };

  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAudienceChange = (audience) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter(a => a !== audience)
        : [...prev.targetAudience, audience]
    }));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-gray-100 text-gray-800',
      'Medium': 'bg-blue-100 text-blue-800',
      'High': 'bg-yellow-100 text-yellow-800',
      'Urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors['Medium'];
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.title?.bn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notice Management
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Notice
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notices..."
                className="form-input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notices List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotices.map((notice) => (
                  <tr key={notice._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {notice.isPinned && (
                          <FiStar className="w-4 h-4 text-yellow-500 mr-2 fill-current" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {notice.title?.[currentLang] || notice.title?.en}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {notice.noticeNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-primary">
                        {notice.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${notice.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {notice.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(notice.publishDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingNotice ? 'Edit Notice' : 'Create New Notice'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-6">
                {/* Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.title.en}
                      onChange={(e) => handleInputChange('title', e.target.value, 'en')}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title (Bengali)
                    </label>
                    <input
                      type="text"
                      value={formData.title.bn}
                      onChange={(e) => handleInputChange('title', e.target.value, 'bn')}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content (English) *
                    </label>
                    <textarea
                      value={formData.content.en}
                      onChange={(e) => handleInputChange('content', e.target.value, 'en')}
                      rows={6}
                      className="form-textarea"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content (Bengali)
                    </label>
                    <textarea
                      value={formData.content.bn}
                      onChange={(e) => handleInputChange('content', e.target.value, 'bn')}
                      rows={6}
                      className="form-textarea"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Excerpt (English)
                    </label>
                    <textarea
                      value={formData.excerpt.en}
                      onChange={(e) => handleInputChange('excerpt', e.target.value, 'en')}
                      rows={2}
                      className="form-textarea"
                      placeholder="Brief summary..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Excerpt (Bengali)
                    </label>
                    <textarea
                      value={formData.excerpt.bn}
                      onChange={(e) => handleInputChange('excerpt', e.target.value, 'bn')}
                      rows={2}
                      className="form-textarea"
                      placeholder="সংক্ষিপ্ত বিবরণ..."
                    />
                  </div>
                </div>

                {/* Category, Priority, Dates */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="form-select"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="form-select"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishDate}
                      onChange={(e) => handleInputChange('publishDate', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {audienceOptions.map(audience => (
                      <label key={audience} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.targetAudience.includes(audience)}
                          onChange={() => handleAudienceChange(audience)}
                          className="form-checkbox mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {audience}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attachments
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload files (PDF, DOC, Images)
                      </span>
                    </label>
                    
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                      className="form-checkbox mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Publish immediately
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => handleInputChange('isPinned', e.target.checked)}
                      className="form-checkbox mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Pin to top
                    </span>
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {editingNotice ? 'Update' : 'Create'} Notice
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NoticeManagerEnhanced;
