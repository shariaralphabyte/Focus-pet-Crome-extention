import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiUsers, 
  FiFileText, 
  FiCalendar, 
  FiAward,
  FiTrendingUp,
  FiClock,
  FiBell,
  FiActivity,
  FiBook
} from 'react-icons/fi';

// Redux actions
import { loadUser } from '../../store/slices/authSlice';
import { setSidebarOpen } from '../../store/slices/uiSlice';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, loading } = useSelector(state => state.auth);

  useEffect(() => {
    // Open sidebar on dashboard
    dispatch(setSidebarOpen(true));
    
    // Load user data if not already loaded
    if (!user) {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDashboardStats = () => {
    // Mock data - replace with real data from API
    const baseStats = [
      { 
        icon: FiFileText, 
        label: t('notices.notices'), 
        value: '12', 
        change: '+2',
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900'
      },
      { 
        icon: FiCalendar, 
        label: t('dashboard.events'), 
        value: '5', 
        change: '+1',
        color: 'text-green-600 bg-green-100 dark:bg-green-900'
      }
    ];

    if (user?.role === 'admin') {
      return [
        { 
          icon: FiUsers, 
          label: t('students.students'), 
          value: '2,450', 
          change: '+25',
          color: 'text-purple-600 bg-purple-100 dark:bg-purple-900'
        },
        { 
          icon: FiUsers, 
          label: t('teachers.teachers'), 
          value: '145', 
          change: '+3',
          color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900'
        },
        ...baseStats,
        { 
          icon: FiTrendingUp, 
          label: 'Performance', 
          value: '94%', 
          change: '+2%',
          color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900'
        }
      ];
    }

    if (user?.role === 'teacher') {
      return [
        { 
          icon: FiUsers, 
          label: 'My Students', 
          value: '180', 
          change: '+5',
          color: 'text-purple-600 bg-purple-100 dark:bg-purple-900'
        },
        { 
          icon: FiBook, 
          label: 'Classes Today', 
          value: '6', 
          change: '0',
          color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900'
        },
        ...baseStats
      ];
    }

    if (user?.role === 'student') {
      return [
        { 
          icon: FiBook, 
          label: 'Classes Today', 
          value: '7', 
          change: '0',
          color: 'text-purple-600 bg-purple-100 dark:bg-purple-900'
        },
        { 
          icon: FiAward, 
          label: 'Assignments', 
          value: '3', 
          change: '+1',
          color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900'
        },
        ...baseStats
      ];
    }

    return baseStats;
  };

  const getRecentActivities = () => {
    // Mock data - replace with real data from API
    return [
      {
        id: 1,
        type: 'notice',
        title: 'New exam schedule published',
        time: '2 hours ago',
        icon: FiFileText,
        color: 'text-blue-600'
      },
      {
        id: 2,
        type: 'assignment',
        title: 'Mathematics assignment submitted',
        time: '4 hours ago',
        icon: FiAward,
        color: 'text-green-600'
      },
      {
        id: 3,
        type: 'event',
        title: 'Sports day registration open',
        time: '1 day ago',
        icon: FiCalendar,
        color: 'text-purple-600'
      }
    ];
  };

  const stats = getDashboardStats();
  const activities = getRecentActivities();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('dashboard.dashboard')} - School Management System</title>
      </Helmet>

      <div className="p-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getWelcomeMessage()}, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to your {user?.role} dashboard. Here's what's happening today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-soft-lg transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.recentActivity')}
              </h2>
              <FiActivity className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${activity.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <FiClock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.quickActions')}
              </h2>
              <FiBell className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {user?.role === 'admin' && (
                <>
                  <button className="w-full text-left p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    Create New Notice
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    Add New Teacher
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    View Reports
                  </button>
                </>
              )}
              
              {user?.role === 'teacher' && (
                <>
                  <button className="w-full text-left p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    Take Attendance
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    Grade Assignments
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    Create Assignment
                  </button>
                </>
              )}
              
              {user?.role === 'student' && (
                <>
                  <button className="w-full text-left p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    View Today's Classes
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    Check Assignments
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    View Results
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Today's Schedule
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Mathematics</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Room 101</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                9:00 - 10:00 AM
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Physics</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lab 2</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                10:30 - 11:30 AM
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">English</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Room 205</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                12:00 - 1:00 PM
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
