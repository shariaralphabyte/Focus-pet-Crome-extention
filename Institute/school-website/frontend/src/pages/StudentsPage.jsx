import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiSearch, 
  FiFilter, 
  FiUsers, 
  FiTrendingUp,
  FiAward,
  FiCalendar,
  FiUser,
  FiBook,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';

// Redux actions
import { 
  fetchStudents, 
  fetchStudentStats, 
  fetchClasses, 
  fetchSectionsByClass,
  setFilters, 
  clearFilters 
} from '../store/slices/studentSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const StudentsPage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  const { 
    students, 
    stats, 
    classes, 
    sections, 
    loading, 
    statsLoading, 
    error, 
    filters, 
    pagination 
  } = useSelector(state => state.students);
  
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('statistics'); // 'statistics' or 'list'
  const currentLang = i18n.language;

  // Fetch data on component mount and when filters change
  useEffect(() => {
    if (viewMode === 'list') {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      };
      dispatch(fetchStudents(params));
    }
  }, [dispatch, searchTerm, filters, pagination.page, viewMode]);

  // Fetch statistics and additional data
  useEffect(() => {
    dispatch(fetchStudentStats());
    dispatch(fetchClasses());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality would be implemented here
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    dispatch(clearFilters());
  };

  const getClassColor = (className) => {
    const colors = {
      'Play': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Nursery': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'KG': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'Class 1': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Class 2': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'Class 3': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      'Class 4': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Class 5': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
      'Class 6': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Class 7': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Class 8': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Class 9': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
      'Class 10': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
      'HSC 1st Year': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'HSC 2nd Year': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
    };
    return colors[className] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('students.students')} - School Management System</title>
        <meta name="description" content="Student information, statistics, and academic achievements" />
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
            {t('students.students')} Information
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive overview of our student body, achievements, and academic statistics
          </p>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-1">
            <button
              onClick={() => setViewMode('statistics')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'statistics'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiBarChart2 className="w-4 h-4 mr-2 inline" />
              Statistics
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiUsers className="w-4 h-4 mr-2 inline" />
              Class List
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {statsLoading && (
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

        {/* Statistics View */}
        {viewMode === 'statistics' && !statsLoading && stats && (
          <>
            {/* Overview Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {(stats.totalStudents || 0).toLocaleString()}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentLang === 'bn' ? 'মোট শিক্ষার্থী' : 'Total Students'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiUser className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {(stats.genderBreakdown?.Male || 0).toLocaleString()}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentLang === 'bn' ? 'ছেলে শিক্ষার্থী' : 'Male Students'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 text-center">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiUser className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {(stats.genderBreakdown?.Female || 0).toLocaleString()}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentLang === 'bn' ? 'মেয়ে শিক্ষার্থী' : 'Female Students'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiCalendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {stats.currentSession || new Date().getFullYear()}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentLang === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Year'}
                </p>
              </div>
            </motion.div>

            {/* Class-wise Distribution */}
            {stats.classWiseStats && stats.classWiseStats.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {currentLang === 'bn' ? 'শ্রেণীভিত্তিক শিক্ষার্থী বিতরণ' : 'Class-wise Student Distribution'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.classWiseStats.map((classData, index) => (
                    <motion.div
                      key={classData.class?.[currentLang] || classData.class?.en || classData._id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`badge ${getClassColor(classData.class?.[currentLang] || classData.class?.en)}`}>
                          {classData.class?.[currentLang] || classData.class?.en}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {classData.total || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{currentLang === 'bn' ? 'ছেলে' : 'Male'}: {classData.male || 0}</span>
                        <span>{currentLang === 'bn' ? 'মেয়ে' : 'Female'}: {classData.female || 0}</span>
                      </div>
                      <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min((classData.total / Math.max(...stats.classWiseStats.map(c => c.total))) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Group-wise Distribution (HSC) */}
            {stats.groupWiseStats && Object.keys(stats.groupWiseStats).length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {currentLang === 'bn' ? 'এইচএসসি গ্রুপভিত্তিক বিতরণ' : 'HSC Group-wise Distribution'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(stats.groupWiseStats).map(([group, data], index) => (
                    <motion.div
                      key={group}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        group === 'Science' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                        group === 'Commerce' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                      }`}>
                        <FiBook className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {group}
                      </h3>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                        {data.total || 0}
                      </p>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>{currentLang === 'bn' ? 'ছেলে' : 'Male'}: {data.male || 0}</p>
                        <p>{currentLang === 'bn' ? 'মেয়ে' : 'Female'}: {data.female || 0}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Academic Achievements */}
            {stats.achievements && stats.achievements.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {currentLang === 'bn' ? 'একাডেমিক অর্জন ২০২৪' : 'Academic Achievements 2024'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.title?.[currentLang] || achievement.title?.en || index}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FiAward className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {achievement.title?.[currentLang] || achievement.title?.en}
                      </h3>
                      <p className="text-2xl font-bold mb-2 text-primary-600 dark:text-primary-400">
                        {achievement.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Class List View */}
        {viewMode === 'list' && (
          /* Class List View */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
          >
            {/* Search and Filters */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search students by name, class, or ID..."
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

              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">
                        {currentLang === 'bn' ? 'শ্রেণী' : 'Class'}
                      </label>
                      <select
                        value={filters.class}
                        onChange={(e) => handleFilterChange('class', e.target.value)}
                        className="form-input"
                      >
                        <option value="">
                          {currentLang === 'bn' ? 'সকল শ্রেণী' : 'All Classes'}
                        </option>
                        {classes.map(classItem => (
                          <option key={classItem._id || classItem} value={classItem.name?.en || classItem}>
                            {classItem.name?.[currentLang] || classItem.name?.en || classItem}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="form-label">
                        {currentLang === 'bn' ? 'শাখা' : 'Section'}
                      </label>
                      <select
                        value={filters.section}
                        onChange={(e) => handleFilterChange('section', e.target.value)}
                        className="form-input"
                      >
                        <option value="">
                          {currentLang === 'bn' ? 'সকল শাখা' : 'All Sections'}
                        </option>
                        {sections.map(section => (
                          <option key={section._id || section} value={section.name || section}>
                            {section.name || section}
                          </option>
                        ))}
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
            </div>

            {/* Student List */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {!loading && students.length === 0 && (
              <div className="text-center py-12">
                <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {currentLang === 'bn' ? 'শিক্ষার্থী ডাটাবেস' : 'Student Database'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {currentLang === 'bn' 
                    ? 'অনুসন্ধান এবং ফিল্টার সুবিধা সহ বিস্তারিত শিক্ষার্থী তথ্য'
                    : 'Detailed student information with search and filter capabilities'
                  }
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentLang === 'bn'
                    ? 'ব্যক্তিগত শিক্ষার্থী রেকর্ড দেখতে প্রমাণীকরণ এবং যথাযথ অনুমতি প্রয়োজন।'
                    : 'This feature requires authentication and proper permissions to view individual student records.'
                  }
                </p>
              </div>
            )}

            {!loading && students.length > 0 && (
              <div className="space-y-4">
                {students.map((student, index) => (
                  <motion.div
                    key={student._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center">
                          <FiUser className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {student.name?.[currentLang] || student.name?.en}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {currentLang === 'bn' ? 'শিক্ষার্থী আইডি' : 'Student ID'}: {student.studentId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`badge ${getClassColor(student.class?.[currentLang] || student.class?.en)}`}>
                          {student.class?.[currentLang] || student.class?.en}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {currentLang === 'bn' ? 'শাখা' : 'Section'}: {student.section}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => dispatch(setFilters({ page }))}
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
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
