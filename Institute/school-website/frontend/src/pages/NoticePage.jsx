import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiSearch, 
  FiFilter, 
  FiCalendar, 
  FiUser, 
  FiStar,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

// Redux actions
import { fetchNotices, setFilters, clearFilters } from '../store/slices/noticeSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const NoticePage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  const { 
    notices, 
    loading, 
    error, 
    pagination, 
    filters, 
    categories 
  } = useSelector(state => state.notices);

  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch notices on component mount and when filters change
    dispatch(fetchNotices({
      ...(filters || {}),
      language: i18n.language,
      page: pagination?.currentPage || 1,
      limit: pagination?.limit || 10
    }));
  }, [dispatch, filters, pagination.currentPage, pagination.limit, i18n.language]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchNotices({
      ...filters,
      language: i18n.language,
      page,
      limit: pagination.limit
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    dispatch(clearFilters());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'Medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'High': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Urgent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority] || colors['Medium'];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('notices.notices')} - School Management System</title>
        <meta name="description" content="Stay updated with the latest notices and announcements from our school" />
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
            {t('notices.noticeBoard')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay informed with the latest announcements, updates, and important information
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
        >
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.search') + ' ' + t('notices.notices').toLowerCase() + '...'}
                className="form-input pl-10 w-full"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary px-6"
            >
              {t('common.search')}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline px-6"
            >
              <FiFilter className="w-5 h-5 mr-2" />
              {t('common.filter')}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">{t('notices.category')}</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {t(`notices.categories.${category.toLowerCase()}`) || category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">{t('notices.targetAudience')}</label>
                  <select
                    value={filters.targetAudience}
                    onChange={(e) => handleFilterChange('targetAudience', e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Audience</option>
                    <option value="Students">Students</option>
                    <option value="Teachers">Teachers</option>
                    <option value="Parents">Parents</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="btn btn-ghost w-full"
                  >
                    {t('common.clear')} {t('common.filter')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading notices..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Notices List */}
        {!loading && !error && (
          <>
            {(notices || []).length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {t('notices.noNotices')}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {(notices || []).map((notice, index) => (
                  <motion.div
                    key={notice._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {notice.isPinned && (
                              <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                            )}
                            <span className={`badge ${getPriorityColor(notice.priority)}`}>
                              {t(`notices.priorities.${notice.priority?.toLowerCase()}`) || notice.priority}
                            </span>
                            <span className="badge badge-primary">
                              {t(`notices.categories.${notice.category?.toLowerCase()}`) || notice.category}
                            </span>
                          </div>
                          
                          <Link
                            to={`/notices/${notice._id}`}
                            className="block group"
                          >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                              {notice.title?.[i18n.language] || notice.title?.en || notice.title}
                            </h2>
                          </Link>
                          
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                            {notice.content?.[i18n.language] || notice.content?.en || notice.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <FiUser className="w-4 h-4" />
                            <span>{notice.author?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiCalendar className="w-4 h-4" />
                            <span>{formatDate(notice.publishDate)}</span>
                          </div>
                        </div>

                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t('notices.publishedOn')} {formatDate(notice.publishDate)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {(pagination?.totalPages || 1) > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center items-center space-x-2 mt-8"
              >
                <button
                  onClick={() => handlePageChange((pagination?.currentPage || 1) - 1)}
                  disabled={(pagination?.currentPage || 1) === 1}
                  className="btn btn-outline p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: pagination?.totalPages || 1 }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`btn px-4 py-2 ${
                      page === (pagination?.currentPage || 1) 
                        ? 'btn-primary' 
                        : 'btn-outline'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange((pagination?.currentPage || 1) + 1)}
                  disabled={(pagination?.currentPage || 1) === (pagination?.totalPages || 1)}
                  className="btn btn-outline p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NoticePage;
