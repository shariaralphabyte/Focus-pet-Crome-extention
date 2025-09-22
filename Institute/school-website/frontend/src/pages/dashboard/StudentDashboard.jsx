import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FiBook, 
  FiCalendar,
  FiAward,
  FiClock,
  FiFileText,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiEye,
  FiUser,
  FiBarChart2
} from 'react-icons/fi';

const StudentDashboard = () => {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock student data
  const studentData = {
    profile: {
      studentId: 'STD2024001',
      class: 'Class 10',
      section: 'A',
      rollNumber: '15',
      session: '2024-2025'
    },
    academics: {
      currentGPA: 4.75,
      attendance: 92,
      totalSubjects: 8,
      completedAssignments: 24,
      pendingAssignments: 3
    },
    todaySchedule: [
      { time: '8:00-8:45', subject: 'Mathematics', teacher: 'Prof. Fatima Khatun', room: '101' },
      { time: '8:45-9:30', subject: 'English', teacher: 'Mr. Abdul Karim', room: '102' },
      { time: '9:30-10:15', subject: 'Physics', teacher: 'Ms. Rashida Begum', room: '201' },
      { time: '11:15-12:00', subject: 'Chemistry', teacher: 'Dr. Aminul Haque', room: '202' }
    ],
    recentGrades: [
      { subject: 'Mathematics', exam: 'Monthly Test', grade: 'A+', marks: '98/100', date: '2024-03-15' },
      { subject: 'English', exam: 'Assignment', grade: 'A', marks: '85/100', date: '2024-03-12' },
      { subject: 'Physics', exam: 'Lab Test', grade: 'A+', marks: '95/100', date: '2024-03-10' },
      { subject: 'Chemistry', exam: 'Quiz', grade: 'A', marks: '88/100', date: '2024-03-08' }
    ],
    upcomingEvents: [
      { title: 'Mathematics Final Exam', date: '2024-04-15', type: 'exam' },
      { title: 'Science Project Submission', date: '2024-04-18', type: 'assignment' },
      { title: 'Annual Sports Day', date: '2024-04-22', type: 'event' },
      { title: 'Parent-Teacher Meeting', date: '2024-04-25', type: 'meeting' }
    ],
    notices: [
      { id: 1, title: 'Final Exam Schedule Published', date: '2024-03-20', priority: 'high' },
      { id: 2, title: 'Library Books Return Reminder', date: '2024-03-18', priority: 'medium' },
      { id: 3, title: 'Science Fair Registration Open', date: '2024-03-15', priority: 'low' }
    ]
  };

  const quickActions = [
    { 
      title: 'View Results', 
      description: 'Check latest exam results', 
      icon: FiAward, 
      color: 'bg-green-500',
      count: null
    },
    { 
      title: 'Assignments', 
      description: 'View pending assignments', 
      icon: FiFileText, 
      color: 'bg-blue-500',
      count: studentData.academics.pendingAssignments
    },
    { 
      title: 'Class Routine', 
      description: 'Today\'s class schedule', 
      icon: FiCalendar, 
      color: 'bg-purple-500',
      count: studentData.todaySchedule.length
    },
    { 
      title: 'Download Forms', 
      description: 'Academic documents', 
      icon: FiDownload, 
      color: 'bg-orange-500',
      count: null
    }
  ];

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'A': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'A-': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'B': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'C': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };
    return colors[grade] || colors['B'];
  };

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Academic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current GPA</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{studentData.academics.currentGPA}</p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <FiTrendingUp className="w-4 h-4 mr-1" />
                Excellent performance
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center">
              <FiAward className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{studentData.academics.attendance}%</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Good attendance record
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{studentData.academics.pendingAssignments}</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Assignments due soon
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{studentData.academics.totalSubjects}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                This semester
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
              <FiBook className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <FiUser className="w-5 h-5 mr-2" />
          Student Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Student ID</p>
            <p className="font-semibold text-gray-900 dark:text-white">{studentData.profile.studentId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Class & Section</p>
            <p className="font-semibold text-gray-900 dark:text-white">{studentData.profile.class} - {studentData.profile.section}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Roll Number</p>
            <p className="font-semibold text-gray-900 dark:text-white">{studentData.profile.rollNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Session</p>
            <p className="font-semibold text-gray-900 dark:text-white">{studentData.profile.session}</p>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <FiClock className="w-5 h-5 mr-2" />
          Today's Classes
        </h2>
        <div className="space-y-4">
          {studentData.todaySchedule.map((classItem, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-2 h-12 bg-primary-500 rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{classItem.subject}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{classItem.teacher} • Room {classItem.room}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">{classItem.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200 text-left group relative"
              >
                {action.count && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {action.count}
                  </span>
                )}
                <div className={`w-10 h-10 ${action.color} text-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const AcademicsTab = () => (
    <div className="space-y-8">
      {/* Recent Grades */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Grades</h2>
          <button className="btn btn-outline px-4 py-2">
            <FiEye className="w-4 h-4 mr-2" />
            View All Results
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Exam Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Grade</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Marks</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {studentData.recentGrades.map((grade, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{grade.subject}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{grade.exam}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${getGradeColor(grade.grade)}`}>
                      {grade.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{grade.marks}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{new Date(grade.date).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Events</h2>
        <div className="space-y-4">
          {studentData.upcomingEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  event.type === 'exam' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
                  event.type === 'assignment' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                  event.type === 'event' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                  'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                }`}>
                  {event.type === 'exam' && <FiAward className="w-5 h-5" />}
                  {event.type === 'assignment' && <FiFileText className="w-5 h-5" />}
                  {event.type === 'event' && <FiCalendar className="w-5 h-5" />}
                  {event.type === 'meeting' && <FiUser className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{event.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Important Notices */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Important Notices</h2>
        <div className="space-y-4">
          {studentData.notices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  notice.priority === 'high' ? 'bg-red-500' :
                  notice.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{notice.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(notice.date).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
                Read More
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Student Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name}! Here's your academic overview.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn btn-outline px-4 py-2">
                <FiDownload className="w-4 h-4 mr-2" />
                Download Report
              </button>
              <button className="btn btn-primary px-4 py-2">
                <FiBarChart2 className="w-4 h-4 mr-2" />
                View Progress
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiUser className="w-4 h-4 mr-2 inline" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('academics')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'academics'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiBook className="w-4 h-4 mr-2 inline" />
              Academics
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'academics' && <AcademicsTab />}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
