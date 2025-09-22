import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiImage, 
  FiVideo, 
  FiSearch, 
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiEye,
  FiDownload,
  FiShare2,
  FiHeart,
  FiPlay
} from 'react-icons/fi';

// Redux actions
import { fetchGallery } from '../store/slices/gallerySlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const GalleryPage = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  const { photos, videos, loading, error } = useSelector(state => state.gallery);
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock gallery data
  const mockPhotos = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300',
      title: 'Annual Sports Day 2024',
      description: 'Students participating in various sports activities during our annual sports day celebration.',
      category: 'Sports',
      date: '2024-02-15',
      views: 245,
      likes: 32
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300',
      title: 'Science Fair Exhibition',
      description: 'Students showcasing their innovative science projects at the annual science fair.',
      category: 'Academic',
      date: '2024-01-20',
      views: 189,
      likes: 28
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      title: 'Cultural Program',
      description: 'Traditional dance performance by our talented students during the cultural program.',
      category: 'Cultural',
      date: '2024-03-10',
      views: 312,
      likes: 45
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300',
      title: 'Graduation Ceremony',
      description: 'HSC students celebrating their graduation with teachers and parents.',
      category: 'Ceremony',
      date: '2024-04-05',
      views: 428,
      likes: 67
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300',
      title: 'Computer Lab Session',
      description: 'Students learning programming and computer skills in our modern computer laboratory.',
      category: 'Academic',
      date: '2024-01-15',
      views: 156,
      likes: 23
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300',
      title: 'Library Reading Session',
      description: 'Students engaged in reading and research activities in our well-equipped library.',
      category: 'Academic',
      date: '2024-02-28',
      views: 198,
      likes: 31
    },
    {
      id: 7,
      url: 'https://images.unsplash.com/photo-1581726690015-c9861fa5057f?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1581726690015-c9861fa5057f?w=300',
      title: 'Art Competition',
      description: 'Creative artwork displayed during the inter-class art competition.',
      category: 'Cultural',
      date: '2024-03-22',
      views: 267,
      likes: 39
    },
    {
      id: 8,
      url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=300',
      title: 'Morning Assembly',
      description: 'Daily morning assembly with students and teachers in the school courtyard.',
      category: 'Daily Life',
      date: '2024-04-01',
      views: 134,
      likes: 19
    }
  ];

  const mockVideos = [
    {
      id: 1,
      thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300',
      title: 'School Annual Day 2024',
      description: 'Complete coverage of our annual day celebration with performances and speeches.',
      category: 'Events',
      date: '2024-03-15',
      duration: '15:32',
      views: 1245,
      likes: 89
    },
    {
      id: 2,
      thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300',
      title: 'Science Experiment Demo',
      description: 'Physics teacher demonstrating interesting experiments in the laboratory.',
      category: 'Academic',
      date: '2024-02-10',
      duration: '8:45',
      views: 567,
      likes: 43
    },
    {
      id: 3,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      title: 'Traditional Dance Performance',
      description: 'Students performing traditional Bengali dance at the cultural program.',
      category: 'Cultural',
      date: '2024-03-08',
      duration: '6:20',
      views: 892,
      likes: 76
    },
    {
      id: 4,
      thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300',
      title: 'Principal\'s Speech',
      description: 'Inspiring speech by our principal at the graduation ceremony.',
      category: 'Ceremony',
      date: '2024-04-05',
      duration: '12:15',
      views: 678,
      likes: 54
    }
  ];

  const [displayPhotos, setDisplayPhotos] = useState(mockPhotos);
  const [displayVideos, setDisplayVideos] = useState(mockVideos);

  const categories = ['all', 'Academic', 'Sports', 'Cultural', 'Ceremony', 'Events', 'Daily Life'];

  useEffect(() => {
    // Filter photos based on search and category
    let filtered = mockPhotos;
    
    if (searchTerm) {
      filtered = filtered.filter(photo => 
        photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(photo => photo.category === selectedCategory);
    }
    
    setDisplayPhotos(filtered);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    // Filter videos based on search and category
    let filtered = mockVideos;
    
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }
    
    setDisplayVideos(filtered);
  }, [searchTerm, selectedCategory]);

  const openLightbox = (media, index) => {
    setSelectedMedia(media);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
    setCurrentIndex(0);
  };

  const navigateMedia = (direction) => {
    const mediaArray = activeTab === 'photos' ? displayPhotos : displayVideos;
    let newIndex = currentIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % mediaArray.length;
    } else {
      newIndex = currentIndex === 0 ? mediaArray.length - 1 : currentIndex - 1;
    }
    
    setCurrentIndex(newIndex);
    setSelectedMedia(mediaArray[newIndex]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('gallery.gallery')} - School Management System</title>
        <meta name="description" content="Explore our school's photo and video gallery showcasing events, activities, and memorable moments" />
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('gallery.gallery')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our collection of memorable moments, events, and activities
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-1">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'photos'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiImage className="w-4 h-4 mr-2 inline" />
              {t('gallery.photoGallery')}
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'videos'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FiVideo className="w-4 h-4 mr-2 inline" />
              {t('gallery.videoGallery')}
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="form-input pl-10 w-full"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input md:w-48"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Gallery Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'photos' ? (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {displayPhotos.length === 0 ? (
                <div className="text-center py-12">
                  <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {t('gallery.noPhotos')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayPhotos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="group cursor-pointer"
                      onClick={() => openLightbox(photo, index)}
                    >
                      <div className="relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 aspect-square">
                        <img
                          src={photo.thumbnail}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center space-x-4 text-white">
                              <div className="flex items-center space-x-1">
                                <FiEye className="w-4 h-4" />
                                <span className="text-sm">{photo.views}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FiHeart className="w-4 h-4" />
                                <span className="text-sm">{photo.likes}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="badge bg-black bg-opacity-50 text-white text-xs">
                            {photo.category}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                          {photo.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(photo.date)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {displayVideos.length === 0 ? (
                <div className="text-center py-12">
                  <FiVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {t('gallery.noVideos')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="group cursor-pointer"
                      onClick={() => openLightbox(video, index)}
                    >
                      <div className="relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 aspect-video">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <FiPlay className="w-8 h-8 text-gray-800 ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="badge bg-black bg-opacity-50 text-white text-xs">
                            {video.duration}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <span className="badge bg-black bg-opacity-50 text-white text-xs">
                            {video.category}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                          {video.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(video.date)}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <FiEye className="w-3 h-3" />
                              <span>{video.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FiHeart className="w-3 h-3" />
                              <span>{video.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedMedia && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <FiX className="w-8 h-8" />
                </button>

                {/* Navigation Buttons */}
                <button
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <FiChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <FiChevronRight className="w-8 h-8" />
                </button>

                {/* Media Content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div className="relative">
                    {activeTab === 'photos' ? (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.title}
                        className="w-full h-auto max-h-[70vh] object-contain"
                      />
                    ) : (
                      <div className="aspect-video bg-gray-900 flex items-center justify-center">
                        <div className="text-center text-white">
                          <FiPlay className="w-16 h-16 mx-auto mb-4" />
                          <p>Video Player</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Duration: {selectedMedia.duration}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Media Info */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedMedia.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {selectedMedia.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-4 h-4" />
                          <span>{formatDate(selectedMedia.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiEye className="w-4 h-4" />
                          <span>{selectedMedia.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiHeart className="w-4 h-4" />
                          <span>{selectedMedia.likes} likes</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <FiDownload className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <FiShare2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalleryPage;
