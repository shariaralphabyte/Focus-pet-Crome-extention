import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiAward, 
  FiSearch, 
  FiDownload, 
  FiEye,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiCalendar
} from 'react-icons/fi';

const ResultsPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('SSC 2024');
  const [selectedClass, setSelectedClass] = useState('Class 10');

  // Mock results data
  const examResults = {
    'SSC 2024': {
      examInfo: {
        name: 'Secondary School Certificate Examination 2024',
        year: '2024',
        board: 'Dhaka Education Board',
        totalStudents: 250,
        passRate: 98.5,
        gpa5Count: 45
      },
      toppers: [
        { name: 'Fatima Rahman', roll: '101', gpa: 5.00, subjects: { bangla: 'A+', english: 'A+', math: 'A+', science: 'A+', social: 'A+', religion: 'A+' }},
        { name: 'Mohammad Ali', roll: '105', gpa: 5.00, subjects: { bangla: 'A+', english: 'A+', math: 'A+', science: 'A+', social: 'A+', religion: 'A+' }},
        { name: 'Rashida Khatun', roll: '112', gpa: 5.00, subjects: { bangla: 'A+', english: 'A+', math: 'A+', science: 'A+', social: 'A+', religion: 'A+' }}
      ],
      statistics: {
        'A+': 45,
        'A': 78,
        'A-': 65,
        'B': 42,
        'C': 16,
        'D': 4,
        'F': 0
      }
    },
    'HSC 2024': {
      examInfo: {
        name: 'Higher Secondary Certificate Examination 2024',
        year: '2024',
        board: 'Dhaka Education Board',
        totalStudents: 180,
        passRate: 96.2,
        gpa5Count: 38
      },
      toppers: [
        { name: 'Aminul Islam', roll: '201', gpa: 5.00, group: 'Science' },
        { name: 'Nasreen Akter', roll: '205', gpa: 5.00, group: 'Science' },
        { name: 'Karim Uddin', roll: '301', gpa: 5.00, group: 'Commerce' }
      ],
      statistics: {
        'A+': 38,
        'A': 62,
        'A-': 48,
        'B': 24,
        'C': 8,
        'D': 0,
        'F': 0
      }
    }
  };

  const examTypes = ['SSC 2024', 'HSC 2024', 'Test Exam 2024', 'Half Yearly 2024'];
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'HSC 1st Year', 'HSC 2nd Year'];

  const currentResult = examResults[selectedExam];

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'A': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'A-': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'B': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'C': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'D': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'F': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[grade] || colors['F'];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('results.results')} - School Management System</title>
        <meta name="description" content="View exam results, academic achievements, and performance statistics" />
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
            {t('results.examResults')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Academic achievements and examination results of our students
          </p>
        </motion.div>

        {/* Exam Selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="form-label">Examination</label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="form-input md:w-64"
                >
                  {examTypes.map(exam => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="form-input md:w-48"
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline px-4 py-2">
                <FiDownload className="w-4 h-4 mr-2" />
                Download Results
              </button>
              <button className="btn btn-primary px-4 py-2">
                <FiEye className="w-4 h-4 mr-2" />
                View Individual Result
              </button>
            </div>
          </div>
        </motion.div>

        {currentResult && (
          <>
            {/* Exam Overview */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentResult.examInfo.totalStudents}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Total Students</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiTrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentResult.examInfo.passRate}%
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Pass Rate</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiStar className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentResult.examInfo.gpa5Count}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">GPA 5.00</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiCalendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentResult.examInfo.year}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Exam Year</p>
              </div>
            </motion.div>

            {/* Top Performers */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FiAward className="w-6 h-6 mr-2 text-yellow-500" />
                Top Performers
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentResult.toppers.map((student, index) => (
                  <motion.div
                    key={student.roll}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="relative bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiStar className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Roll: {student.roll}
                      </p>
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                        GPA {student.gpa}
                      </div>
                      {student.group && (
                        <span className="badge bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                          {student.group}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Grade Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Grade Distribution
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Object.entries(currentResult.statistics).map(([grade, count]) => (
                  <motion.div
                    key={grade}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold mb-3 ${getGradeColor(grade)}`}>
                      {grade}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {count}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Students
                    </div>
                    <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(count / currentResult.examInfo.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {((count / currentResult.examInfo.totalStudents) * 100).toFixed(1)}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Individual Result Search */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Search Individual Result
              </h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter student name or roll number..."
                    className="form-input pl-10 w-full"
                  />
                </div>
                <button className="btn btn-primary px-6">
                  <FiSearch className="w-4 h-4 mr-2" />
                  Search Result
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  How to check your result:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Enter your full name or roll number in the search box</li>
                  <li>• Select the correct examination from the dropdown</li>
                  <li>• Click "Search Result" to view your detailed result</li>
                  <li>• You can download your result as PDF for printing</li>
                </ul>
              </div>
            </motion.div>
          </>
        )}

        {/* Achievement Banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">🎉 Congratulations to All Students! 🎉</h2>
          <p className="text-lg mb-4">
            We are proud of your outstanding performance in the examinations.
          </p>
          <p className="text-green-100">
            Your hard work and dedication have made our institution shine brighter!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;
