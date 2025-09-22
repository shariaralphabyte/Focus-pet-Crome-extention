import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchNotices } from '../../store/slices/noticeSlice';
import { fetchEvents } from '../../store/slices/eventSlice';
import { fetchGallery } from '../../store/slices/gallerySlice';
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
  const location = useLocation();
  
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchNotices());
    dispatch(fetchEvents());
    dispatch(fetchGallery());
  }, [dispatch]);

  // Real data from Redux store
  const { notices } = useSelector(state => state.notices || { notices: [] });
  const { events } = useSelector(state => state.events || { events: [] });
  const { gallery } = useSelector(state => state.gallery || { gallery: [] });
  
  const dashboardStats = {
    totalNotices: notices?.length || 0,
    totalEvents: events?.length || 0,
    totalGalleryItems: gallery?.length || 0,
    activeNotices: notices?.filter(notice => notice.isActive)?.length || 0
  };

  const quickActions = [
    { 
      title: 'Manage Notices', 
      description: 'Create and manage notices', 
      icon: FiFileText, 
      color: 'bg-blue-500', 
      action: () => navigate('/admin/notices')
    },
    { 
      title: 'Manage Events', 
      description: 'Create and manage events', 
      icon: FiCalendar, 
      color: 'bg-green-500', 
      action: () => navigate('/admin/events')
    },
    { 
      title: 'Manage Gallery', 
      description: 'Upload and organize media', 
      icon: FiImage, 
      color: 'bg-purple-500', 
      action: () => navigate('/admin/gallery')
    },
    { 
      title: 'Institution Settings', 
      description: 'Configure school information', 
      icon: FiSettings, 
      color: 'bg-yellow-500', 
      action: () => navigate('/admin/institution')
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
      title: 'Event Management', 
      description: 'Manage school events and activities', 
      icon: FiCalendar, 
      count: dashboardStats.totalEvents,
      path: '/admin/events',
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      title: 'Gallery Management', 
      description: 'Manage photos and videos', 
      icon: FiImage, 
      count: dashboardStats.totalGalleryItems,
      path: '/admin/gallery',
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      title: 'Content Management', 
      description: 'Manage homepage content and slides', 
      icon: FiEdit, 
      count: null,
      path: '/admin/content',
      color: 'text-orange-600 dark:text-orange-400'
    },
    { 
      title: 'Management Committee', 
      description: 'Manage committee members', 
      icon: FiUsers, 
      count: null,
      path: '/admin/committee',
      color: 'text-red-600 dark:text-red-400'
    },
    { 
      title: 'Institution Settings', 
      description: 'Configure school information', 
      icon: FiSettings, 
      count: null,
      path: '/admin/institution',
      color: 'text-gray-600 dark:text-gray-400'
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notices</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalNotices}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                {dashboardStats.activeNotices} active notices
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
              <FiFileText className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalEvents}</p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                Upcoming and past events
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gallery Items</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalGalleryItems}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center mt-1">
                Photos and media files
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
              <FiImage className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">Online</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                All systems operational
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center">
              <FiBarChart2 className="w-6 h-6" />
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

      {/* Welcome Message */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Admin Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Use the tabs above to manage different aspects of your school website. Click on any management section to get started.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate('/admin/notices')}
              className="btn btn-primary"
            >
              <FiFileText className="w-4 h-4 mr-2" />
              Manage Notices
            </button>
            <button 
              onClick={() => navigate('/admin/events')}
              className="btn btn-outline"
            >
              <FiCalendar className="w-4 h-4 mr-2" />
              Manage Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        <Routes>
          {/* Admin Overview/Dashboard */}
          <Route path="/" element={<OverviewTab />} />
          <Route path="/overview" element={<OverviewTab />} />
          
          {/* Management Routes */}
          <Route path="/notices" element={<NoticeManager />} />
          <Route path="/events" element={<EventManager />} />
          <Route path="/gallery" element={<GalleryManager />} />
          <Route path="/content" element={<ContentManager />} />
          <Route path="/committee" element={<ManagementCommitteeManager />} />
          <Route path="/institution" element={<InstitutionSettingsManager />} />
          
          {/* Placeholder routes for other sections */}
          <Route path="/teachers" element={<div className="p-6 bg-white dark:bg-gray-800 rounded-lg"><h2 className="text-2xl font-bold mb-4">Teacher Management</h2><p>Teacher management interface coming soon...</p></div>} />
          <Route path="/students" element={<div className="p-6 bg-white dark:bg-gray-800 rounded-lg"><h2 className="text-2xl font-bold mb-4">Student Management</h2><p>Student management interface coming soon...</p></div>} />
          <Route path="/routines" element={<div className="p-6 bg-white dark:bg-gray-800 rounded-lg"><h2 className="text-2xl font-bold mb-4">Class Routines</h2><p>Routine management interface coming soon...</p></div>} />
          <Route path="/results" element={<div className="p-6 bg-white dark:bg-gray-800 rounded-lg"><h2 className="text-2xl font-bold mb-4">Results Management</h2><p>Results management interface coming soon...</p></div>} />
          <Route path="/syllabus" element={<div className="p-6 bg-white dark:bg-gray-800 rounded-lg"><h2 className="text-2xl font-bold mb-4">Syllabus Management</h2><p>Syllabus management interface coming soon...</p></div>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
