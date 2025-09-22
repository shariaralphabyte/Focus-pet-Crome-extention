import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { format, parseISO } from 'date-fns';
import { enGB, bn } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
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
  FiAlertCircle,
  FiSearch,
  FiUser,
  FiClock,
  FiPaperclip,
  FiFilter
} from 'react-icons/fi';
import { 
  fetchNotices,
  createNotice,
  updateNotice,
  deleteNotice 
} from '../../store/slices/noticeSlice';
import LoadingSpinner from '../common/LoadingSpinner';

// Register locales
registerLocale('en', enGB);
registerLocale('bn', bn);

// Helper function to convert English digits to Bengali
const toBengaliNumber = (num) => {
  if (typeof num !== 'string') num = String(num);
  const numbers = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '-': '-', '/': '/', ':': ':', ' ': ' '
  };
  return num.split('').map(char => numbers[char] || char).join('');
};

// Helper function to convert Bengali digits to English
const toEnglishNumber = (num) => {
  if (typeof num !== 'string') num = String(num);
  const numbers = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    '-': '-', '/': '/', ':': ':', ' ': ' '
  };
  return num.split('').map(char => numbers[char] || char).join('');
};

// Format date for display based on language
const formatDateForDisplay = (dateString, language) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const formatted = `${year}-${month}-${day}`;
  return language === 'bn' ? toBengaliNumber(formatted) : formatted;
};

