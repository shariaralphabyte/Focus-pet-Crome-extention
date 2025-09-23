import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiCalendar, 
  FiClock, 
  FiBook, 
  FiUser,
  FiMapPin,
  FiDownload,
  FiPrinter
} from 'react-icons/fi';
import { fetchRoutines, getCurrentRoutine, setFilters } from '../store/slices/routineSlice';
import { fetchActiveClasses } from '../store/slices/classSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoutinesPage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const currentLang = i18n.language;
  
  const { routines, loading, error, filters } = useSelector(state => state.routines);
  const { activeClasses } = useSelector(state => state.classes);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState(''); // Keep empty so all sections show
  const [routineType, setRoutineType] = useState('Class'); // 'Class' or 'Exam'
  const [academicYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    dispatch(fetchActiveClasses());
  }, [dispatch]);

  useEffect(() => {
    // Fetch all routines initially with higher limit to get all classes
    dispatch(fetchRoutines({ limit: 50 }));
  }, [dispatch]);

  // Don't refetch on filter changes - use client-side filtering instead
  // This prevents the dropdown options from disappearing

  // Mock routine data
  const classRoutine = {
    'Class 6': {
      'A': [
        { day: 'Sunday', periods: [
          { time: '8:00-8:45', subject: 'Mathematics', teacher: 'Prof. Fatima Khatun', room: '101' },
          { time: '8:45-9:30', subject: 'English', teacher: 'Mr. Abdul Karim', room: '102' },
          { time: '9:30-10:15', subject: 'Bangla', teacher: 'Mrs. Salma Akter', room: '103' },
          { time: '10:15-10:30', subject: 'Break', teacher: '', room: '' },
          { time: '10:30-11:15', subject: 'Science', teacher: 'Ms. Rashida Begum', room: '201' },
          { time: '11:15-12:00', subject: 'Social Science', teacher: 'Mr. Aminul Islam', room: '104' },
          { time: '12:00-12:45', subject: 'ICT', teacher: 'Mr. Kamal Hasan', room: 'Computer Lab' }
        ]},
        { day: 'Monday', periods: [
          { time: '8:00-8:45', subject: 'Bangla', teacher: 'Mrs. Salma Akter', room: '103' },
          { time: '8:45-9:30', subject: 'Mathematics', teacher: 'Prof. Fatima Khatun', room: '101' },
          { time: '9:30-10:15', subject: 'English', teacher: 'Mr. Abdul Karim', room: '102' },
          { time: '10:15-10:30', subject: 'Break', teacher: '', room: '' },
          { time: '10:30-11:15', subject: 'Social Science', teacher: 'Mr. Aminul Islam', room: '104' },
          { time: '11:15-12:00', subject: 'Science', teacher: 'Ms. Rashida Begum', room: '201' },
          { time: '12:00-12:45', subject: 'Physical Education', teacher: 'Mr. Rafiq Ahmed', room: 'Playground' }
        ]},
        { day: 'Tuesday', periods: [
          { time: '8:00-8:45', subject: 'Science', teacher: 'Ms. Rashida Begum', room: '201' },
          { time: '8:45-9:30', subject: 'Social Science', teacher: 'Mr. Aminul Islam', room: '104' },
          { time: '9:30-10:15', subject: 'Mathematics', teacher: 'Prof. Fatima Khatun', room: '101' },
          { time: '10:15-10:30', subject: 'Break', teacher: '', room: '' },
          { time: '10:30-11:15', subject: 'English', teacher: 'Mr. Abdul Karim', room: '102' },
          { time: '11:15-12:00', subject: 'Bangla', teacher: 'Mrs. Salma Akter', room: '103' },
          { time: '12:00-12:45', subject: 'Arts & Crafts', teacher: 'Ms. Nasreen Akter', room: '105' }
        ]},
        { day: 'Wednesday', periods: [
          { time: '8:00-8:45', subject: 'English', teacher: 'Mr. Abdul Karim', room: '102' },
          { time: '8:45-9:30', subject: 'Science', teacher: 'Ms. Rashida Begum', room: '201' },
          { time: '9:30-10:15', subject: 'Social Science', teacher: 'Mr. Aminul Islam', room: '104' },
          { time: '10:15-10:30', subject: 'Break', teacher: '', room: '' },
          { time: '10:30-11:15', subject: 'Mathematics', teacher: 'Prof. Fatima Khatun', room: '101' },
          { time: '11:15-12:00', subject: 'Islamic Studies', teacher: 'Maulana Abdul Halim', room: '106' },
          { time: '12:00-12:45', subject: 'Bangla', teacher: 'Mrs. Salma Akter', room: '103' }
        ]},
        { day: 'Thursday', periods: [
          { time: '8:00-8:45', subject: 'Social Science', teacher: 'Mr. Aminul Islam', room: '104' },
          { time: '8:45-9:30', subject: 'ICT', teacher: 'Mr. Kamal Hasan', room: 'Computer Lab' },
          { time: '9:30-10:15', subject: 'Science', teacher: 'Ms. Rashida Begum', room: '201' },
          { time: '10:15-10:30', subject: 'Break', teacher: '', room: '' },
          { time: '10:30-11:15', subject: 'Bangla', teacher: 'Mrs. Salma Akter', room: '103' },
          { time: '11:15-12:00', subject: 'English', teacher: 'Mr. Abdul Karim', room: '102' },
          { time: '12:00-12:45', subject: 'Mathematics', teacher: 'Prof. Fatima Khatun', room: '101' }
        ]}
      ]
    }
  };

  const examRoutine = [
    { date: '2024-06-01', day: 'Saturday', subject: 'Bangla', time: '10:00 AM - 1:00 PM', room: 'All Classrooms' },
    { date: '2024-06-03', day: 'Monday', subject: 'English', time: '10:00 AM - 1:00 PM', room: 'All Classrooms' },
    { date: '2024-06-05', day: 'Wednesday', subject: 'Mathematics', time: '10:00 AM - 1:00 PM', room: 'All Classrooms' },
    { date: '2024-06-07', day: 'Friday', subject: 'Science', time: '10:00 AM - 1:00 PM', room: 'All Classrooms' },
    { date: '2024-06-09', day: 'Sunday', subject: 'Social Science', time: '10:00 AM - 1:00 PM', room: 'All Classrooms' },
    { date: '2024-06-11', day: 'Tuesday', subject: 'Islamic Studies', time: '10:00 AM - 1:00 PM', room: 'All Classrooms' },
    { date: '2024-06-13', day: 'Thursday', subject: 'ICT', time: '10:00 AM - 1:00 PM', room: 'Computer Lab' }
  ];

  // Get available classes from routine data, excluding "All Classes" for Class/Exam routines
  const allAvailableClasses = [...new Set(routines?.map(routine => routine.class?.en).filter(Boolean))] || [];
  const regularClasses = allAvailableClasses.filter(cls => cls !== 'All Classes');
  const fallbackClasses = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  
  // For Class and Exam routines, show only regular classes. For Special, show all
  const availableClassesWithFallback = routineType === 'Special' 
    ? (allAvailableClasses.length > 0 ? allAvailableClasses.sort() : fallbackClasses)
    : (regularClasses.length > 0 ? regularClasses.sort() : fallbackClasses);
  
  // Debug: Log available classes (only once when routines are loaded)
  if (routines?.length && availableClassesWithFallback.length > 0) {
    console.log('Available Classes for', routineType + ':', availableClassesWithFallback);
    console.log('Total Routines Loaded:', routines?.length);
  }
  
  
  // Get available sections from ALL routine data (never changes based on filters)
  const availableSections = [...new Set(routines?.map(routine => routine.section).filter(Boolean))] || [];
  const sectionsWithFallback = availableSections.length > 0 ? availableSections : ['A', 'B', 'C'];


  // Get current routine from Redux store with improved filtering
  // If multiple routines match, prefer the most recent one (2025 over 2024)
  const matchingRoutines = routines?.filter(routine => {
    // Always filter by type first
    const typeMatch = routine.type === routineType;
    
    // For Special events, don't filter by class/section (they're usually for all)
    if (routineType === 'Special') {
      return typeMatch;
    }
    
    // For Class and Exam routines, apply class/section filtering
    const classMatch = !selectedClass || routine.class?.en === selectedClass || routine.class?.bn === selectedClass;
    const sectionMatch = !selectedSection || routine.section === selectedSection;
    
    return classMatch && sectionMatch && typeMatch;
  }) || [];

  // Sort by academic year (most recent first) and take the first one
  const currentRoutineData = matchingRoutines.sort((a, b) => {
    return parseInt(b.academicYear) - parseInt(a.academicYear);
  })[0];

  // Debug: Log the results only when filtering
  if (selectedClass) {
    console.log('Filter Results for', selectedClass + (selectedSection ? ` Section ${selectedSection}` : ''));
    console.log('- Matching routines:', matchingRoutines?.length);
    if (currentRoutineData) {
      console.log('- Found:', currentRoutineData.title?.en);
    } else {
      console.log('- No routine found');
    }
  }


  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'English': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Bangla': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Science': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Social Science': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'ICT': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'Physical Education': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Islamic Studies': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      'Arts & Crafts': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Break': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Use real routine data from API
  const currentRoutine = currentRoutineData?.schedule || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('routines.routines')} - School Management System</title>
        <meta name="description" content="View class routines, exam schedules, and timetables" />
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
            {t('routines.routines')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            View class schedules, exam routines, and academic timetables
          </p>
        </motion.div>

        {/* Routine Type Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-1">
            <button
              onClick={() => setRoutineType('Class')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                routineType === 'Class'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiCalendar className="w-4 h-4 mr-2 inline" />
              {t('routines.classRoutine')}
            </button>
            <button
              onClick={() => setRoutineType('Exam')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                routineType === 'Exam'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiBook className="w-4 h-4 mr-2 inline" />
              {t('routines.examRoutine')}
            </button>
            <button
              onClick={() => setRoutineType('Special')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                routineType === 'Special'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiMapPin className="w-4 h-4 mr-2 inline" />
              Special Events
            </button>
          </div>
        </motion.div>

        {/* Class Selection - Visible for Class and Exam routine types */}
        {(routineType === 'Class' || routineType === 'Exam') && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <label className="form-label">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="form-input md:w-48"
                  >
                    <option value="">Select Class</option>
                    {availableClassesWithFallback.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="form-input md:w-32"
                  >
                    <option value="">Select Section</option>
                    {sectionsWithFallback.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline px-4 py-2">
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button className="btn btn-outline px-4 py-2">
                  <FiPrinter className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {routineType === 'Class' || routineType === 'Exam' ? (
          <>

            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-8"
              >
                <LoadingSpinner />
                <p className="text-center text-gray-600 dark:text-gray-400 mt-4">Loading routines...</p>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
              >
                <p className="text-red-800 dark:text-red-200">Error loading routines: {error}</p>
              </motion.div>
            )}

            {/* No Selection State */}
            {!loading && !error && !selectedClass && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center"
              >
                <FiCalendar className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Select Class to View Routine
                </h3>
                <p className="text-blue-600 dark:text-blue-300">
                  Please select a class to view the routine. Section is optional.
                </p>
              </motion.div>
            )}

            {/* No Data State */}
            {!loading && !error && selectedClass && currentRoutine.length === 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center"
              >
                <FiCalendar className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  No Routine Found
                </h3>
                <p className="text-yellow-600 dark:text-yellow-300">
                  No routine available for {selectedClass}{selectedSection ? ` - Section ${selectedSection}` : ''}
                </p>
              </motion.div>
            )}

            {/* Class Routine Table */}
            {!loading && !error && selectedClass && currentRoutine.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentRoutineData?.title?.[currentLang] || `${selectedClass}${selectedSection ? ` - Section ${selectedSection}` : ''} Routine`}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Academic Year: {currentRoutineData?.academicYear}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Day
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Periods
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {currentRoutine.map((daySchedule, dayIndex) => (
                        <tr key={daySchedule.day} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {daySchedule.dayName?.[currentLang] || daySchedule.day}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {daySchedule.periods?.map((period, periodIndex) => (
                                <div key={periodIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {period.startTime} - {period.endTime}
                                      </span>
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSubjectColor(period.subject?.[currentLang] || period.subject?.en)}`}>
                                        {period.subject?.[currentLang] || period.subject?.en}
                                      </span>
                                    </div>
                                    {period.room && (
                                      <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        <FiMapPin className="w-3 h-3 mr-1" />
                                        {period.room?.[currentLang] || period.room?.en}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        ) : routineType === 'Exam' ? (
          /* Exam Routine */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Final Examination Routine - June 2024
              </h2>
              <div className="flex gap-2">
                <button className="btn btn-outline px-4 py-2">
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button className="btn btn-outline px-4 py-2">
                  <FiPrinter className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Room
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {examRoutine.map((exam, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(exam.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {exam.day}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(exam.subject)}`}>
                          {exam.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                          {exam.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <FiMapPin className="w-4 h-4 text-gray-400 mr-2" />
                          {exam.room}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          /* Special Events */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentRoutineData?.title?.[currentLang] || 'Special Events Schedule'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Academic Year: {currentRoutineData?.academicYear || '2025'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Events
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRoutine.map((daySchedule, dayIndex) => (
                    <tr key={daySchedule.day} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {daySchedule.dayName?.[currentLang] || daySchedule.day}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {daySchedule.periods?.map((period, periodIndex) => (
                            <div key={periodIndex} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {period.startTime} - {period.endTime}
                                  </span>
                                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                    {period.subject?.[currentLang] || period.subject?.en}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  <FiMapPin className="w-3 h-3 mr-1" />
                                  {period.room?.[currentLang] || period.room?.en}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Important Notes */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
            Important Notes:
          </h3>
          <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            <li>• Students must arrive 10 minutes before the first period</li>
            <li>• Mobile phones are not allowed during class hours</li>
            <li>• Students must bring all required books and materials</li>
            <li>• Any changes to the routine will be notified in advance</li>
            <li>• For exam routine: Students must bring admit card and necessary stationery</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default RoutinesPage;
