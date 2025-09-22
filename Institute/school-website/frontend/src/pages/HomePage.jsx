import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiArrowRight, 
  FiUsers, 
  FiAward, 
  FiBook, 
  FiCalendar,
  FiFileText,
  FiImage,
  FiPhone,
  FiMail,
  FiMapPin,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi';

// Redux actions
import { fetchNotices } from '../store/slices/noticeSlice';
import { fetchInstitutionSettings, fetchInstitutionStatistics } from '../store/slices/institutionSlice';
import { fetchHeroSlides } from '../store/slices/contentSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import InlineEditor from '../components/admin/InlineEditor';
import BilingualInlineEditor from '../components/admin/BilingualInlineEditor';

const HomePage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  // Current language for conditional rendering
  const { notices, loading: noticesLoading } = useSelector(state => state.notices);
  const { settings: institutionSettings, statistics: institutionStats } = useSelector(state => state.institution);
  const { heroSlides, loading: contentLoading } = useSelector(state => state.content);
  
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fallback hero slider images (used when dynamic content is not available)
  const fallbackHeroSlides = [
    {
      image: '/images/hero-1.jpg',
      title: {
        en: 'Excellence in Education',
        bn: 'শিক্ষায় উৎকর্ষতা'
      },
      subtitle: {
        en: 'Nurturing minds, building futures',
        bn: 'মন গড়ি, ভবিষ্যৎ গড়ি'
      }
    },
    {
      image: '/images/hero-2.jpg',
      title: {
        en: 'Modern Learning Environment',
        bn: 'আধুনিক শিক্ষা পরিবেশ'
      },
      subtitle: {
        en: 'State-of-the-art facilities for holistic development',
        bn: 'সর্বাঙ্গীণ উন্নয়নের জন্য অত্যাধুনিক সুবিধা'
      }
    },
    {
      image: '/images/hero-3.jpg',
      title: {
        en: 'Empowering Students',
        bn: 'শিক্ষার্থীদের ক্ষমতায়ন'
      },
      subtitle: {
        en: 'Preparing leaders for tomorrow',
        bn: 'আগামীর নেতৃত্ব তৈরি করি'
      }
    }
  ];

  // Use dynamic hero slides if available, otherwise use fallback
  const currentHeroSlides = (heroSlides && Array.isArray(heroSlides) && heroSlides.length > 0) 
    ? heroSlides 
    : fallbackHeroSlides;

  // Dynamic statistics data
  const stats = [
    { 
      icon: FiUsers, 
      number: institutionStats?.students?.total ? `${institutionStats.students.total}+` : '2,500+', 
      label: { en: 'Students', bn: 'শিক্ষার্থী' },
      color: 'text-blue-600'
    },
    { 
      icon: FiUsers, 
      number: institutionStats?.teachers?.total ? `${institutionStats.teachers.total}+` : '150+', 
      label: { en: 'Teachers', bn: 'শিক্ষক' },
      color: 'text-green-600'
    },
    { 
      icon: FiAward, 
      number: institutionStats?.institution?.yearsOfExcellence ? `${institutionStats.institution.yearsOfExcellence}+` : '38+', 
      label: { en: 'Years', bn: 'বছর' },
      color: 'text-purple-600'
    },
    { 
      icon: FiStar, 
      number: institutionStats?.institution?.successRate ? `${institutionStats.institution.successRate}%` : '95%', 
      label: { en: 'Success Rate', bn: 'সফলতার হার' },
      color: 'text-orange-600'
    }
  ];

  // Quick links
  const quickLinks = [
    { 
      icon: FiFileText, 
      title: { en: 'Latest Notices', bn: 'সর্বশেষ নোটিশ' },
      description: { en: 'Stay updated with announcements', bn: 'ঘোষণা সম্পর্কে আপডেট থাকুন' },
      href: '/notices',
      color: 'bg-blue-500'
    },
    { 
      icon: FiCalendar, 
      title: { en: 'Class Routines', bn: 'ক্লাস রুটিন' },
      description: { en: 'View class schedules', bn: 'ক্লাসের সময়সূচি দেখুন' },
      href: '/routines',
      color: 'bg-green-500'
    },
    { 
      icon: FiAward, 
      title: { en: 'Results', bn: 'ফলাফল' },
      description: { en: 'Check exam results', bn: 'পরীক্ষার ফলাফল দেখুন' },
      href: '/results',
      color: 'bg-yellow-500'
    },
    { 
      icon: FiBook, 
      title: { en: 'Syllabus', bn: 'পাঠ্যসূচি' },
      description: { en: 'Download course materials', bn: 'কোর্স উপকরণ ডাউনলোড করুন' },
      href: '/syllabus',
      color: 'bg-purple-500'
    }
  ];

  useEffect(() => {
    dispatch(fetchNotices());
    dispatch(fetchInstitutionSettings());
    dispatch(fetchInstitutionStatistics());
    dispatch(fetchHeroSlides());
  }, [dispatch]);

  useEffect(() => {
    // Auto-slide hero carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentHeroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentHeroSlides.length]);

  const currentLang = i18n.language;

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{t('navigation.home')} - School Management System</title>
        <meta name="description" content="Welcome to our comprehensive school management system with modern facilities and excellent education." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {currentHeroSlides && currentHeroSlides.map((slide, index) => slide && (
          <motion.div
            key={index}
            className={`absolute inset-0 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: index === currentSlide ? 1 : 0,
              scale: index === currentSlide ? 1 : 1.1
            }}
            transition={{ duration: 1 }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})`,
                backgroundColor: '#1f2937' // Fallback color
              }}
            />
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="text-center text-white max-w-4xl mx-auto px-4">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <BilingualInlineEditor
                    value={slide.title}
                    onSave={(newValue) => {
                      // Handle save - you can implement this to update the slide data
                      console.log('Save hero title:', newValue);
                    }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                  >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                      {slide.title?.[currentLang] || slide.title?.en || 'Welcome'}
                    </h1>
                  </BilingualInlineEditor>
                </motion.div>
                <motion.p
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-xl md:text-2xl mb-8 text-gray-200"
                >
                  {slide.excerpt?.[currentLang] || slide.excerpt?.en || slide.subtitle?.[currentLang] || slide.subtitle?.en || 'Excellence in Education'}
                </motion.p>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Link
                    to="/about"
                    className="btn btn-primary px-8 py-3 text-lg"
                  >
                    {t('navigation.about')}
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="btn btn-outline border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg"
                  >
                    {t('navigation.contact')}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {currentHeroSlides && currentHeroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* School Overview Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {currentLang === 'bn' ? 'আমাদের প্রতিষ্ঠান সম্পর্কে' : 'About Our Institution'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {currentLang === 'bn' 
                  ? 'আমাদের স্কুল ১৯৮৫ সাল থেকে মানসম্পন্ন শিক্ষা প্রদান করে আসছে। আমরা শিক্ষার্থীদের সর্বোচ্চ মানের শিক্ষা এবং নৈতিক মূল্যবোধ প্রদানে প্রতিশ্রুতিবদ্ধ।'
                  : 'Our school has been providing quality education since 1985. We are committed to delivering the highest standard of education and moral values to our students.'
                }
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">38+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentLang === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years of Excellence'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">95%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentLang === 'bn' ? 'সফলতার হার' : 'Success Rate'}
                  </div>
                </div>
              </div>
              <Link
                to="/about"
                className="btn btn-primary px-8 py-3"
              >
                {currentLang === 'bn' ? 'আরও জানুন' : 'Learn More'}
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                <img 
                  src="/images/school-building.jpg" 
                  alt="School Building"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-64 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-lg mb-6 items-center justify-center">
                  <FiImage className="w-16 h-16 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentLang === 'bn' ? 'আধুনিক ক্যাম্পাস' : 'Modern Campus'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentLang === 'bn' 
                    ? 'অত্যাধুনিক সুবিধা সহ একটি সুন্দর ক্যাম্পাস যা শেখার জন্য আদর্শ পরিবেশ তৈরি করে।'
                    : 'A beautiful campus with state-of-the-art facilities that create an ideal environment for learning.'
                  }
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4 ${stat.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.number}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {stat.label[currentLang] || stat.label.en}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('dashboard.quickActions')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Access important information and services quickly
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={link.href}
                    className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-soft-lg transform hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${link.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {link.title[currentLang] || link.title.en}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {link.description[currentLang] || link.description.en}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Notices Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t('notices.latestNotices')}
            </h2>
            <Link
              to="/notices"
              className="btn btn-primary"
            >
              {t('notices.allNotices')}
              <FiArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>

          {noticesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading notices..." />
            </div>
          ) : (
            <div className="space-y-4">
              {(notices || []).slice(0, 5).map((notice, index) => (
                <motion.div
                  key={notice._id}
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/notices/${notice._id}`}
                    className="block p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {notice.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {notice.content}
                        </p>
                        <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{new Date(notice.publishDate).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{notice.category}</span>
                        </div>
                      </div>
                      {notice.isPinned && (
                        <div className="ml-4">
                          <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentLang === 'bn' ? 'আমাদের অর্জনসমূহ' : 'Our Achievements'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLang === 'bn' 
                ? 'বছরের পর বছর ধরে আমাদের শিক্ষার্থীরা বিভিন্ন ক্ষেত্রে উল্লেখযোগ্য সাফল্য অর্জন করেছে।'
                : 'Over the years, our students have achieved remarkable success in various fields.'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FiAward,
                title: currentLang === 'bn' ? 'জাতীয় পুরস্কার' : 'National Awards',
                count: '25+',
                description: currentLang === 'bn' ? 'বিভিন্ন প্রতিযোগিতায়' : 'In various competitions'
              },
              {
                icon: FiTrendingUp,
                title: currentLang === 'bn' ? 'পাস রেট' : 'Pass Rate',
                count: '98%',
                description: currentLang === 'bn' ? 'গত ৫ বছরে' : 'Over last 5 years'
              },
              {
                icon: FiUsers,
                title: currentLang === 'bn' ? 'স্নাতক' : 'Graduates',
                count: '5000+',
                description: currentLang === 'bn' ? 'সফল শিক্ষার্থী' : 'Successful students'
              },
              {
                icon: FiStar,
                title: currentLang === 'bn' ? 'রেটিং' : 'Rating',
                count: '4.9/5',
                description: currentLang === 'bn' ? 'অভিভাবকদের মূল্যায়ন' : 'Parent satisfaction'
              }
            ].map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl"
                >
                  <div className="w-16 h-16 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {achievement.count}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {achievement.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentLang === 'bn' ? 'আমাদের সুবিধাসমূহ' : 'Our Facilities'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLang === 'bn' 
                ? 'আধুনিক সুবিধা এবং অত্যাধুনিক প্রযুক্তি সহ একটি সম্পূর্ণ শিক্ষা পরিবেশ।'
                : 'A complete educational environment with modern facilities and cutting-edge technology.'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FiBook,
                title: currentLang === 'bn' ? 'ডিজিটাল লাইব্রেরি' : 'Digital Library',
                description: currentLang === 'bn' ? '১০,০০০+ বই এবং ই-বুক সংগ্রহ' : '10,000+ books and e-book collection'
              },
              {
                icon: FiUsers,
                title: currentLang === 'bn' ? 'স্মার্ট ক্লাসরুম' : 'Smart Classrooms',
                description: currentLang === 'bn' ? 'ইন্টারঅ্যাক্টিভ বোর্ড এবং প্রজেক্টর সহ' : 'With interactive boards and projectors'
              },
              {
                icon: FiCalendar,
                title: currentLang === 'bn' ? 'বিজ্ঞান ল্যাব' : 'Science Labs',
                description: currentLang === 'bn' ? 'পদার্থ, রসায়ন এবং জীববিজ্ঞান ল্যাব' : 'Physics, Chemistry and Biology labs'
              },
              {
                icon: FiImage,
                title: currentLang === 'bn' ? 'কম্পিউটার ল্যাব' : 'Computer Lab',
                description: currentLang === 'bn' ? '৫০+ আধুনিক কম্পিউটার এবং হাই-স্পিড ইন্টারনেট' : '50+ modern computers with high-speed internet'
              },
              {
                icon: FiTrendingUp,
                title: currentLang === 'bn' ? 'খেলার মাঠ' : 'Sports Ground',
                description: currentLang === 'bn' ? 'ফুটবল, ক্রিকেট এবং অন্যান্য খেলার সুবিধা' : 'Football, cricket and other sports facilities'
              },
              {
                icon: FiPhone,
                title: currentLang === 'bn' ? 'অডিটোরিয়াম' : 'Auditorium',
                description: currentLang === 'bn' ? '৫০০ আসন বিশিষ্ট আধুনিক অডিটোরিয়াম' : '500-seat modern auditorium'
              }
            ].map((facility, index) => {
              const Icon = facility.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {facility.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {facility.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('footer.contactInfo')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiMapPin className="w-5 h-5 text-primary-200" />
                  <span>123 Education Street, Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiPhone className="w-5 h-5 text-primary-200" />
                  <span>+880-1234-567890</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiMail className="w-5 h-5 text-primary-200" />
                  <span>info@abcschool.edu.bd</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center lg:text-right"
            >
              <h3 className="text-2xl font-semibold mb-4">
                Ready to Join Us?
              </h3>
              <p className="text-primary-100 mb-6">
                Get in touch to learn more about our programs and admission process.
              </p>
              <Link
                to="/contact"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3"
              >
                {t('navigation.contact')}
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