// Parse date from input based on language
const parseDateInput = (dateString, language) => {
  if (!dateString) return '';
  
  // Convert Bengali numbers to English if needed
  const englishDateString = language === 'bn' ? toEnglishNumber(dateString) : dateString;
  
  // Parse the date
  const date = new Date(englishDateString);
  if (isNaN(date.getTime())) return '';
  
  // Format as YYYY-MM-DD for the date input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const NoticeManager = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { notices, loading, error, pagination } = useSelector((state) => state.notices);
  const currentLang = i18n.language;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [publishDateInput, setPublishDateInput] = useState('');
  const [expiryDateInput, setExpiryDateInput] = useState('');
  const [formData, setFormData] = useState({
    title: { en: '', bn: '' },
    content: { en: '', bn: '' },
    excerpt: { en: '', bn: '' },
    category: 'General',
    priority: 'Medium',
    targetAudience: ['All'],
    publishDate: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    attachment: null,
    isPublished: true,
    isPinned: false,
    isActive: true
  });

  const categories = [
    'General', 'Academic', 'Examination', 'Admission', 'Holiday',
    'Event', 'Sports', 'Cultural', 'Emergency', 'Fee', 'Result',
    'Meeting', 'Training', 'Workshop', 'Announcement', 'Circular'
  ];

    const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  
  const audienceOptions = ['All', 'Students', 'Teachers', 'Parents', 'Staff', 'Management', 'Alumni'];

  const noticeTypes = [
    { value: 'general', label: currentLang === 'bn' ? 'সাধারণ' : 'General' },
    { value: 'academic', label: currentLang === 'bn' ? 'শিক্ষাগত' : 'Academic' },
    { value: 'exam', label: currentLang === 'bn' ? 'পরীক্ষা' : 'Examination' },
    { value: 'admission', label: currentLang === 'bn' ? 'ভর্তি' : 'Admission' },
    { value: 'holiday', label: currentLang === 'bn' ? 'ছুটি' : 'Holiday' },
    { value: 'event', label: currentLang === 'bn' ? 'অনুষ্ঠান' : 'Event' },
    { value: 'urgent', label: currentLang === 'bn' ? 'জরুরি' : 'Urgent' },
  ];

  const priorityLevels = [
    { value: 'low', label: currentLang === 'bn' ? 'কম' : 'Low', color: 'text-green-500' },
    { value: 'medium', label: currentLang === 'bn' ? 'মধ্যম' : 'Medium', color: 'text-yellow-500' },
    { value: 'high', label: currentLang === 'bn' ? 'উচ্চ' : 'High', color: 'text-orange-500' },
    { value: 'urgent', label: currentLang === 'bn' ? 'জরুরি' : 'Urgent', color: 'text-red-500' },
  ];

  useEffect(() => {
    dispatch(fetchNotices());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title?.en || !formData.title?.bn) {
      alert(currentLang === 'bn' ? 'দয়া করে ইংরেজি এবং বাংলা উভয় শিরোনাম লিখুন' : 'Please provide both English and Bengali titles');
      return;
    }
    
    if (!formData.content?.en || !formData.content?.bn) {
      alert(currentLang === 'bn' ? 'দয়া করে ইংরেজি এবং বাংলা উভয় বিবরণ লিখুন' : 'Please provide both English and Bengali content');
      return;
    }
    
    // Format the notice data
    const noticeData = {
      title: {
        en: formData.title.en.trim(),
        bn: formData.title.bn.trim()
      },
      content: {
        en: formData.content.en.trim(),
        bn: formData.content.bn.trim()
      },
      type: formData.type,
      priority: formData.priority,
      isUrgent: formData.isUrgent,
      publishDate: formData.publishDate.toISOString(),
      expiryDate: formData.expiryDate.toISOString(),
      targetAudience: ['All'],
      isPublished: true,
      isPinned: false,
      isActive: true
    };

    try {
      if (editingNotice) {
        await dispatch(updateNotice({ id: editingNotice._id, noticeData }));
      } else {
        await dispatch(createNotice(noticeData));
      }
      
      setShowModal(false);
      resetForm();
      dispatch(fetchNotices());
    } catch (error) {
      console.error('Error saving notice:', error);
      alert(currentLang === 'bn' 
        ? 'নোটিশ সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' 
        : 'Error saving notice. Please try again.');
    }
  };

  const handleDelete = async (noticeId) => {
    if (window.confirm(currentLang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      try {
        await dispatch(deleteNotice(noticeId));
        dispatch(fetchNotices());
      } catch (error) {
        console.error('Error deleting notice:', error);
      }
    }
  };

  const handleDateChange = (date, field) => {
    if (!date) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const resetForm = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(today);
    const nextMonthStr = formatDate(nextMonth);

    setFormData({
      title: { en: '', bn: '' },
      content: { en: '', bn: '' },
      type: 'general',
      priority: 'medium',
      isUrgent: false,
      publishDate: todayStr,
      expiryDate: nextMonthStr,
      attachment: null,
      isActive: true
    });
    
    setPublishDateInput(formatDateForDisplay(todayStr, currentLang));
    setExpiryDateInput(formatDateForDisplay(nextMonthStr, currentLang));
    setEditingNotice(null);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title || { en: '', bn: '' },
      content: notice.content || { en: '', bn: '' },
      type: notice.type || 'general',
      priority: notice.priority || 'medium',
      isUrgent: notice.isUrgent || false,
      publishDate: notice.publishDate ? notice.publishDate.split('T')[0] : '',
      expiryDate: notice.expiryDate ? notice.expiryDate.split('T')[0] : '',
      attachment: null,
      isActive: notice.isActive !== false
    });
    setShowModal(true);
  };

  const filteredNotices = notices?.filter(notice => {
    const matchesSearch = searchTerm === '' || 
      notice.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.title?.bn?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || notice.type === selectedType;
    
    return matchesSearch && matchesType;
  }) || [];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : 'en-US');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentLang === 'bn' ? 'নোটিশ ব্যবস্থাপনা' : 'Notice Management'}
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          {currentLang === 'bn' ? 'নতুন নোটিশ' : 'New Notice'}
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
                placeholder={currentLang === 'bn' ? 'নোটিশ অনুসন্ধান...' : 'Search notices...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-input"
            >
              <option value="all">
                {currentLang === 'bn' ? 'সব ধরনের' : 'All Types'}
              </option>
              {noticeTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice, index) => (
            <motion.div
              key={notice._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notice.title?.[currentLang] || notice.title?.en}
                    </h3>
                    {notice.isUrgent && (
                      <span className="badge bg-red-100 text-red-800 flex items-center">
                        <FiAlertCircle className="w-3 h-3 mr-1" />
                        {currentLang === 'bn' ? 'জরুরি' : 'Urgent'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {notice.content?.[currentLang] || notice.content?.en}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <FiFileText className="w-4 h-4 mr-1" />
                      {noticeTypes.find(t => t.value === notice.type)?.label || notice.type}
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      {formatDate(notice.publishDate)}
                    </div>
                    {notice.attachment && (
                      <div className="flex items-center">
                        <FiPaperclip className="w-4 h-4 mr-1" />
                        {currentLang === 'bn' ? 'সংযুক্তি' : 'Attachment'}
                      </div>
                    )}
                    <div className={`flex items-center ${
                      priorityLevels.find(p => p.value === notice.priority)?.color || 'text-gray-500'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                      {priorityLevels.find(p => p.value === notice.priority)?.label || notice.priority}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`badge ${
                    notice.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {notice.isActive 
                      ? (currentLang === 'bn' ? 'সক্রিয়' : 'Active')
                      : (currentLang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')
                    }
                  </span>
                  <button
                    onClick={() => openEditModal(notice)}
                    className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredNotices.length === 0 && !loading && (
        <div className="text-center py-12">
          <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {currentLang === 'bn' ? 'কোন নোটিশ পাওয়া যায়নি' : 'No notices found'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingNotice 
                    ? (currentLang === 'bn' ? 'নোটিশ সম্পাদনা' : 'Edit Notice')
                    : (currentLang === 'bn' ? 'নতুন নোটিশ' : 'New Notice')
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

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="form-input h-32"
                      rows="5"
                      required
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
                      className="form-input h-32"
                      rows="5"
                      required
                    />
                  </div>
                </div>

                {/* Type, Priority, and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'ধরন' : 'Type'}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="form-input"
                      required
                    >
                      {noticeTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'অগ্রাধিকার' : 'Priority'}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-input"
                    >
                      {priorityLevels.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'প্রকাশের তারিখ' : 'Publish Date'}
                    </label>
                    <DatePicker
                      selected={formData.publishDate}
                      onChange={(date) => handleDateChange(date, 'publishDate')}
                      className="form-input w-full"
                      dateFormat="Pp"
                      showTimeSelect
                      timeFormat="p"
                      timeIntervals={15}
                      locale={currentLang === 'bn' ? 'bn' : 'en'}
                      placeholderText={currentLang === 'bn' ? 'তারিখ নির্বাচন করুন' : 'Select date'}
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'মেয়াদ শেষ' : 'Expiry Date'}
                    </label>
                    <DatePicker
                      selected={formData.expiryDate}
                      onChange={(date) => handleDateChange(date, 'expiryDate')}
                      className="form-input w-full"
                      dateFormat="Pp"
                      showTimeSelect
                      timeFormat="p"
                      timeIntervals={15}
                      minDate={formData.publishDate}
                      locale={currentLang === 'bn' ? 'bn' : 'en'}
                      placeholderText={currentLang === 'bn' ? 'মেয়াদ শেষের তারিখ' : 'Select expiry date'}
                    />
                  </div>
                </div>

                {/* Attachment and Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'সংযুক্তি' : 'Attachment'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({ ...formData, attachment: e.target.files[0] })}
                      className="form-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {currentLang === 'bn' ? 'PDF, DOC, DOCX, JPG, PNG ফাইল সমর্থিত' : 'Supports PDF, DOC, DOCX, JPG, PNG files'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-6 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isUrgent}
                        onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                        className="form-checkbox"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {currentLang === 'bn' ? 'জরুরি নোটিশ' : 'Urgent Notice'}
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="form-checkbox"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {currentLang === 'bn' ? 'সক্রিয়' : 'Active'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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

export default NoticeManager;
