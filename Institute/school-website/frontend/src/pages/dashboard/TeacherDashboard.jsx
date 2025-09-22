import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiFileText, 
  FiCalendar,
  FiAward,
  FiBook,
  FiClock,
  FiTrendingUp,
  FiEdit,
  FiEye,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock teacher data
  const teacherStats = {
    totalStudents: 180,
    totalClasses: 6,
    pendingAssignments: 12,
    completedLessons: 45,
    todayClasses: [
      { time: '8:00-8:45', subject: 'Mathematics', class: 'Class 9A', room: '101' },
      { time: '9:30-10:15', subject: 'Mathematics', class: 'Class 9B', room: '101' },
      { time: '11:15-12:00', subject: 'Higher Math', class: 'Class 10A', room: '102' }
    ],
    recentActivities: [
      { id: 1, type: 'assignment', title: 'Graded Class 9A Mathematics test', time: '2 hours ago' },
      { id: 2, type: 'attendance', title: 'Marked attendance for Class 9B', time: '4 hours ago' },
      { id: 3, type: 'lesson', title: 'Completed Algebra lesson plan', time: '1 day ago' }
    ],
    upcomingTasks: [
      { id: 1, task: 'Prepare Class 10 exam questions', deadline: '2024-04-15', priority: 'high' },
      { id: 2, task: 'Submit monthly progress report', deadline: '2024-04-20', priority: 'medium' },
      { id: 3, task: 'Parent-teacher meeting preparation', deadline: '2024-04-25', priority: 'low' }
    ]
  };

  const quickActions = [
    { 
      title: 'Take Attendance', 
      description: 'Mark student attendance', 
      icon: FiCheckCircle, 
      color: 'bg-green-500',
      count: teacherStats.todayClasses.length
    },
    { 
      title: 'Grade Assignments', 
      description: 'Review and grade submissions', 
      icon: FiAward, 
      color: 'bg-blue-500',
      count: teacherStats.pendingAssignments
    },
    { 
      title: 'Create Notice', 
      description: 'Send announcements to students', 
      icon: FiFileText, 
      color: 'bg-purple-500',
      count: null
    },
    { 
      title: 'Lesson Plans', 
      description: 'Manage teaching materials', 
      icon: FiBook, 
      color: 'bg-orange-500',
      count: null
    }
  ];

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Students</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{teacherStats.totalStudents}</p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <FiTrendingUp className="w-4 h-4 mr-1" />
                Across {teacherStats.totalClasses} classes
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Classes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{teacherStats.todayClasses.length}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Next at {teacherStats.todayClasses[0]?.time}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Assignments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{teacherStats.pendingAssignments}</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Need grading
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center">
              <FiAward className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lessons Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{teacherStats.completedLessons}</p>
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

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <FiClock className="w-5 h-5 mr-2" />
          Today's Schedule
        </h2>
        <div className="space-y-4">
          {teacherStats.todayClasses.map((classItem, index) => (
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{classItem.class} • Room {classItem.room}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">{classItem.time}</p>
                <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  Take Attendance
                </button>
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

  const TasksTab = () => (
    <div className="space-y-8">
      {/* Upcoming Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Tasks</h2>
          <button className="btn btn-primary px-4 py-2">
            <FiPlus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
        <div className="space-y-4">
          {teacherStats.upcomingTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{task.task}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`badge ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {task.priority}
                </span>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FiEdit className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activities</h2>
        <div className="space-y-4">
          {teacherStats.recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'assignment' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                activity.type === 'attendance' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
              }`}>
                {activity.type === 'assignment' && <FiAward className="w-5 h-5" />}
                {activity.type === 'attendance' && <FiCheckCircle className="w-5 h-5" />}
                {activity.type === 'lesson' && <FiBook className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</p>
              </div>
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
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name}! Ready for today's classes?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn btn-outline px-4 py-2">
                <FiEye className="w-4 h-4 mr-2" />
                View Schedule
              </button>
              <button className="btn btn-primary px-4 py-2">
                <FiPlus className="w-4 h-4 mr-2" />
                Quick Add
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
              <FiUsers className="w-4 h-4 mr-2 inline" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiAlertCircle className="w-4 h-4 mr-2 inline" />
              Tasks & Activities
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
          {activeTab === 'tasks' && <TasksTab />}
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
