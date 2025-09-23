import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiSearch, 
  FiFilter, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiBook,
  FiAward,
  FiCalendar,
  FiUser
} from 'react-icons/fi';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const TeachersPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  // Safely convert bilingual objects or values to displayable strings
  const textOf = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
      return v[currentLang] || v.en || v.bn || '';
    }
    return v;
  };
  
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Create filters object for compatibility
  const filters = {
    department: selectedDepartment,
    designation: selectedDesignation
  };

  // Fetch teachers data
  const fetchTeachersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedDesignation) params.append('designation', selectedDesignation);
      
      const response = await fetch(`http://localhost:5001/api/teachers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTeachers(data.data);
      } else {
        setError(data.message || 'Failed to fetch teachers');
      }
    } catch (err) {
      setError('Failed to fetch teachers');
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartmentsData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/teachers/departments');
      const data = await response.json();
      
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Fetch designations
  const fetchDesignationsData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/teachers/designations');
      const data = await response.json();
      
      if (data.success) {
        setDesignations(data.data);
      }
    } catch (err) {
      console.error('Error fetching designations:', err);
    }
  };

  // Fetch stats
  const fetchStatsData = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/teachers/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchTeachersData();
  }, [searchTerm, selectedDepartment, selectedDesignation]);

  // Fetch initial data
  useEffect(() => {
    fetchDepartmentsData();
    fetchDesignationsData();
    fetchStatsData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeachersData();
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    if (filterName === 'department') {
      setSelectedDepartment(value);
    } else if (filterName === 'designation') {
      setSelectedDesignation(value);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedDesignation('');
  };

  // Alternative name for compatibility
  const clearAllFilters = handleClearFilters;

  const getDesignationColor = (designation) => {
    // Handle both bilingual object and string designation
    const designationText = typeof designation === 'object' ? designation[currentLang] || designation.en : designation;
    const colors = {
      'Head Teacher': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Senior Teacher': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Assistant Teacher': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Junior Teacher': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'প্রধান শিক্ষক': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'সিনিয়র শিক্ষক': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'সহকারী শিক্ষক': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'জুনিয়র শিক্ষক': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colors[designationText] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('teachers.teachers')} - School Management System</title>
        <meta name="description" content="Meet our dedicated and qualified teaching staff committed to educational excellence" />
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
            {t('teachers.teachersList')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Meet our dedicated and qualified teaching staff committed to educational excellence
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
                placeholder={`${t('common.search')} ${t('teachers.teachers').toLowerCase()}...`}
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
                  <label className="form-label">{t('teachers.department')}</label>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => {
                      const label = typeof dept === 'object' ? (dept[currentLang] || dept.en || dept.bn || '') : dept;
                      const value = typeof dept === 'object' ? (dept.en || dept.bn || '') : dept;
                      const key = value || label || JSON.stringify(dept);
                      return (
                        <option key={key} value={value}>{label}</option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">{t('teachers.designation')}</label>
                  <select
                    value={filters.designation}
                    onChange={(e) => handleFilterChange('designation', e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Designations</option>
                    {designations.map((designation) => {
                      const label = typeof designation === 'object' ? (designation[currentLang] || designation.en || designation.bn || '') : designation;
                      const value = typeof designation === 'object' ? (designation.en || designation.bn || '') : designation;
                      const key = value || label || JSON.stringify(designation);
                      return (
                        <option key={key} value={value}>{label}</option>
                      );
                    })}
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

        {/* Teachers Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => (
            <motion.div
              key={teacher._id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Teacher Photo */}
              <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600">
                {teacher.personalInfo?.photo?.url ? (
                  <img 
                    src={teacher.personalInfo.photo.url} 
                    alt={textOf(teacher.user?.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                      <FiUser className="w-10 h-10 text-primary-600" />
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`badge ${getDesignationColor(teacher.designation)}`}>
                    {textOf(teacher.designation)}
                  </span>
                </div>
              </div>

              {/* Teacher Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {textOf(teacher.user?.name)}
                </h3>
                
                <div className="flex items-center text-primary-600 dark:text-primary-400 mb-3">
                  <FiBook className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {textOf(teacher.department)}
                  </span>
                </div>

                {/* Subjects */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('teachers.subjects')}:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects?.slice(0, 2).map((subject, idx) => (
                      <span key={idx} className="badge badge-primary text-xs">
                        {textOf(subject)}
                      </span>
                    ))}
                    {teacher.subjects?.length > 2 && (
                      <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs">
                        +{teacher.subjects.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Experience & Qualification */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiAward className="w-4 h-4 mr-2" />
                    <span>{teacher.experience?.totalYears || 0} years experience</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiAward className="w-4 h-4 mr-2" />
                    <span>
                      {textOf(teacher.qualifications?.[0]?.degree)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span>Joined {new Date(teacher.joinDate || teacher.createdAt).getFullYear()}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <a 
                        href={`mailto:${teacher.contactInfo?.email}`}
                        className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <FiMail className="w-4 h-4" />
                      </a>
                      <a 
                        href={`tel:${teacher.contactInfo?.phone}`}
                        className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <FiPhone className="w-4 h-4" />
                      </a>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {teacher.teacherId}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && teachers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {currentLang === 'bn' ? 'কোন শিক্ষক পাওয়া যায়নি।' : 'No teachers found matching your criteria.'}
            </p>
          </motion.div>
        )}

        {/* Statistics */}
        {stats && !statsLoading && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {currentLang === 'bn' ? 'শিক্ষক পরিসংখ্যান' : 'Teaching Staff Statistics'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stats.totalTeachers || 0}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {currentLang === 'bn' ? 'মোট শিক্ষক' : 'Total Teachers'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {stats.activeTeachers || 0}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {currentLang === 'bn' ? 'সক্রিয় শিক্ষক' : 'Active Teachers'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {Math.round(stats.experienceStats?.avgExperience || 0)}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {currentLang === 'bn' ? 'গড় অভিজ্ঞতা' : 'Avg. Experience'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {stats.genderBreakdown?.Female || 0}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {currentLang === 'bn' ? 'মহিলা শিক্ষক' : 'Female Teachers'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeachersPage;
