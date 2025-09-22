import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiCalendar,
  FiMapPin,
  FiTag,
  FiSave,
  FiX,
  FiSearch,
  FiStar
} from 'react-icons/fi';

import { 
  fetchEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  fetchEventCategories 
} from '../../store/slices/eventSlice';

import LoadingSpinner from '../common/LoadingSpinner';

const EventManager = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const { events, categories, loading, error } = useSelector(state => state.events);
  
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: { en: '', bn: '' },
    content: { en: '', bn: '' },
    excerpt: { en: '', bn: '' },
    eventDate: '',
    eventTime: '',
    location: '',
    category: '',
    featured: false,
    featuredImage: null
  });

  useEffect(() => {
    dispatch(fetchEvents({ page: 1, limit: 20 }));
    dispatch(fetchEventCategories());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const eventData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'featuredImage') return;
      if (typeof formData[key] === 'object' && formData[key] !== null) {
        eventData.append(key, JSON.stringify(formData[key]));
      } else {
        eventData.append(key, formData[key]);
      }
    });
    
    if (formData.featuredImage) {
      eventData.append('featuredImage', formData.featuredImage);
    }

    try {
      if (editingEvent) {
        await dispatch(updateEvent({ id: editingEvent._id, eventData }));
      } else {
        await dispatch(createEvent(eventData));
      }
      
      setShowModal(false);
      resetForm();
      dispatch(fetchEvents({ page: 1, limit: 20 }));
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm(currentLang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      try {
        await dispatch(deleteEvent(eventId));
        dispatch(fetchEvents({ page: 1, limit: 20 }));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: { en: '', bn: '' },
      content: { en: '', bn: '' },
      excerpt: { en: '', bn: '' },
      eventDate: '',
      eventTime: '',
      location: '',
      category: '',
      featured: false,
      featuredImage: null
    });
    setEditingEvent(null);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || { en: '', bn: '' },
      content: event.content || { en: '', bn: '' },
      excerpt: event.excerpt || { en: '', bn: '' },
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
      eventTime: event.eventTime || '',
      location: event.location || '',
      category: event.category || '',
      featured: event.featured || false,
      featuredImage: null
    });
    setShowModal(true);
  };

  const filteredEvents = events.filter(event => {
    return searchTerm === '' || 
      (event.title?.en?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.title?.bn?.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentLang === 'bn' ? 'ইভেন্ট ব্যবস্থাপনা' : 'Event Management'}
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          {currentLang === 'bn' ? 'নতুন ইভেন্ট' : 'New Event'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={currentLang === 'bn' ? 'ইভেন্ট খুঁজুন...' : 'Search events...'}
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {currentLang === 'bn' ? 'কোন ইভেন্ট পাওয়া যায়নি' : 'No events found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {currentLang === 'bn' ? 'শিরোনাম' : 'Title'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {currentLang === 'bn' ? 'তারিখ' : 'Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {currentLang === 'bn' ? 'ক্যাটেগরি' : 'Category'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {currentLang === 'bn' ? 'অ্যাকশন' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {event.featuredImage?.url ? (
                            <img 
                              className="h-10 w-10 rounded-lg object-cover" 
                              src={event.featuredImage.url} 
                              alt={event.title?.[currentLang] || event.title?.en}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <FiCalendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.title?.[currentLang] || event.title?.en}
                            {event.featured && (
                              <FiStar className="w-4 h-4 inline ml-2 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {event.location && (
                              <span className="flex items-center">
                                <FiMapPin className="w-3 h-3 mr-1" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(event.eventDate).toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        <FiTag className="w-3 h-3 mr-1" />
                        {event.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingEvent 
                    ? (currentLang === 'bn' ? 'ইভেন্ট সম্পাদনা' : 'Edit Event')
                    : (currentLang === 'bn' ? 'নতুন ইভেন্ট' : 'New Event')
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

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'ইভেন্টের তারিখ' : 'Event Date'}
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'সময়' : 'Time'}
                    </label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'স্থান' : 'Location'}
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Category and Featured */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      {currentLang === 'bn' ? 'ক্যাটেগরি' : 'Category'}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="form-checkbox"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {currentLang === 'bn' ? 'বিশেষ ইভেন্ট' : 'Featured Event'}
                    </label>
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="form-label">
                    {currentLang === 'bn' ? 'ফিচার ইমেজ' : 'Featured Image'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.files[0] })}
                    className="form-input"
                  />
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
                      rows="4"
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
                      rows="4"
                    />
                  </div>
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

export default EventManager;
