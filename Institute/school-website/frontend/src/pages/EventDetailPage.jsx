import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiCalendar, 
  FiMapPin, 
  FiUser, 
  FiEye, 
  FiHeart, 
  FiShare2, 
  FiClock,
  FiArrowLeft,
  FiTag,
  FiMessageCircle,
  FiSend,
  FiThumbsUp,
  FiExternalLink
} from 'react-icons/fi';

// Redux actions
import { 
  fetchEventBySlug, 
  addEventComment, 
  clearCurrentEvent,
  fetchRecentEvents 
} from '../store/slices/eventSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const EventDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const { 
    currentEvent: event, 
    recentEvents, 
    loading, 
    error 
  } = useSelector(state => state.events);
  
  const { user } = useSelector(state => state.auth);
  
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const currentLang = i18n.language;

  useEffect(() => {
    if (slug) {
      dispatch(fetchEventBySlug(slug));
      dispatch(fetchRecentEvents(5));
    }
    
    return () => {
      dispatch(clearCurrentEvent());
    };
  }, [dispatch, slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    
    setCommentLoading(true);
    try {
      await dispatch(addEventComment({
        eventId: event._id,
        commentData: { content: comment }
      }));
      setComment('');
      // Refresh event to get updated comments
      dispatch(fetchEventBySlug(slug));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatusColor = (event) => {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    
    if (eventDate > now) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    } else if (eventDate.toDateString() === now.toDateString()) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    
    if (eventDate > now) {
      return currentLang === 'bn' ? 'আসন্ন' : 'Upcoming';
    } else if (eventDate.toDateString() === now.toDateString()) {
      return currentLang === 'bn' ? 'আজ' : 'Today';
    } else {
      return currentLang === 'bn' ? 'সম্পন্ন' : 'Completed';
    }
  };

  const shareEvent = (platform) => {
    const url = window.location.href;
    const title = event?.title?.[currentLang] || event?.title?.en;
    const text = event?.excerpt?.[currentLang] || event?.excerpt?.en;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
      copy: url
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert(currentLang === 'bn' ? 'লিংক কপি করা হয়েছে!' : 'Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {currentLang === 'bn' ? 'ইভেন্ট পাওয়া যায়নি' : 'Event Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || (currentLang === 'bn' ? 'এই ইভেন্টটি খুঁজে পাওয়া যায়নি।' : 'The requested event could not be found.')}
          </p>
          <Link to="/events" className="btn btn-primary">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            {currentLang === 'bn' ? 'ইভেন্টে ফিরে যান' : 'Back to Events'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{event.title?.[currentLang] || event.title?.en} - School Events</title>
        <meta name="description" content={event.excerpt?.[currentLang] || event.excerpt?.en} />
        <meta property="og:title" content={event.title?.[currentLang] || event.title?.en} />
        <meta property="og:description" content={event.excerpt?.[currentLang] || event.excerpt?.en} />
        <meta property="og:image" content={event.featuredImage?.url} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="container-custom py-8">
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/events')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            {currentLang === 'bn' ? 'সকল ইভেন্ট' : 'All Events'}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.article
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
            >
              {/* Featured Image */}
              {event.featuredImage?.url && (
                <div className="relative h-64 md:h-96">
                  <img 
                    src={event.featuredImage.url} 
                    alt={event.title?.[currentLang] || event.title?.en}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <span className={`badge ${getEventStatusColor(event)}`}>
                        {getEventStatus(event)}
                      </span>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="btn btn-ghost btn-sm text-white hover:bg-white/20"
                      >
                        <FiShare2 className="w-4 h-4 mr-2" />
                        {currentLang === 'bn' ? 'শেয়ার' : 'Share'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Content */}
              <div className="p-6 md:p-8">
                {/* Event Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.category && (
                    <div className="flex items-center">
                      <FiTag className="w-4 h-4 mr-2" />
                      <span>{event.category}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FiEye className="w-4 h-4 mr-2" />
                    <span>{event.views || 0} {currentLang === 'bn' ? 'দেখা' : 'views'}</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  {event.title?.[currentLang] || event.title?.en}
                </h1>

                {/* Author and Date */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      <FiUser className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {event.author?.name || (currentLang === 'bn' ? 'প্রশাসক' : 'Admin')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currentLang === 'bn' ? 'প্রকাশিত' : 'Published'}: {formatDate(event.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                      <FiHeart className="w-5 h-5 mr-1" />
                      <span>{event.likes || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: event.content?.[currentLang] || event.content?.en || ''
                  }} />
                </div>

                {/* Event Details */}
                {(event.eventTime || event.venue || event.organizer) && (
                  <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {currentLang === 'bn' ? 'ইভেন্ট বিবরণ' : 'Event Details'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.eventTime && (
                        <div className="flex items-center">
                          <FiClock className="w-5 h-5 mr-3 text-primary-600" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {currentLang === 'bn' ? 'সময়' : 'Time'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">{event.eventTime}</p>
                          </div>
                        </div>
                      )}
                      {event.venue && (
                        <div className="flex items-center">
                          <FiMapPin className="w-5 h-5 mr-3 text-primary-600" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {currentLang === 'bn' ? 'স্থান' : 'Venue'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">{event.venue}</p>
                          </div>
                        </div>
                      )}
                      {event.organizer && (
                        <div className="flex items-center">
                          <FiUser className="w-5 h-5 mr-3 text-primary-600" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {currentLang === 'bn' ? 'আয়োজক' : 'Organizer'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">{event.organizer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.article>

            {/* Comments Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FiMessageCircle className="w-5 h-5 mr-2" />
                {currentLang === 'bn' ? 'মন্তব্য' : 'Comments'} ({event.comments?.length || 0})
              </h3>

              {/* Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={currentLang === 'bn' ? 'আপনার মন্তব্য লিখুন...' : 'Write your comment...'}
                        className="form-input w-full h-24 resize-none"
                        disabled={commentLoading}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!comment.trim() || commentLoading}
                          className="btn btn-primary btn-sm"
                        >
                          {commentLoading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <FiSend className="w-4 h-4 mr-2" />
                              {currentLang === 'bn' ? 'পোস্ট করুন' : 'Post Comment'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {currentLang === 'bn' 
                      ? 'মন্তব্য করতে লগইন করুন'
                      : 'Please login to leave a comment'
                    }
                  </p>
                  <Link to="/login" className="btn btn-primary">
                    {currentLang === 'bn' ? 'লগইন' : 'Login'}
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {event.comments?.length > 0 ? (
                  event.comments.map((comment, index) => (
                    <div key={comment._id || index} className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {comment.author?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {comment.author?.name || (currentLang === 'bn' ? 'অজ্ঞাত ব্যবহারকারী' : 'Anonymous User')}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FiMessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {currentLang === 'bn' 
                        ? 'এখনো কোন মন্তব্য নেই। প্রথম মন্তব্য করুন!'
                        : 'No comments yet. Be the first to comment!'
                      }
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Recent Events */}
              {recentEvents.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {currentLang === 'bn' ? 'সাম্প্রতিক ইভেন্ট' : 'Recent Events'}
                  </h3>
                  <div className="space-y-4">
                    {recentEvents.slice(0, 5).map(recentEvent => (
                      <Link
                        key={recentEvent._id}
                        to={`/events/${recentEvent.slug}`}
                        className="block group"
                      >
                        <div className="flex space-x-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex-shrink-0 overflow-hidden">
                            {recentEvent.featuredImage?.url ? (
                              <img 
                                src={recentEvent.featuredImage.url} 
                                alt={recentEvent.title?.[currentLang] || recentEvent.title?.en}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiCalendar className="w-6 h-6 text-white opacity-50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                              {recentEvent.title?.[currentLang] || recentEvent.title?.en}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(recentEvent.eventDate)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {currentLang === 'bn' ? 'দ্রুত অ্যাকশন' : 'Quick Actions'}
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full btn btn-outline"
                  >
                    <FiShare2 className="w-4 h-4 mr-2" />
                    {currentLang === 'bn' ? 'শেয়ার করুন' : 'Share Event'}
                  </button>
                  <Link to="/events" className="w-full btn btn-primary">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    {currentLang === 'bn' ? 'আরো ইভেন্ট' : 'More Events'}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {currentLang === 'bn' ? 'ইভেন্ট শেয়ার করুন' : 'Share Event'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareEvent('facebook')}
                className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiExternalLink className="w-5 h-5 mr-2" />
                Facebook
              </button>
              <button
                onClick={() => shareEvent('twitter')}
                className="flex items-center justify-center p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                <FiExternalLink className="w-5 h-5 mr-2" />
                Twitter
              </button>
              <button
                onClick={() => shareEvent('linkedin')}
                className="flex items-center justify-center p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <FiExternalLink className="w-5 h-5 mr-2" />
                LinkedIn
              </button>
              <button
                onClick={() => shareEvent('whatsapp')}
                className="flex items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiExternalLink className="w-5 h-5 mr-2" />
                WhatsApp
              </button>
              <button
                onClick={() => shareEvent('copy')}
                className="col-span-2 flex items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiShare2 className="w-5 h-5 mr-2" />
                {currentLang === 'bn' ? 'লিংক কপি করুন' : 'Copy Link'}
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 btn btn-ghost"
            >
              {currentLang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
