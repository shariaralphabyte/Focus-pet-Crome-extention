import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiAward,
  FiCalendar,
  FiUsers,
  FiShield,
  FiStar,
  FiBriefcase
} from 'react-icons/fi';

import { fetchManagementCommittee, fetchManagementCommitteeStats } from '../store/slices/managementCommitteeSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ManagementCommitteePage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const { members, stats, loading, error } = useSelector(state => state.managementCommittee);

  useEffect(() => {
    dispatch(fetchManagementCommittee({ isActive: true }));
    dispatch(fetchManagementCommitteeStats());
  }, [dispatch]);

  // Static data for fallback (keeping for reference)
  const staticCommitteeMembers = [
    {
      id: 1,
      name: currentLang === 'bn' ? 'জনাব মোহাম্মদ রহিম উদ্দিন' : 'Mr. Mohammad Rahim Uddin',
      position: currentLang === 'bn' ? 'সভাপতি' : 'President',
      qualification: currentLang === 'bn' ? 'এম.এ (রাষ্ট্রবিজ্ঞান), এল.এল.বি' : 'M.A (Political Science), LL.B',
      experience: currentLang === 'bn' ? '২৫ বছর' : '25 Years',
      phone: '+880-1711-123456',
      email: 'president@school.edu.bd',
      joinDate: '2010',
      bio: currentLang === 'bn' 
        ? 'একজন অভিজ্ঞ শিক্ষাবিদ এবং সমাজসেবক। শিক্ষা ক্ষেত্রে তার অবদান অপরিসীম।'
        : 'An experienced educationist and social worker with immense contribution to the field of education.',
      category: 'leadership'
    },
    {
      id: 2,
      name: currentLang === 'bn' ? 'প্রফেসর ড. ফাতেমা খাতুন' : 'Professor Dr. Fatema Khatun',
      position: currentLang === 'bn' ? 'প্রধান শিক্ষক' : 'Head Teacher',
      qualification: currentLang === 'bn' ? 'এম.এড, পিএইচ.ডি (শিক্ষা)' : 'M.Ed, Ph.D (Education)',
      experience: currentLang === 'bn' ? '২০ বছর' : '20 Years',
      phone: '+880-1712-234567',
      email: 'headteacher@school.edu.bd',
      joinDate: '2015',
      bio: currentLang === 'bn'
        ? 'শিক্ষা ক্ষেত্রে একজন প্রখ্যাত গবেষক এবং অভিজ্ঞ প্রশাসক।'
        : 'A renowned researcher and experienced administrator in the field of education.',
      category: 'academic'
    },
    {
      id: 3,
      name: currentLang === 'bn' ? 'জনাব আব্দুল করিম' : 'Mr. Abdul Karim',
      position: currentLang === 'bn' ? 'সহ-সভাপতি' : 'Vice President',
      qualification: currentLang === 'bn' ? 'এম.কম (হিসাববিজ্ঞান)' : 'M.Com (Accounting)',
      experience: currentLang === 'bn' ? '১৮ বছর' : '18 Years',
      phone: '+880-1713-345678',
      email: 'vicepresident@school.edu.bd',
      joinDate: '2012',
      bio: currentLang === 'bn'
        ? 'একজন দক্ষ প্রশাসক এবং আর্থিক ব্যবস্থাপনায় অভিজ্ঞ।'
        : 'A skilled administrator with expertise in financial management.',
      category: 'administration'
    },
    {
      id: 4,
      name: currentLang === 'bn' ? 'জনাবা রোকেয়া বেগম' : 'Mrs. Rokeya Begum',
      position: currentLang === 'bn' ? 'সাধারণ সম্পাদক' : 'General Secretary',
      qualification: currentLang === 'bn' ? 'এম.এ (বাংলা)' : 'M.A (Bangla)',
      experience: currentLang === 'bn' ? '১৫ বছর' : '15 Years',
      phone: '+880-1714-456789',
      email: 'secretary@school.edu.bd',
      joinDate: '2018',
      bio: currentLang === 'bn'
        ? 'শিক্ষা ও সংস্কৃতি ক্ষেত্রে একজন নিবেদিতপ্রাণ কর্মী।'
        : 'A dedicated worker in the field of education and culture.',
      category: 'administration'
    },
    {
      id: 5,
      name: currentLang === 'bn' ? 'জনাব মোহাম্মদ আলী' : 'Mr. Mohammad Ali',
      position: currentLang === 'bn' ? 'কোষাধ্যক্ষ' : 'Treasurer',
      qualification: currentLang === 'bn' ? 'বি.কম (ব্যাংকিং)' : 'B.Com (Banking)',
      experience: currentLang === 'bn' ? '১২ বছর' : '12 Years',
      phone: '+880-1715-567890',
      email: 'treasurer@school.edu.bd',
      joinDate: '2020',
      bio: currentLang === 'bn'
        ? 'আর্থিক ব্যবস্থাপনা ও হিসাবরক্ষণে দক্ষ একজন পেশাদার।'
        : 'A professional skilled in financial management and accounting.',
      category: 'finance'
    },
    {
      id: 6,
      name: currentLang === 'bn' ? 'ডঃ মোহাম্মদ হাসান' : 'Dr. Mohammad Hasan',
      position: currentLang === 'bn' ? 'সদস্য (শিক্ষা)' : 'Member (Education)',
      qualification: currentLang === 'bn' ? 'পিএইচ.ডি (গণিত)' : 'Ph.D (Mathematics)',
      experience: currentLang === 'bn' ? '২২ বছর' : '22 Years',
      phone: '+880-1716-678901',
      email: 'dr.hasan@school.edu.bd',
      joinDate: '2016',
      bio: currentLang === 'bn'
        ? 'গণিত বিষয়ে একজন প্রখ্যাত শিক্ষক ও গবেষক।'
        : 'A renowned teacher and researcher in mathematics.',
      category: 'academic'
    }
  ];

  // Dynamic stats from backend or fallback to static
  const committeeStats = [
    {
      icon: FiUsers,
      number: stats?.totalMembers || members?.length || '12',
      label: currentLang === 'bn' ? 'মোট সদস্য' : 'Total Members',
      color: 'text-blue-600'
    },
    {
      icon: FiCalendar,
      number: '2020',
      label: currentLang === 'bn' ? 'গঠিত' : 'Formed',
      color: 'text-green-600'
    },
    {
      icon: FiAward,
      number: '15+',
      label: currentLang === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years Experience',
      color: 'text-purple-600'
    },
    {
      icon: FiStar,
      number: '100%',
      label: currentLang === 'bn' ? 'নিবেদিতপ্রাণ' : 'Dedicated',
      color: 'text-orange-600'
    }
  ];

  // Use dynamic data if available, otherwise fallback to static
  const displayMembers = members && members.length > 0 ? members : staticCommitteeMembers;

  const responsibilities = [
    {
      title: currentLang === 'bn' ? 'নীতি নির্ধারণ' : 'Policy Making',
      description: currentLang === 'bn' 
        ? 'প্রতিষ্ঠানের শিক্ষানীতি ও কর্মপরিকল্পনা প্রণয়ন'
        : 'Formulating institutional education policies and action plans',
      icon: FiShield
    },
    {
      title: currentLang === 'bn' ? 'আর্থিক তত্ত্বাবধান' : 'Financial Oversight',
      description: currentLang === 'bn'
        ? 'প্রতিষ্ঠানের আর্থিক ব্যবস্থাপনা ও বাজেট নিয়ন্ত্রণ'
        : 'Managing institutional finances and budget control',
      icon: FiBriefcase
    },
    {
      title: currentLang === 'bn' ? 'শিক্ষার মান নিয়ন্ত্রণ' : 'Quality Control',
      description: currentLang === 'bn'
        ? 'শিক্ষার মান উন্নয়ন ও পর্যবেক্ষণ'
        : 'Improving and monitoring educational quality',
      icon: FiStar
    },
    {
      title: currentLang === 'bn' ? 'কর্মী নিয়োগ' : 'Staff Recruitment',
      description: currentLang === 'bn'
        ? 'যোগ্য শিক্ষক ও কর্মচারী নিয়োগ প্রদান'
        : 'Recruiting qualified teachers and staff',
      icon: FiUsers
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{currentLang === 'bn' ? 'পরিচালনা কমিটি' : 'Management Committee'} - School Management System</title>
        <meta name="description" content="Meet our dedicated management committee members who guide our institution towards excellence" />
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
              {currentLang === 'bn' ? 'পরিচালনা কমিটি' : 'Management Committee'}
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 leading-relaxed">
              {currentLang === 'bn' 
                ? 'আমাদের প্রতিষ্ঠানের নেতৃত্বে রয়েছেন অভিজ্ঞ ও দক্ষ ব্যক্তিবর্গ'
                : 'Our institution is led by experienced and skilled individuals dedicated to excellence'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Committee Statistics */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {committeeStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-shadow duration-300"
                >
                  <div className={`w-16 h-16 ${stat.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
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

      {/* Committee Members */}
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
              {currentLang === 'bn' ? 'কমিটির সদস্যবৃন্দ' : 'Committee Members'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLang === 'bn'
                ? 'আমাদের প্রতিষ্ঠানের পরিচালনায় নিয়োজিত অভিজ্ঞ ও যোগ্য ব্যক্তিবর্গ'
                : 'Experienced and qualified individuals engaged in managing our institution'
              }
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text={currentLang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUser className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.name?.[currentLang] || member.name?.en || member.name}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2">
                    {member.position?.[currentLang] || member.position?.en || member.position}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {member.qualification?.[currentLang] || member.qualification?.en || member.qualification}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FiAward className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                    <span>{currentLang === 'bn' ? 'অভিজ্ঞতা:' : 'Experience:'} {member.experience?.[currentLang] || member.experience?.en || member.experience}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FiCalendar className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                    <span>{currentLang === 'bn' ? 'যোগদান:' : 'Joined:'} {member.joinDate ? new Date(member.joinDate).getFullYear() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FiPhone className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                    <span>{member.contactInfo?.phone || member.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FiMail className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                    <span>{member.contactInfo?.email || member.email}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {member.bio?.[currentLang] || member.bio?.en || member.bio}
                </p>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Responsibilities Section */}
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
              {currentLang === 'bn' ? 'দায়িত্ব ও কর্তব্য' : 'Responsibilities & Duties'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLang === 'bn'
                ? 'পরিচালনা কমিটির প্রধান দায়িত্ব ও কর্তব্যসমূহ'
                : 'Key responsibilities and duties of the management committee'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {responsibilities.map((responsibility, index) => {
              const Icon = responsibility.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {responsibility.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {responsibility.description}
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

export default ManagementCommitteePage;
