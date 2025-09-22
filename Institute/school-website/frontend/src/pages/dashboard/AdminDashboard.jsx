import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiFileText, 
  FiImage, 
  FiCalendar,
  FiAward,
  FiBook,
  FiSettings,
  FiBarChart2,
  FiTrendingUp,
  FiUserPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
  FiDownload,
  FiUpload,
  FiSearch,
  FiFilter,
  FiMoreVertical
} from 'react-icons/fi';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ManagementCommitteeManager from '../../components/admin/ManagementCommitteeManager';
import InstitutionSettingsManager from '../../components/admin/InstitutionSettingsManager';
import EventManager from '../../components/dashboard/EventManager';
import ContentManager from '../../components/dashboard/ContentManager';
import GalleryManager from '../../components/dashboard/GalleryManager';
import NoticeManager from '../../components/dashboard/NoticeManager';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Mock admin data - replace with real API calls
  const dashboardStats = {
    totalStudents: 2450,
    totalTeachers: 145,
    totalNotices: 28,
    totalEvents: 12,
    recentActivities: [
      { id: 1, type: 'notice', title: 'New exam schedule published', time: '2 hours ago', user: 'Admin' },
      { id: 2, type: 'student', title: 'New student admission', time: '4 hours ago', user: 'Admission Office' },
      { id: 3, type: 'teacher', title: 'Teacher profile updated', time: '6 hours ago', user: 'HR Department' },
      { id: 4, type: 'result', title: 'Class 10 results published', time: '1 day ago', user: 'Academic Office' }
    ],
    monthlyStats: {
      studentsGrowth: 5.2,
      teachersGrowth: 2.1,
      noticesPublished: 15,
      eventsCompleted: 8
    }
  };

  const quickActions = [
    { 
      title: 'Create Notice', 
      description: 'Publish new announcements', 
      icon: FiFileText, 
      color: 'bg-blue-500', 
      action: () => navigate('/admin/notices/create')
    },
    { 
      title: 'Add Teacher', 
      description: 'Register new teaching staff', 
      icon: FiUserPlus, 
      color: 'bg-green-500', 
      action: () => navigate('/admin/teachers/add')
    },
    { 
      title: 'Upload Gallery', 
      description: 'Add photos and videos', 
      icon: FiUpload, 
      color: 'bg-purple-500', 
      action: () => navigate('/admin/gallery/upload')
    },
    { 
      title: 'Manage Results', 
      description: 'Publish exam results', 
      icon: FiAward, 
      color: 'bg-yellow-500', 
      action: () => navigate('/admin/results')
    }
  ];

  const managementSections = [
    { 
      title: 'Notice Management', 
      description: 'Create, edit, and manage all notices', 
      icon: FiFileText, 
      count: dashboardStats.totalNotices,
      path: '/admin/notices',
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      title: 'User Management', 
      description: 'Manage teachers, students, and staff', 
      icon: FiUsers, 
      count: dashboardStats.totalTeachers + dashboardStats.totalStudents,
      path: '/admin/users',
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      title: 'Gallery Management', 
      description: 'Manage photos and videos', 
      icon: FiImage, 
      count: 156,
      path: '/admin/gallery',
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      title: 'Academic Management', 
      description: 'Routines, results, and syllabus', 
      icon: FiBook, 
      count: 24,
      path: '/admin/academics',
      color: 'text-orange-600 dark:text-orange-400'
    },
    { 
      title: 'Management Committee', 
      description: 'Manage committee members', 
      icon: FiUsers, 
      count: null,
      path: '/admin/management-committee',
      color: 'text-red-600 dark:text-red-400'
    },
    { 
      title: 'Institution Settings', 
      description: 'Configure school information', 
      icon: FiSettings, 
      count: null,
      path: '/admin/settings',
      color: 'text-gray-600 dark:text-gray-400'
    },
    { 
      title: 'Reports & Analytics', 
      description: 'View detailed reports and statistics', 
      icon: FiBarChart2, 
      count: null,
      path: '/admin/reports',
      color: 'text-indigo-600 dark:text-indigo-400'
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalStudents.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <FiTrendingUp className="w-4 h-4 mr-1" />
                +{dashboardStats.monthlyStats.studentsGrowth}% this month
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teachers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalTeachers}</p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <FiTrendingUp className="w-4 h-4 mr-1" />
                +{dashboardStats.monthlyStats.teachersGrowth}% this month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Notices</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalNotices}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                {dashboardStats.monthlyStats.noticesPublished} published this month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
              <FiFileText className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Events</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalEvents}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center mt-1">
                {dashboardStats.monthlyStats.eventsCompleted} completed this month
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
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
                onClick={action.action}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200 text-left group"
              >
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

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
          <button className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {dashboardStats.recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'notice' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                activity.type === 'student' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                activity.type === 'teacher' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' :
                'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
              }`}>
                {activity.type === 'notice' && <FiFileText className="w-5 h-5" />}
                {activity.type === 'student' && <FiUsers className="w-5 h-5" />}
                {activity.type === 'teacher' && <FiUsers className="w-5 h-5" />}
                {activity.type === 'result' && <FiAward className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">by {activity.user} • {activity.time}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FiMoreVertical className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const ManagementTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {managementSections.map((section, index) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-soft-lg transition-all duration-200 group cursor-pointer"
            onClick={() => navigate(section.path)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${section.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              {section.count !== null && (
                <span className="badge badge-primary">{section.count}</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {section.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {section.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name}! Here's what's happening at your school.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn btn-outline px-4 py-2">
                <FiDownload className="w-4 h-4 mr-2" />
                Export Data
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-1 overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiBarChart2 className="w-4 h-4 mr-2 inline" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'management'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiSettings className="w-4 h-4 mr-2 inline" />
              Management
            </button>
            <button
              onClick={() => setActiveTab('committee')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'committee'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiUsers className="w-4 h-4 mr-2 inline" />
              Committee
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiCalendar className="w-4 h-4 mr-2 inline" />
              Events
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'content'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiFileText className="w-4 h-4 mr-2 inline" />
              Content
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiImage className="w-4 h-4 mr-2 inline" />
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'notices'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiFileText className="w-4 h-4 mr-2 inline" />
              Notices
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiSettings className="w-4 h-4 mr-2 inline" />
              Institution
            </button>
            </div>
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
          {activeTab === 'management' && <ManagementTab />}
          {activeTab === 'committee' && <ManagementCommitteeManager />}
          {activeTab === 'events' && <EventManager />}
          {activeTab === 'content' && <ContentManager />}
          {activeTab === 'gallery' && <GalleryManager />}
          {activeTab === 'notices' && <NoticeManager />}
          {activeTab === 'settings' && <InstitutionSettingsManager />}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
