import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiInfo, 
  FiFileText, 
  FiUsers, 
  FiImage, 
  FiCalendar,
  FiAward,
  FiBook,
  FiPhone,
  FiLogIn,
  FiUser,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
  FiGlobe
} from 'react-icons/fi';

// Redux actions
import { logoutUser } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { setMobileMenuOpen } from '../../store/slices/uiSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { mode: themeMode } = useSelector(state => state.theme);
  const { mobileMenuOpen } = useSelector(state => state.ui);
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  // Professional navigation structure with grouped items
  const navigationItems = [
    { name: t('navigation.home'), href: '/', icon: FiHome },
    { name: t('navigation.about'), href: '/about', icon: FiInfo },
    { name: t('navigation.notices'), href: '/notices', icon: FiFileText },
    { name: t('navigation.events'), href: '/events', icon: FiCalendar },
  ];

  // Grouped navigation items for dropdowns
  const academicItems = [
    { name: t('navigation.routines'), href: '/routines', icon: FiCalendar },
    { name: t('navigation.results'), href: '/results', icon: FiAward },
    { name: t('navigation.syllabus'), href: '/syllabus', icon: FiBook },
  ];

  const communityItems = [
    { name: t('navigation.teachers'), href: '/teachers', icon: FiUsers },
    { name: t('navigation.students'), href: '/students', icon: FiUsers },
    { name: t('navigation.management'), href: '/management-committee', icon: FiSettings },
    { name: t('navigation.gallery'), href: '/gallery', icon: FiImage },
  ];

  const [academicMenuOpen, setAcademicMenuOpen] = useState(false);
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setUserMenuOpen(false);
      await dispatch(logoutUser());
      navigate('/');
      window.location.reload(); // Force page reload to clear any cached state
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
      window.location.reload();
    }
  };

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLanguageMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="hidden sm:block">School System</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Main navigation items */}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActivePath(item.href)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Academic dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAcademicMenuOpen(!academicMenuOpen);
                  setCommunityMenuOpen(false);
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <FiBook className="w-4 h-4" />
                <span>{t('navigation.academics')}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {academicMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {academicItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setAcademicMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Community dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCommunityMenuOpen(!communityMenuOpen);
                  setAcademicMenuOpen(false);
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <FiUsers className="w-4 h-4" />
                <span>{t('navigation.community')}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {communityMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {communityItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setCommunityMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact link */}
            <Link
              to="/contact"
              className={`
                flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActivePath('/contact')
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <FiPhone className="w-4 h-4" />
              <span>{t('navigation.contact')}</span>
            </Link>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLanguageMenuOpen(!languageMenuOpen);
                }}
                className="flex items-center space-x-1 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Change language"
              >
                <FiGlobe className="w-5 h-5" />
                <span className="text-sm font-medium">{i18n.language.toUpperCase()}</span>
              </button>

              <AnimatePresence>
                {languageMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLanguage('en');
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        i18n.language === 'en' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      🇺🇸 English
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLanguage('bn');
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        i18n.language === 'bn' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      🇧🇩 বাংলা
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu or login button */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Quick logout button for admin */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  title={currentLang === 'bn' ? 'লগআউট' : 'Logout'}
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden md:block">{currentLang === 'bn' ? 'লগআউট' : 'Logout'}</span>
                </button>
                
                <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  {user?.avatar?.url ? (
                    <img 
                      src={user.avatar.url} 
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        <span>{t('navigation.dashboard')}</span>
                      </Link>
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>{currentLang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>{t('common.profile')}</span>
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Logout button clicked');
                          handleLogout();
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                        type="button"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>{currentLang === 'bn' ? 'লগআউট' : 'Logout'}</span>
                      </button>
                      
                      {/* Alternative simple logout link for testing */}
                      <div 
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        🚪 {currentLang === 'bn' ? 'বের হন' : 'Exit'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
              >
                <FiLogIn className="w-4 h-4" />
                <span>{t('auth.login')}</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4"
            >
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => dispatch(setMobileMenuOpen(false))}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                        ${isActivePath(item.href)
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close menus */}
      {(userMenuOpen || languageMenuOpen || academicMenuOpen || communityMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setUserMenuOpen(false);
            setLanguageMenuOpen(false);
            setAcademicMenuOpen(false);
            setCommunityMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
