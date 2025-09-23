import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiBook, 
  FiDownload, 
  FiEye, 
  FiFileText,
  FiCalendar,
  FiUser,
  FiLayers,
  FiSearch
} from 'react-icons/fi';
import { fetchSyllabus, setFilters } from '../store/slices/syllabusSlice';
import { fetchActiveClasses } from '../store/slices/classSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SyllabusPage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const currentLang = i18n.language;

  const { syllabus, loading, error, filters } = useSelector(state => state.syllabus);
  const { activeClasses } = useSelector(state => state.classes);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    dispatch(fetchActiveClasses());
    dispatch(fetchSyllabus(filters));
  }, [dispatch, filters]);

  const handleSearch = () => {
    const searchParams = {
      ...filters,
      class: selectedClass,
      subject: selectedSubject,
      academicYear: academicYear,
      search: searchTerm
    };
    dispatch(fetchSyllabus(searchParams));
  };

  // Mock syllabus data
  const syllabusData = {
    'Class 6': {
      'Mathematics': {
        chapters: [
          { id: 1, title: 'Number System', topics: ['Natural Numbers', 'Whole Numbers', 'Integers'], duration: '2 weeks' },
          { id: 2, title: 'Basic Operations', topics: ['Addition', 'Subtraction', 'Multiplication', 'Division'], duration: '3 weeks' },
          { id: 3, title: 'Fractions', topics: ['Proper Fractions', 'Improper Fractions', 'Mixed Numbers'], duration: '2 weeks' },
          { id: 4, title: 'Geometry Basics', topics: ['Points and Lines', 'Angles', 'Triangles', 'Quadrilaterals'], duration: '4 weeks' }
        ],
        books: ['Mathematics for Class 6 - NCTB', 'Mathematics Practice Book'],
        assessment: 'Continuous Assessment (40%) + Final Exam (60%)'
      },
      'English': {
        chapters: [
          { id: 1, title: 'Reading Comprehension', topics: ['Story Reading', 'Poem Analysis', 'Information Texts'], duration: '4 weeks' },
          { id: 2, title: 'Grammar', topics: ['Parts of Speech', 'Tenses', 'Sentence Structure'], duration: '6 weeks' },
          { id: 3, title: 'Writing Skills', topics: ['Paragraph Writing', 'Letter Writing', 'Story Writing'], duration: '4 weeks' },
          { id: 4, title: 'Speaking & Listening', topics: ['Pronunciation', 'Conversation', 'Presentation'], duration: '2 weeks' }
        ],
        books: ['English for Today - Class 6', 'English Grammar & Composition'],
        assessment: 'Written (70%) + Oral (20%) + Assignment (10%)'
      },
      'Science': {
        chapters: [
          { id: 1, title: 'Living and Non-living Things', topics: ['Characteristics of Life', 'Classification'], duration: '2 weeks' },
          { id: 2, title: 'Human Body', topics: ['Body Systems', 'Health and Hygiene'], duration: '3 weeks' },
          { id: 3, title: 'Plants', topics: ['Plant Parts', 'Photosynthesis', 'Plant Life Cycle'], duration: '3 weeks' },
          { id: 4, title: 'Matter and Materials', topics: ['States of Matter', 'Properties of Materials'], duration: '2 weeks' }
        ],
        books: ['Science for Class 6 - NCTB', 'Science Activity Book'],
        assessment: 'Theory (50%) + Practical (30%) + Assignment (20%)'
      }
    },
    'Class 7': {
      'Mathematics': {
        chapters: [
          { id: 1, title: 'Rational Numbers', topics: ['Introduction to Rationals', 'Operations on Rationals'], duration: '3 weeks' },
          { id: 2, title: 'Algebra Basics', topics: ['Variables and Constants', 'Simple Equations'], duration: '4 weeks' },
          { id: 3, title: 'Geometry', topics: ['Congruence', 'Construction', 'Perimeter and Area'], duration: '5 weeks' },
          { id: 4, title: 'Data Handling', topics: ['Collection of Data', 'Organization of Data'], duration: '2 weeks' }
        ],
        books: ['Mathematics for Class 7 - NCTB'],
        assessment: 'Continuous Assessment (40%) + Final Exam (60%)'
      }
    }
  };

  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'HSC 1st Year', 'HSC 2nd Year'];
  const subjects = ['All Subjects', 'Mathematics', 'English', 'Bangla', 'Science', 'Social Science', 'ICT', 'Islamic Studies'];

  const currentSyllabus = syllabusData[selectedClass] || {};
  const availableSubjects = Object.keys(currentSyllabus);

  const filteredSubjects = selectedSubject === 'All Subjects' 
    ? availableSubjects 
    : availableSubjects.filter(subject => subject === selectedSubject);

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'English': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Bangla': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Science': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Social Science': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'ICT': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'Islamic Studies': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{t('syllabus.syllabus')} - School Management System</title>
        <meta name="description" content="Access course syllabus, curriculum details, and academic materials" />
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
            {t('syllabus.courseSyllabus')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive curriculum and course materials for all classes and subjects
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="form-label">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="form-input md:w-48"
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="form-input md:w-48"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search topics..."
                    className="form-input pl-10 md:w-48"
                  />
                </div>
              </div>
            </div>
            <button className="btn btn-primary px-6">
              <FiDownload className="w-4 h-4 mr-2" />
              Download All
            </button>
          </div>
        </motion.div>

        {/* Syllabus Content */}
        {filteredSubjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Syllabus Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Syllabus for {selectedClass} is not available yet. Please check back later.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {filteredSubjects.map((subject, subjectIndex) => {
              const subjectData = currentSyllabus[subject];
              return (
                <motion.div
                  key={subject}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: subjectIndex * 0.1, duration: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
                >
                  {/* Subject Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getSubjectColor(subject)}`}>
                          <FiBook className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {subject}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedClass} Curriculum
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-outline px-4 py-2">
                          <FiEye className="w-4 h-4 mr-2" />
                          Preview
                        </button>
                        <button className="btn btn-primary px-4 py-2">
                          <FiDownload className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subject Content */}
                  <div className="p-6">
                    {/* Chapters */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FiLayers className="w-5 h-5 mr-2" />
                        Course Outline
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjectData.chapters.map((chapter, chapterIndex) => (
                          <motion.div
                            key={chapter.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: chapterIndex * 0.1, duration: 0.4 }}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Chapter {chapter.id}: {chapter.title}
                              </h4>
                              <span className="badge bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs">
                                {chapter.duration}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Topics:</p>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {chapter.topics.map((topic, topicIndex) => (
                                  <li key={topicIndex} className="flex items-center">
                                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></span>
                                    {topic}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Books */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FiFileText className="w-5 h-5 mr-2" />
                        Recommended Books
                      </h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <ul className="space-y-2">
                          {subjectData.books.map((book, bookIndex) => (
                            <li key={bookIndex} className="flex items-center text-blue-800 dark:text-blue-200">
                              <FiBook className="w-4 h-4 mr-2" />
                              {book}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Assessment Method */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FiUser className="w-5 h-5 mr-2" />
                        Assessment Method
                      </h3>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <p className="text-green-800 dark:text-green-200">
                          {subjectData.assessment}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Academic Calendar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <FiCalendar className="w-6 h-6 mr-2" />
            Academic Calendar 2024-2025
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">First Term</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">January - March</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Second Term</h3>
              <p className="text-sm text-green-600 dark:text-green-300">April - June</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Third Term</h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">July - September</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Final Term</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300">October - December</p>
            </div>
          </div>
        </motion.div>

        {/* Important Notes */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
            Important Notes:
          </h3>
          <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            <li>• Syllabus may be updated based on curriculum changes from the education board</li>
            <li>• Students are advised to follow the recommended books for better understanding</li>
            <li>• Regular class attendance is mandatory for successful completion of the course</li>
            <li>• Assessment methods may vary for different subjects and classes</li>
            <li>• For any queries regarding syllabus, please contact the respective subject teachers</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default SyllabusPage;
