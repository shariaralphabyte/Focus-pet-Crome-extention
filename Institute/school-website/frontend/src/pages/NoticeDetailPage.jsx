import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiUser, 
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiDownload,
  FiPrinter,
  FiStar,
  FiClock,
  FiTag
} from 'react-icons/fi';

// Redux actions
import { fetchNoticeById, likeNotice, addComment } from '../store/slices/noticeSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const NoticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  const { currentNotice, loading, error } = useSelector(state => state.notices);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Mock notice data (replace with real API call)
  const mockNotice = {
    _id: id,
    title: 'Final Examination Schedule 2024',
    content: `
      <div>
        <p>We are pleased to announce the final examination schedule for the academic year 2024. All students are requested to prepare accordingly and follow the examination guidelines.</p>
        
        <h3>Important Dates:</h3>
        <ul>
          <li>Examination starts: June 1, 2024</li>
          <li>Examination ends: June 15, 2024</li>
          <li>Result publication: June 30, 2024</li>
        </ul>
        
        <h3>Examination Guidelines:</h3>
        <ol>
          <li>Students must arrive at the examination hall 30 minutes before the exam starts</li>
          <li>Bring your admit card and student ID card</li>
          <li>Mobile phones and electronic devices are strictly prohibited</li>
          <li>Use only blue or black pen for writing</li>
          <li>Follow the dress code as mentioned in the student handbook</li>
        </ol>
        
        <p>For any queries regarding the examination, please contact the academic office.</p>
        
        <p><strong>Best wishes for your examinations!</strong></p>
      </div>
    `,
    category: 'Academic',
    priority: 'High',
    publishDate: '2024-03-20T10:00:00Z',
    expiryDate: '2024-06-30T23:59:59Z',
    author: {
      name: 'Academic Office',
      designation: 'Academic Coordinator'
    },
    targetAudience: ['Students', 'Teachers', 'Parents'],
    tags: ['examination', 'schedule', 'academic', 'important'],
    attachments: [
      { name: 'Exam_Schedule_2024.pdf', url: '#', size: '245 KB' },
      { name: 'Examination_Guidelines.pdf', url: '#', size: '180 KB' }
    ],
    views: 1245,
    likeCount: 89,
    isLiked: false,
    commentCount: 23,
    comments: [
      {
        id: 1,
        user: { name: 'Ahmed Rahman', avatar: null },
        content: 'Thank you for the detailed schedule. Very helpful!',
        createdAt: '2024-03-20T14:30:00Z',
        replies: []
      },
      {
        id: 2,
        user: { name: 'Fatima Khatun', avatar: null },
        content: 'Can we get the admit cards from the office tomorrow?',
        createdAt: '2024-03-20T16:45:00Z',
        replies: [
          {
            id: 3,
            user: { name: 'Academic Office', avatar: null },
            content: 'Yes, admit cards will be available from tomorrow 9 AM onwards.',
            createdAt: '2024-03-20T17:00:00Z'
          }
        ]
      }
    ],
    isPinned: true
  };

  useEffect(() => {
    if (id) {
      // In a real app, dispatch fetchNoticeById(id)
      // For now, we'll use mock data
    }
  }, [id, dispatch]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like notices');
      return;
    }
    
    try {
      await dispatch(likeNotice(id));
      toast.success(mockNotice.isLiked ? 'Notice unliked' : 'Notice liked');
    } catch (error) {
      toast.error('Failed to update like status');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      await dispatch(addComment({ id, content: comment }));
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockNotice.title,
        text: 'Check out this important notice from our school',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'Medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'High': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Urgent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority] || colors['Medium'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading notice..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notice Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/notices" className="btn btn-primary">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Notices
          </Link>
        </div>
      </div>
    );
  }

  const notice = mockNotice; // Use currentNotice in real implementation

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{notice.title} - School Management System</title>
        <meta name="description" content={notice.content.substring(0, 160)} />
      </Helmet>

      <div className="container-custom py-8">
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            {t('common.back')}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.article
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      {notice.isPinned && (
                        <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                      )}
                      <span className={`badge ${getPriorityColor(notice.priority)}`}>
                        {notice.priority} Priority
                      </span>
                      <span className="badge badge-primary">
                        {notice.category}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {notice.title}
                    </h1>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-2" />
                    <span>{notice.author.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(notice.publishDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiEye className="w-4 h-4 mr-2" />
                    <span>{notice.views} views</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="w-4 h-4 mr-2" />
                    <span>Valid until {new Date(notice.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 mt-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      notice.isLiked
                        ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiHeart className={`w-4 h-4 ${notice.isLiked ? 'fill-current' : ''}`} />
                    <span>{notice.likeCount}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <FiShare2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    <FiPrinter className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: notice.content }}
                />

                {/* Attachments */}
                {notice.attachments && notice.attachments.length > 0 && (
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                      Attachments
                    </h3>
                    <div className="space-y-2">
                      {notice.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FiDownload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{attachment.size}</p>
                            </div>
                          </div>
                          <button className="btn btn-outline btn-sm">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {notice.tags && notice.tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <FiTag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {notice.tags.map((tag, index) => (
                        <span key={index} className="badge bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FiMessageCircle className="w-5 h-5 mr-2" />
                  Comments ({notice.commentCount})
                </h3>

                {/* Comment Form */}
                {isAuthenticated ? (
                  <form onSubmit={handleComment} className="mb-8">
                    <div className="flex space-x-4">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Write a comment..."
                          rows={3}
                          className="form-input resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            type="submit"
                            disabled={submittingComment || !comment.trim()}
                            className="btn btn-primary px-4 py-2 disabled:opacity-50"
                          >
                            {submittingComment ? (
                              <LoadingSpinner size="sm" color="white" />
                            ) : (
                              'Post Comment'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Please login to post comments
                    </p>
                    <Link to="/login" className="btn btn-primary">
                      Login
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {notice.comments.map((comment) => (
                    <div key={comment.id} className="space-y-4">
                      <div className="flex space-x-4">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                            {comment.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {comment.user.name}
                              </h4>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                          </div>
                          
                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-6 mt-4 space-y-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex space-x-4">
                                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">
                                      {reply.user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                          {reply.user.name}
                                        </h5>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          {formatDate(reply.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-gray-700 dark:text-gray-300 text-sm">{reply.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 sticky top-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notice Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Author</p>
                  <p className="font-medium text-gray-900 dark:text-white">{notice.author.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notice.author.designation}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target Audience</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {notice.targetAudience.map((audience, index) => (
                      <span key={index} className="badge badge-primary text-xs">
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(notice.publishDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Valid Until</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(notice.expiryDate)}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Views</span>
                    <span className="font-medium">{notice.views}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>Likes</span>
                    <span className="font-medium">{notice.likeCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>Comments</span>
                    <span className="font-medium">{notice.commentCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailPage;
