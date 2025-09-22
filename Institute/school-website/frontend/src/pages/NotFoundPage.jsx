import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
      <Helmet>
        <title>{t('errors.pageNotFound')} - School Management System</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        {/* 404 Animation */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-8xl font-bold text-primary-600 dark:text-primary-400 mb-4">
            404
          </div>
          <div className="w-24 h-1 bg-primary-600 dark:bg-primary-400 mx-auto rounded-full"></div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('errors.pageNotFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('errors.somethingWentWrong')}. The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center justify-center px-6 py-3"
          >
            <FiHome className="w-5 h-5 mr-2" />
            {t('errors.goHome')}
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline inline-flex items-center justify-center px-6 py-3"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            {t('common.back')}
          </button>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-sm text-gray-500 dark:text-gray-400"
        >
          <p>
            Need help? {' '}
            <Link 
              to="/contact" 
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('errors.contactSupport')}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
