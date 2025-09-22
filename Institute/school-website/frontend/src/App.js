import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// Redux actions
import { loadUser } from './store/slices/authSlice';
import { setOnlineStatus } from './store/slices/uiSlice';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page components
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NoticePage from './pages/NoticePage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import TeachersPage from './pages/TeachersPage';
import StudentsPage from './pages/StudentsPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ManagementCommitteePage from './pages/ManagementCommitteePage';
import GalleryPage from './pages/GalleryPage';
import RoutinesPage from './pages/RoutinesPage';
import ResultsPage from './pages/ResultsPage';
import SyllabusPage from './pages/SyllabusPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Protected route component
import ProtectedRoute from './components/auth/ProtectedRoute';

// Hooks
import useOnlineStatus from './hooks/useOnlineStatus';
import useTheme from './hooks/useTheme';

function App() {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { isAuthenticated, loading: authLoading, user } = useSelector(state => state.auth);
  const { sidebarOpen } = useSelector(state => state.ui);
  const { mode: themeMode } = useSelector(state => state.theme);
  
  // Custom hooks
  const isOnline = useOnlineStatus();
  useTheme();

  useEffect(() => {
    // Load user if token exists
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(loadUser());
    }
    
    // Set Bengali as default language if no language is set
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (!savedLanguage) {
      i18n.changeLanguage('bn');
    }
  }, [dispatch, isAuthenticated, i18n]);

  useEffect(() => {
    // Update online status
    dispatch(setOnlineStatus(isOnline));
  }, [dispatch, isOnline]);

  useEffect(() => {
    // Set document language and direction
    const currentLang = i18n.language;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    // Add font class for Bengali
    if (currentLang === 'bn') {
      document.body.classList.add('font-bengali');
    } else {
      document.body.classList.remove('font-bengali');
    }
  }, [i18n.language]);

  // Show loading spinner during initial auth check
  if (authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Helmet>
        <title>School Management System</title>
        <meta name="description" content="A comprehensive school management system with bilingual support" />
        <meta name="theme-color" content={themeMode === 'dark' ? '#1f2937' : '#ffffff'} />
      </Helmet>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm z-50">
          You are currently offline. Some features may not be available.
        </div>
      )}

      <div className="flex flex-col min-h-screen">
        {/* Navigation */}
        <Navbar />

        {/* Main content area */}
        <div className="flex flex-1">
          {/* Sidebar for dashboard pages */}
          <AnimatePresence>
            {isAuthenticated && sidebarOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg lg:relative lg:translate-x-0"
              >
                <Sidebar />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <main className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/notices" element={<NoticePage />} />
                <Route path="/notices/:id" element={<NoticeDetailPage />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:slug" element={<EventDetailPage />} />
                <Route path="/management-committee" element={<ManagementCommitteePage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/routines" element={<RoutinesPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/syllabus" element={<SyllabusPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Auth routes */}
                <Route 
                  path="/login" 
                  element={
                    isAuthenticated ? 
                    <Navigate to="/dashboard" replace /> : 
                    <LoginPage />
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    isAuthenticated ? 
                    <Navigate to="/dashboard" replace /> : 
                    <RegisterPage />
                  } 
                />

                {/* Protected dashboard routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/*" 
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/*" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => dispatch({ type: 'ui/setSidebarOpen', payload: false })}
        />
      )}
    </div>
  );
}

export default App;
