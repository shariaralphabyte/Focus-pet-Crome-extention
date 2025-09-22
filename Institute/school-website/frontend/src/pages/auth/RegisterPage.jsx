import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiUserPlus,
  FiArrowLeft,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';

// Redux actions
import { registerUser, clearError } from '../../store/slices/authSlice';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Show error toast
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(t('auth.fullName') + ' is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error(t('auth.emailRequired'));
      return false;
    }
    
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      toast.error(t('auth.emailInvalid'));
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error(t('auth.passwordMinLength'));
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return false;
    }
    
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const result = await dispatch(registerUser(submitData));
      if (result.type === 'auth/register/fulfilled') {
        toast.success(t('auth.registerSuccess'));
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      // Error is handled by the error effect above
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>{t('auth.register')} - School Management System</title>
        <meta name="description" content="Create your account to access the school management system" />
      </Helmet>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
            <div className="w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span>School System</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.createAccount')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join our educational community
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 py-8 px-4 shadow-soft sm:rounded-lg sm:px-10"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name field */}
            <div>
              <label htmlFor="name" className="form-label">
                {t('auth.fullName')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder={t('auth.fullName')}
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="form-label">
                {t('auth.email')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder={t('auth.email')}
                />
              </div>
            </div>

            {/* Phone field */}
            <div>
              <label htmlFor="phone" className="form-label">
                {t('common.phone')} (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder={t('common.phone')}
                />
              </div>
            </div>

            {/* Address field */}
            <div>
              <label htmlFor="address" className="form-label">
                {t('common.address')} (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder={t('common.address')}
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label htmlFor="role" className="form-label">
                {t('auth.role')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="student">{t('common.student')}</option>
                {/* Only allow student registration publicly */}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Only student registration is available. Contact admin for teacher/admin accounts.
              </p>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="form-label">
                {t('auth.password')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input pl-10 pr-10"
                  placeholder={t('auth.password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                {t('auth.confirmPassword')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input pl-10 pr-10"
                  placeholder={t('auth.confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="flex items-center">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex justify-center items-center py-3"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <FiUserPlus className="w-5 h-5 mr-2" />
                    {t('auth.createAccount')}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t('auth.alreadyHaveAccount')}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {t('auth.login')}
              </Link>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              {t('common.back')} {t('common.home')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
