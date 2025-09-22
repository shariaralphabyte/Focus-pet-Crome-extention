import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiYoutube,
  FiHeart
} from 'react-icons/fi';

const Footer = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.about'), href: '/about' },
    { name: t('navigation.notices'), href: '/notices' },
    { name: t('navigation.teachers'), href: '/teachers' },
    { name: t('navigation.gallery'), href: '/gallery' },
    { name: t('navigation.contact'), href: '/contact' },
  ];

  const academicLinks = [
    { name: t('navigation.routines'), href: '/routines' },
    { name: t('navigation.results'), href: '/results' },
    { name: t('navigation.syllabus'), href: '/syllabus' },
    { name: 'Admissions', href: '/admissions' },
    { name: 'Academic Calendar', href: '/calendar' },
    { name: 'Exam Schedule', href: '/exam-schedule' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: FiFacebook, href: '#', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: FiTwitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: FiInstagram, href: '#', color: 'hover:text-pink-600' },
    { name: 'YouTube', icon: FiYoutube, href: '#', color: 'hover:text-red-600' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h3 className="text-xl font-bold text-white">ABC School & College</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A leading educational institution committed to providing quality education 
              and nurturing future leaders with excellence in academics and character development.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <FiMapPin className="w-4 h-4 text-primary-400" />
                <span>123 Education Street, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <FiPhone className="w-4 h-4 text-primary-400" />
                <span>+880-1234-567890</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <FiMail className="w-4 h-4 text-primary-400" />
                <span>info@abcschool.edu.bd</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{t('navigation.academics')}</h4>
            <ul className="space-y-2">
              {academicLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{t('footer.followUs')}</h4>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center 
                      text-gray-400 ${social.color} hover:bg-gray-700 
                      transition-all duration-200 transform hover:scale-105
                    `}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            
            {/* Newsletter signup */}
            <div className="mt-6">
              <h5 className="text-sm font-medium text-white mb-2">Stay Updated</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>{t('footer.copyright')}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <FiHeart className="w-4 h-4 text-red-500" />
              <span>by</span>
              <span className="text-primary-400 font-medium">School Management Team</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                {t('footer.privacyPolicy')}
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
