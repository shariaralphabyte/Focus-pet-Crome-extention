import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiImage, 
  FiCalendar,
  FiAward,
  FiBook,
  FiSettings,
  FiBarChart2,
  FiUserPlus,
  FiEdit,
  FiUpload,
  FiDownload
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);

  const getMenuItems = () => {
    const baseItems = [
      { name: t('dashboard.dashboard'), href: '/dashboard', icon: FiHome },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: t('dashboard.overview'), href: '/admin/overview', icon: FiBarChart2 },
        { name: t('notices.notices'), href: '/admin/notices', icon: FiFileText },
        { name: t('teachers.teachers'), href: '/admin/teachers', icon: FiUsers },
        { name: t('students.students'), href: '/admin/students', icon: FiUsers },
        { name: t('gallery.gallery'), href: '/admin/gallery', icon: FiImage },
        { name: t('routines.routines'), href: '/admin/routines', icon: FiCalendar },
        { name: t('results.results'), href: '/admin/results', icon: FiAward },
        { name: t('syllabus.syllabus'), href: '/admin/syllabus', icon: FiBook },
        { name: t('institution.profile'), href: '/admin/institution', icon: FiSettings },
      ];
    }

    if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { name: t('notices.notices'), href: '/teacher/notices', icon: FiFileText },
        { name: t('students.students'), href: '/teacher/students', icon: FiUsers },
        { name: t('routines.routines'), href: '/teacher/routines', icon: FiCalendar },
        { name: t('results.results'), href: '/teacher/results', icon: FiAward },
        { name: t('syllabus.syllabus'), href: '/teacher/syllabus', icon: FiBook },
      ];
    }

    if (user?.role === 'student') {
      return [
        ...baseItems,
        { name: t('notices.notices'), href: '/student/notices', icon: FiFileText },
        { name: t('routines.routines'), href: '/student/routines', icon: FiCalendar },
        { name: t('results.results'), href: '/student/results', icon: FiAward },
        { name: t('syllabus.syllabus'), href: '/student/syllabus', icon: FiBook },
        { name: t('gallery.gallery'), href: '/student/gallery', icon: FiImage },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Sidebar header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {user?.avatar?.url ? (
            <img 
              src={user.avatar.url} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick actions */}
      {user?.role === 'admin' && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {t('dashboard.quickActions')}
          </h4>
          <div className="space-y-1">
            <Link
              to="/admin/notices/create"
              className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiEdit className="w-4 h-4" />
              <span>{t('notices.createNotice')}</span>
            </Link>
            <Link
              to="/admin/teachers/add"
              className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiUserPlus className="w-4 h-4" />
              <span>{t('teachers.addTeacher')}</span>
            </Link>
            <Link
              to="/admin/gallery/upload"
              className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiUpload className="w-4 h-4" />
              <span>{t('gallery.uploadPhoto')}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>School Management System</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
