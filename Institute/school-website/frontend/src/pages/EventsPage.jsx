import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiCalendar,
  FiUser,
  FiEye,
  FiHeart,
  FiShare2,
  FiClock,
  FiMapPin,
  FiTag,
  FiTrendingUp,
  FiStar
} from 'react-icons/fi';

// Redux actions
import { 
  fetchEvents, 
  fetchFeaturedEvents, 
  fetchPopularEvents, 
  fetchRecentEvents,
  fetchEventCategories,
  setFilters, 
  clearFilters 
} from '../store/slices/eventSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const EventsPage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  const { 
    events, 
    featuredEvents, 
    popularEvents, 
    recentEvents, 
    categories, 
    loading, 
    featuredLoading, 
    error, 
    filters, 
    pagination 
  } = useSelector(state => state.events);
  
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const currentLang = i18n.language;

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      ...filters
    };
    dispatch(fetchEvents(params));
  }, [dispatch, searchTerm, filters, pagination.page]);

  // Fetch additional data
  useEffect(() => {
    dispatch(fetchFeaturedEvents(3));
    dispatch(fetchPopularEvents(5));
    dispatch(fetchRecentEvents(10));
    dispatch(fetchEventCategories());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    dispatch(clearFilters());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventStatusColor = (event) => {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    
    if (eventDate > now) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    } else if (eventDate.toDateString() === now.toDateString()) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    
    if (eventDate > now) {
      return currentLang === 'bn' ? 'আসন্ন' : 'Upcoming';
    } else if (eventDate.toDateString() === now.toDateString()) {
      return currentLang === 'bn' ? 'আজ' : 'Today';
    } else {
      return currentLang === 'bn' ? 'সম্পন্ন' : 'Completed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{currentLang === 'bn' ? 'ইভেন্ট' : 'Events'} - School Management System</title>
        <meta name="description" content="Stay updated with school events, activities, and important announcements" />
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {currentLang === 'bn' ? 'স্কুল ইভেন্ট' : 'School Events'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {currentLang === 'bn' 
              ? 'আমাদের স্কুলের সকল ইভেন্ট, কার্যক্রম এবং গুরুত্বপূর্ণ ঘোষণা সম্পর্কে আপডেট থাকুন'
              : 'Stay updated with all school events, activities, and important announcements'
            }
          </p>
        </motion.div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FiStar className="w-6 h-6 mr-2 text-yellow-500" />
                {currentLang === 'bn' ? 'বিশেষ ইভেন্ট' : 'Featured Events'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden group"
                >
                  {/* Event Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600">
                    {event.featuredImage?.url ? (
                      <img 
                        src={event.featuredImage.url} 
                        alt={event.title?.[currentLang] || event.title?.en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiCalendar className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`badge ${getEventStatusColor(event)}`}>
                        {getEventStatus(event)}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        <FiStar className="w-3 h-3 mr-1" />
                        {currentLang === 'bn' ? 'বিশেষ' : 'Featured'}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(event.eventDate)}</span>
                      {event.location && (
                        <>
                          <FiMapPin className="w-4 h-4 ml-4 mr-1" />
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {event.title?.[currentLang] || event.title?.en}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {event.excerpt?.[currentLang] || event.excerpt?.en}
                    </p>

                    {/* Event Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <FiEye className="w-4 h-4 mr-1" />
                          <span>{event.views || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <FiHeart className="w-4 h-4 mr-1" />
                          <span>{event.likes || 0}</span>
                        </div>
                      </div>
                      <Link
                        to={`/events/${event.slug}`}
                        className="btn btn-primary btn-sm"
                      >
                        {currentLang === 'bn' ? 'বিস্তারিত' : 'Read More'}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
        >
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={currentLang === 'bn' ? 'ইভেন্ট খুঁজুন...' : 'Search events...'}
                className="form-input pl-10 w-full"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary px-6"
            >
              {currentLang === 'bn' ? 'খুঁজুন' : 'Search'}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline px-6"
            >
              <FiFilter className="w-5 h-5 mr-2" />
              {currentLang === 'bn' ? 'ফিল্টার' : 'Filter'}
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">
                    {currentLang === 'bn' ? 'ক্যাটেগরি' : 'Category'}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="form-input"
                  >
                    <option value="">
                      {currentLang === 'bn' ? 'সকল ক্যাটেগরি' : 'All Categories'}
                    </option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">
                    {currentLang === 'bn' ? 'তারিখ থেকে' : 'Date From'}
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">
                    {currentLang === 'bn' ? 'তারিখ পর্যন্ত' : 'Date To'}
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="btn btn-ghost w-full"
                  >
                    {currentLang === 'bn' ? 'ক্লিয়ার' : 'Clear'} {currentLang === 'bn' ? 'ফিল্টার' : 'Filters'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex justify-between items-center mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentLang === 'bn' ? 'সকল ইভেন্ট' : 'All Events'}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {currentLang === 'bn' ? 'গ্রিড' : 'Grid'}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {currentLang === 'bn' ? 'তালিকা' : 'List'}
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Events Grid/List */}
        {!loading && !error && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {events.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {currentLang === 'bn' ? 'কোন ইভেন্ট পাওয়া যায়নি' : 'No Events Found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentLang === 'bn' 
                    ? 'আপনার অনুসন্ধানের মানদণ্ড অনুযায়ী কোন ইভেন্ট পাওয়া যায়নি।'
                    : 'No events found matching your search criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
              }>
                {events.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Event Image */}
                    <div className={`relative bg-gradient-to-br from-primary-400 to-primary-600 ${
                      viewMode === 'list' ? 'w-48 h-32' : 'h-48'
                    }`}>
                      {event.featuredImage?.url ? (
                        <img 
                          src={event.featuredImage.url} 
                          alt={event.title?.[currentLang] || event.title?.en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiCalendar className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`badge text-xs ${getEventStatusColor(event)}`}>
                          {getEventStatus(event)}
                        </span>
                      </div>
                      {event.category && (
                        <div className="absolute top-2 left-2">
                          <span className="badge bg-black bg-opacity-50 text-white text-xs">
                            <FiTag className="w-3 h-3 mr-1" />
                            {event.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(event.eventDate)}</span>
                        {event.location && (
                          <>
                            <FiMapPin className="w-4 h-4 ml-4 mr-1" />
                            <span className="truncate">{event.location}</span>
                          </>
                        )}
                      </div>
                      
                      <h3 className={`font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${
                        viewMode === 'list' ? 'text-lg' : 'text-xl'
                      }`}>
                        {event.title?.[currentLang] || event.title?.en}
                      </h3>
                      
                      <p className={`text-gray-600 dark:text-gray-400 mb-4 ${
                        viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'
                      }`}>
                        {event.excerpt?.[currentLang] || event.excerpt?.en}
                      </p>

                      {/* Event Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            <span>{event.views || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <FiHeart className="w-4 h-4 mr-1" />
                            <span>{event.likes || 0}</span>
                          </div>
                          {event.commentsCount > 0 && (
                            <div className="flex items-center">
                              <FiUser className="w-4 h-4 mr-1" />
                              <span>{event.commentsCount}</span>
                            </div>
                          )}
                        </div>
                        <Link
                          to={`/events/${event.slug}`}
                          className="btn btn-primary btn-sm"
                        >
                          {currentLang === 'bn' ? 'বিস্তারিত' : 'Read More'}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        page === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
