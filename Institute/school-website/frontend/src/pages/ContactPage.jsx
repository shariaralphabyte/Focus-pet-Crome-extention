import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock,
  FiSend,
  FiUser,
  FiMessageSquare,
  FiGlobe,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube
} from 'react-icons/fi';

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  
  const [loading, setLoading] = useState(false);

  const contactInfo = {
    address: {
      en: '123 Education Street, Dhanmondi, Dhaka-1205, Bangladesh',
      bn: '১২ৃ শিক্ষা সড়ক, ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ'
    },
    phone: ['+880-2-9611234', '+880-1712-345678'],
    email: ['info@abcschool.edu.bd', 'admission@abcschool.edu.bd'],
    website: 'www.abcschool.edu.bd',
    officeHours: {
      en: 'Sunday - Thursday: 8:00 AM - 4:00 PM',
      bn: 'রবিবার - বৃহস্পতিবার: সকাল ৮:০০ - বিকাল ৪:০০'
    }
  };

  const departments = [
    { id: 'general', name: 'General Inquiry', email: 'info@abcschool.edu.bd' },
    { id: 'admission', name: 'Admission', email: 'admission@abcschool.edu.bd' },
    { id: 'academic', name: 'Academic Affairs', email: 'academic@abcschool.edu.bd' },
    { id: 'accounts', name: 'Accounts & Finance', email: 'accounts@abcschool.edu.bd' },
    { id: 'transport', name: 'Transport', email: 'transport@abcschool.edu.bd' },
    { id: 'complaint', name: 'Complaint', email: 'complaint@abcschool.edu.bd' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: FiFacebook, url: '#', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: FiTwitter, url: '#', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: FiInstagram, url: '#', color: 'hover:text-pink-600' },
    { name: 'YouTube', icon: FiYoutube, url: '#', color: 'hover:text-red-600' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentLang = i18n.language;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('navigation.contact')} - School Management System</title>
        <meta name="description" content="Get in touch with us for admissions, inquiries, and support" />
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('navigation.contact')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're here to help! Get in touch with us for any questions, admissions, or support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('footer.contactInfo')}
              </h2>

              {/* Address */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Address</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {contactInfo.address[currentLang] || contactInfo.address.en}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone</h3>
                  {contactInfo.phone.map((phone, index) => (
                    <p key={index} className="text-gray-600 dark:text-gray-400 text-sm">
                      <a href={`tel:${phone}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {phone}
                      </a>
                    </p>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                  {contactInfo.email.map((email, index) => (
                    <p key={index} className="text-gray-600 dark:text-gray-400 text-sm">
                      <a href={`mailto:${email}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {email}
                      </a>
                    </p>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiClock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Office Hours</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {contactInfo.officeHours[currentLang] || contactInfo.officeHours.en}
                  </p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiGlobe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Website</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <a href={`https://${contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {contactInfo.website}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('footer.followUs')}
              </h3>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 ${social.color} transition-all duration-200 transform hover:scale-105`}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input pl-10"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input pl-10"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Phone and Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input pl-10"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="form-label">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter the subject of your message"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="form-label">
                    Message *
                  </label>
                  <div className="relative">
                    <FiMessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="form-input pl-10 resize-none"
                      placeholder="Enter your message here..."
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <FiSend className="w-5 h-5 mr-2" />
                    )}
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Departments */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Department Contacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-4 hover:shadow-soft-lg transition-shadow duration-300"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {dept.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <a 
                    href={`mailto:${dept.email}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {dept.email}
                  </a>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Find Us
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FiMapPin className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Interactive Map</p>
                <p className="text-sm">
                  Google Maps integration would be implemented here
                </p>
                <p className="text-xs mt-2 text-gray-400">
                  Location: 123 Education Street, Dhanmondi, Dhaka
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
