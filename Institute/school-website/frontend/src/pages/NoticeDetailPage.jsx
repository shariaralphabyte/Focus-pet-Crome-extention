import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiUser, 
  FiDownload,
  FiPrinter,
  FiStar,
  FiTag,
  FiFileText
} from 'react-icons/fi';

// Redux actions
import { fetchNoticeById } from '../store/slices/noticeSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const NoticeDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  const { currentNotice, loading, error } = useSelector(state => state.notices);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchNoticeById({ id, language: i18n.language }));
    }
  }, [dispatch, id, i18n.language]);

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('notices.noticeNotFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <Link 
            to="/notices" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            {t('notices.backToNotices')}
          </Link>
        </div>
      </div>
    );
  }

  if (!currentNotice) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-yellow-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('notices.noticeNotFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('notices.noticeNotFoundDescription')}
          </p>
          <Link 
            to="/notices" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            {t('notices.backToNotices')}
          </Link>
        </div>
      </div>
    );
  }

  const notice = currentNotice;
  console.log('Current notice in component:', notice); // Debug log

  // Get localized title and content
  const getLocalizedField = (field) => {
    if (!notice) return '';
    // Handle both direct field and nested i18n object
    if (notice[field] && typeof notice[field] === 'object') {
      return notice[field][i18n.language] || notice[field].en || '';
    }
    return notice[field] || '';
  };

  const pageTitle = getLocalizedField('title') || t('notices.noticeDetail');
  const pageDescription = getLocalizedField('excerpt');
  const content = getLocalizedField('content');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{`${pageTitle} - School Management System`}</title>
        {pageDescription && (
          <meta name="description" content={pageDescription} />
        )}
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            to="/notices"
            className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Notices
          </Link>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="btn btn-outline p-2"
              title="Print Notice"
            >
              <FiPrinter className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Notice Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
        >
          {/* Notice Header */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  {notice.isPinned && (
                    <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                  )}
                  <span className={`badge ${getPriorityColor(notice.priority)}`}>
                    {notice.priority}
                  </span>
                  <span className="badge badge-primary">
                    {notice.category}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {notice.title?.[i18n.language] || notice.title?.en || notice.title}
                </h1>
                
                {notice.excerpt && (
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    {notice.excerpt?.[i18n.language] || notice.excerpt?.en}
                  </p>
                )}
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <FiUser className="w-4 h-4" />
                <span>{notice.author?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(notice.publishDate)}</span>
              </div>
              {notice.noticeNumber && (
                <div className="flex items-center space-x-2">
                  <FiTag className="w-4 h-4" />
                  <span>{notice.noticeNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notice Body */}
          <div className="p-8">
            <div className="prose dark:prose-invert max-w-none">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {t('notices.noContentAvailable')}
                </p>
              )}
            </div>

            {/* Attachments */}
            {notice.attachments && notice.attachments.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Attachments
                </h3>
                <div className="space-y-3">
                  {notice.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FiFileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {attachment.originalName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {attachment.type?.toUpperCase()} • {Math.round(attachment.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        <FiDownload className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NoticeDetailPage;
