import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiAward, 
  FiUsers, 
  FiBook, 
  FiTarget,
  FiEye,
  FiHeart,
  FiStar,
  FiTrendingUp,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiSettings,
  FiBarChart2,
  FiUser
} from 'react-icons/fi';

import { fetchInstitutionSettings, fetchInstitutionStatistics } from '../store/slices/institutionSlice';
import { fetchVisionMission } from '../store/slices/contentSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AboutPage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [activeTab, setActiveTab] = useState('overview');

  const { settings: institutionSettings, statistics: institutionStats, loading } = useSelector(state => state.institution);
  const { visionMission, loading: contentLoading } = useSelector(state => state.content);

  useEffect(() => {
    dispatch(fetchInstitutionSettings());
    dispatch(fetchInstitutionStatistics());
    dispatch(fetchVisionMission());
  }, [dispatch]);

  // Dynamic institutional data
  const institutionData = {
    establishment: {
      year: institutionSettings?.establishmentYear || 1985,
      founder: institutionSettings?.founder?.[currentLang] || institutionSettings?.founder?.en || (currentLang === 'bn' ? 'প্রফেসর ড. আব্দুল করিম' : 'Professor Dr. Abdul Karim'),
      location: institutionSettings?.location?.[currentLang] || institutionSettings?.location?.en || (currentLang === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh')
    },
    statistics: [
      { 
        icon: FiCalendar, 
        number: institutionStats?.institution?.yearsOfExcellence ? `${institutionStats.institution.yearsOfExcellence}+` : '38+', 
        label: currentLang === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years of Excellence',
        color: 'text-blue-600'
      },
      { 
        icon: FiUsers, 
        number: institutionStats?.students?.total ? `${institutionStats.students.total.toLocaleString()}+` : '3,250+', 
        label: currentLang === 'bn' ? 'শিক্ষার্থী' : 'Students',
        color: 'text-green-600'
      },
      { 
        icon: FiUsers, 
        number: institutionStats?.teachers?.total ? `${institutionStats.teachers.total}+` : '185+', 
        label: currentLang === 'bn' ? 'শিক্ষক ও কর্মচারী' : 'Faculty & Staff',
        color: 'text-purple-600'
      },
      { 
        icon: FiAward, 
        number: institutionStats?.institution?.successRate ? `${institutionStats.institution.successRate}%` : '98%', 
        label: currentLang === 'bn' ? 'সফলতার হার' : 'Success Rate',
        color: 'text-orange-600'
      },
      { 
        icon: FiStar, 
        number: institutionStats?.institution?.parentRating ? `${institutionStats.institution.parentRating}/5` : '4.9/5', 
        label: currentLang === 'bn' ? 'অভিভাবক রেটিং' : 'Parent Rating',
        color: 'text-red-600'
      },
      { 
        icon: FiTrendingUp, 
        number: institutionStats?.institution?.totalAlumni ? `${institutionStats.institution.totalAlumni.toLocaleString()}+` : '15,000+', 
        label: currentLang === 'bn' ? 'স্নাতক' : 'Alumni',
        color: 'text-indigo-600'
      }
    ],
    accreditation: [
      {
        title: currentLang === 'bn' ? 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড' : 'Secondary & Higher Secondary Education Board',
        status: currentLang === 'bn' ? 'অনুমোদিত' : 'Approved',
        year: '1985'
      },
      {
        title: currentLang === 'bn' ? 'শিক্ষা মন্ত্রণালয়, বাংলাদেশ সরকার' : 'Ministry of Education, Government of Bangladesh',
        status: currentLang === 'bn' ? 'স্বীকৃত' : 'Recognized',
        year: '1987'
      },
      {
        title: currentLang === 'bn' ? 'এমপিও অনুমোদন' : 'MPO Approval',
        status: currentLang === 'bn' ? 'অনুমোদিত' : 'Approved',
        year: '1990'
      }
    ]
  };

  // Academic programs data
  const academicPrograms = [
    {
      level: currentLang === 'bn' ? 'মাধ্যমিক (৬ষ্ঠ-১০ম শ্রেণি)' : 'Secondary (Class 6-10)',
      subjects: currentLang === 'bn' ? 'বাংলা, ইংরেজি, গণিত, বিজ্ঞান, সামাজিক বিজ্ঞান, ধর্ম' : 'Bangla, English, Mathematics, Science, Social Science, Religion',
      students: '1,850'
    },
    {
      level: currentLang === 'bn' ? 'উচ্চ মাধ্যমিক (১১শ-১২শ শ্রেণি)' : 'Higher Secondary (Class 11-12)',
      subjects: currentLang === 'bn' ? 'বিজ্ঞান, ব্যবসায় শিক্ষা, মানবিক' : 'Science, Business Studies, Humanities',
      students: '1,400'
    }
  ];

  // Management committee data
  const managementCommittee = [
    {
      name: currentLang === 'bn' ? 'জনাব মোহাম্মদ রহিম উদ্দিন' : 'Mr. Mohammad Rahim Uddin',
      position: currentLang === 'bn' ? 'সভাপতি' : 'President',
      qualification: currentLang === 'bn' ? 'এম.এ, এল.এল.বি' : 'M.A, LL.B'
    },
    {
      name: currentLang === 'bn' ? 'প্রফেসর ড. ফাতেমা খাতুন' : 'Professor Dr. Fatema Khatun',
      position: currentLang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher',
      qualification: currentLang === 'bn' ? 'এম.এড, পিএইচ.ডি' : 'M.Ed, Ph.D'
    },
    {
      name: currentLang === 'bn' ? 'জনাব আব্দুল করিম' : 'Mr. Abdul Karim',
      position: currentLang === 'bn' ? 'সহ-সভাপতি' : 'Vice President',
      qualification: currentLang === 'bn' ? 'এম.কম' : 'M.Com'
    }
  ];

  // Infrastructure and facilities
  const facilities = [
    {
      name: currentLang === 'bn' ? 'ডিজিটাল লাইব্রেরি' : 'Digital Library',
      description: currentLang === 'bn' ? '১২,০০০+ বই, জার্নাল এবং ই-বুক সংগ্রহ' : '12,000+ books, journals and e-book collection',
      icon: FiBook
    },
    {
      name: currentLang === 'bn' ? 'বিজ্ঞান ল্যাবরেটরি' : 'Science Laboratories',
      description: currentLang === 'bn' ? 'পদার্থবিজ্ঞান, রসায়ন এবং জীববিজ্ঞান ল্যাব' : 'Physics, Chemistry and Biology labs',
      icon: FiSettings
    },
    {
      name: currentLang === 'bn' ? 'কম্পিউটার ল্যাব' : 'Computer Laboratory',
      description: currentLang === 'bn' ? '৬০+ আধুনিক কম্পিউটার এবং হাই-স্পিড ইন্টারনেট' : '60+ modern computers with high-speed internet',
      icon: FiBarChart2
    },
    {
      name: currentLang === 'bn' ? 'অডিটোরিয়াম' : 'Auditorium',
      description: currentLang === 'bn' ? '৬০০ আসন বিশিষ্ট আধুনিক অডিটোরিয়াম' : '600-seat modern auditorium',
      icon: FiUsers
    }
  ];

  // Fallback Vision, Mission, Values (used when dynamic content is not available)
  const fallbackVisionMission = {
    vision: {
      title: currentLang === 'bn' ? 'আমাদের দৃষ্টিভঙ্গি' : 'Our Vision',
      content: currentLang === 'bn' 
        ? 'একটি আদর্শ শিক্ষা প্রতিষ্ঠান হিসেবে দেশের শিক্ষা ক্ষেত্রে অগ্রণী ভূমিকা পালন করা এবং বিশ্বমানের শিক্ষা প্রদানের মাধ্যমে দক্ষ জনশক্তি তৈরি করা।'
        : 'To be a leading educational institution in the country, playing a pioneering role in education and creating skilled human resources through world-class education.'
    },
    mission: {
      title: currentLang === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission',
      content: currentLang === 'bn'
        ? 'মানসম্পন্ন শিক্ষা প্রদান, নৈতিক মূল্যবোধ গঠন, সৃজনশীলতা বিকাশ এবং শিক্ষার্থীদের সর্বাঙ্গীণ উন্নয়নের মাধ্যমে আগামী প্রজন্মকে দেশ ও জাতির সেবায় প্রস্তুত করা।'
        : 'To prepare the next generation for the service of country and nation through quality education, moral development, creativity enhancement and holistic development of students.'
    }
  };

  // Use dynamic vision/mission if available, otherwise use fallback
  const currentVisionMission = visionMission || fallbackVisionMission;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{currentLang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'} - School Management System</title>
        <meta name="description" content="Learn about our school's history, mission, vision, and commitment to educational excellence" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {currentLang === 'bn' ? 'আমাদের প্রতিষ্ঠান সম্পর্কে' : 'About Our Institution'}
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 leading-relaxed">
              {currentLang === 'bn' 
                ? 'মনের বিকাশ, ভবিষ্যৎ গড়া এবং শিক্ষার উৎকর্ষতার মাধ্যমে আগামীর নেতা তৈরি করা'
                : 'Nurturing minds, building futures, and creating tomorrow\'s leaders through excellence in education'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Institution Overview */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {currentLang === 'bn' ? 'প্রতিষ্ঠানের ইতিহাস' : 'Institution History'}
              </h2>
              <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                <p>
                  {currentLang === 'bn' 
                    ? `আমাদের প্রতিষ্ঠান ${institutionData.establishment.year} সালে ${institutionData.establishment.founder} এর নেতৃত্বে প্রতিষ্ঠিত হয়। গত ${new Date().getFullYear() - institutionData.establishment.year}+ বছর ধরে আমরা মানসম্পন্ন শিক্ষা প্রদানে অগ্রণী ভূমিকা পালন করে আসছি।`
                    : `Our institution was established in ${institutionData.establishment.year} under the leadership of ${institutionData.establishment.founder}. For over ${new Date().getFullYear() - institutionData.establishment.year} years, we have been playing a leading role in providing quality education.`
                  }
                </p>
                <p>
                  {currentLang === 'bn'
                    ? 'আমাদের প্রতিষ্ঠানের মূল উদ্দেশ্য হলো শিক্ষার্থীদের মধ্যে জ্ঞান, দক্ষতা এবং নৈতিক মূল্যবোধের সমন্বয়ে একটি সুষম ব্যক্তিত্ব গড়ে তোলা।'
                    : 'The main objective of our institution is to develop a balanced personality among students by combining knowledge, skills and moral values.'
                  }
                </p>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-50 dark:bg-primary-900 rounded-lg">
                  <FiCalendar className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{institutionData.establishment.year}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {currentLang === 'bn' ? 'প্রতিষ্ঠিত' : 'Established'}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <FiMapPin className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{institutionData.establishment.location}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {currentLang === 'bn' ? 'অবস্থান' : 'Location'}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-2xl p-8 shadow-2xl">
                <img 
                  src="/images/school-history.jpg" 
                  alt="School History"
                  className="w-full h-80 object-cover rounded-xl mb-6"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-80 bg-gradient-to-br from-primary-200 to-blue-200 dark:from-primary-800 dark:to-blue-800 rounded-xl mb-6 items-center justify-center">
                  <FiImage className="w-20 h-20 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentLang === 'bn' ? 'আমাদের ঐতিহ্য' : 'Our Heritage'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentLang === 'bn'
                    ? 'দীর্ঘ ৩৮ বছরের ঐতিহ্যবাহী এই প্রতিষ্ঠান হাজারো শিক্ষার্থীর স্বপ্ন পূরণের সাক্ষী।'
                    : 'This traditional institution with a long history of 38 years has witnessed the fulfillment of thousands of students\' dreams.'
                  }
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
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
              {currentLang === 'bn' ? 'আমাদের পরিসংখ্যান' : 'Our Statistics'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLang === 'bn'
                ? 'সংখ্যার মাধ্যমে আমাদের সাফল্যের গল্প'
                : 'Our success story through numbers'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {institutionData.statistics.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-soft hover:shadow-lg transition-shadow duration-300 text-center"
                >
                  <div className={`w-16 h-16 ${stat.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stat.label}
                  </h3>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900 dark:to-blue-900 rounded-2xl p-8 shadow-soft"
            >
              <div className="flex items-center mb-6">
                <FiEye className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentVisionMission?.vision?.title || (currentLang === 'bn' ? 'আমাদের দৃষ্টিভঙ্গি' : 'Our Vision')}
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentVisionMission?.vision?.content || (currentLang === 'bn' ? 'দৃষ্টিভঙ্গি এখনো যোগ করা হয়নি' : 'Vision not yet added')}
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-2xl p-8 shadow-soft"
            >
              <div className="flex items-center mb-6">
                <FiTarget className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentVisionMission?.mission?.title || (currentLang === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission')}
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentVisionMission?.mission?.content || (currentLang === 'bn' ? 'লক্ষ্য এখনো যোগ করা হয়নি' : 'Mission not yet added')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Academic Programs Section */}
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
              {currentLang === 'bn' ? 'একাডেমিক প্রোগ্রাম' : 'Academic Programs'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLang === 'bn'
                ? 'আমাদের বিভিন্ন শাখায় অধ্যয়নের সুযোগ'
                : 'Comprehensive educational opportunities across different streams'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {academicPrograms.map((program, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <FiBook className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {program.level}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  <strong>{currentLang === 'bn' ? 'বিষয়সমূহ:' : 'Subjects:'}</strong> {program.subjects}
                </p>
                <div className="flex items-center text-primary-600 dark:text-primary-400">
                  <FiUsers className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{program.students} {currentLang === 'bn' ? 'শিক্ষার্থী' : 'Students'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditation & Recognition Section */}
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
              {currentLang === 'bn' ? 'স্বীকৃতি ও অনুমোদন' : 'Accreditation & Recognition'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLang === 'bn'
                ? 'সরকারি ও শিক্ষা বোর্ডের স্বীকৃতি'
                : 'Government and educational board recognition'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {institutionData.accreditation.map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl p-6 text-center"
              >
                <FiShield className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center justify-center mb-2">
                  <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-green-600 dark:text-green-400 font-semibold">{item.status}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {currentLang === 'bn' ? 'সাল:' : 'Year:'} {item.year}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Management Committee Section */}
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
              {currentLang === 'bn' ? 'পরিচালনা কমিটি' : 'Management Committee'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLang === 'bn'
                ? 'আমাদের প্রতিষ্ঠানের নেতৃত্বে রয়েছেন অভিজ্ঞ ও দক্ষ ব্যক্তিবর্গ'
                : 'Our institution is led by experienced and skilled individuals'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {managementCommittee.map((member, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUser className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2">
                  {member.position}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {member.qualification}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
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
              {currentLang === 'bn' ? 'আমাদের সুবিধাসমূহ' : 'Our Facilities'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLang === 'bn'
                ? 'আধুনিক সুবিধা এবং অত্যাধুনিক প্রযুক্তি'
                : 'Modern facilities and cutting-edge technology'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {facilities.map((facility, index) => {
              const Icon = facility.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {facility.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {facility.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
