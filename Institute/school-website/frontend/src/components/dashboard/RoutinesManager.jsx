import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiCalendar, 
  FiClock, 
  FiBook, 
  FiMapPin,
  FiX,
  FiSave,
  FiEye,
  FiFilter,
  FiSearch,
  FiDownload,
  FiCopy
} from 'react-icons/fi';
import { fetchRoutines, createRoutine, updateRoutine, deleteRoutine } from '../../store/slices/routineSlice';
import { fetchActiveClasses } from '../../store/slices/classSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const RoutinesManager = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const currentLang = i18n.language;
  
  const { routines, loading, error } = useSelector(state => state.routines);
  const { activeClasses } = useSelector(state => state.classes);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');

  const [formData, setFormData] = useState({
    title: { en: '', bn: '' },
    class: { en: '', bn: '' },
    section: '',
    academicYear: new Date().getFullYear().toString(),
    type: 'Class',
    semester: 'Annual',
    effectiveFrom: new Date().toISOString().split('T')[0],
    schedule: [],
    status: 'published',
    isActive: true
  });

  // Constants
  const daysOfWeek = [
    { en: 'Sunday', bn: 'রবিবার' },
    { en: 'Monday', bn: 'সোমবার' },
    { en: 'Tuesday', bn: 'মঙ্গলবার' },
    { en: 'Wednesday', bn: 'বুধবার' },
    { en: 'Thursday', bn: 'বৃহস্পতিবার' },
    { en: 'Friday', bn: 'শুক্রবার' },
    { en: 'Saturday', bn: 'শনিবার' }
  ];

  const subjects = [
    { en: 'Mathematics', bn: 'গণিত' },
    { en: 'English', bn: 'ইংরেজি' },
    { en: 'Bangla', bn: 'বাংলা' },
    { en: 'Physics', bn: 'পদার্থবিজ্ঞান' },
    { en: 'Chemistry', bn: 'রসায়ন' },
    { en: 'Biology', bn: 'জীববিজ্ঞান' },
    { en: 'Science', bn: 'বিজ্ঞান' },
    { en: 'Social Science', bn: 'সামাজিক বিজ্ঞান' },
    { en: 'ICT', bn: 'আইসিটি' },
    { en: 'Physical Education', bn: 'শারীরিক শিক্ষা' },
    { en: 'Islamic Studies', bn: 'ইসলাম শিক্ষা' },
    { en: 'Break', bn: 'বিরতি' }
  ];

  const timeSlots = [
    '08:00', '08:45', '09:30', '09:45', '10:30', '11:15', '12:00', '12:45', '13:30', '14:15', '15:00'
  ];

  const sections = ['A', 'B', 'C', 'D'];
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  useEffect(() => {
    dispatch(fetchRoutines());
    dispatch(fetchActiveClasses());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      title: { en: '', bn: '' },
      class: { en: '', bn: '' },
      section: '',
      academicYear: new Date().getFullYear().toString(),
      type: 'Class',
      semester: 'Annual',
      effectiveFrom: new Date().toISOString().split('T')[0],
      schedule: [],
      status: 'published',
      isActive: true
    });
  };

  const handleOpenModal = (routine = null) => {
    if (routine) {
      setEditingRoutine(routine);
      setFormData({
        ...routine,
        effectiveFrom: routine.effectiveFrom ? new Date(routine.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingRoutine(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoutine(null);
    resetForm();
  };

  const addDay = () => {
    const availableDays = daysOfWeek.filter(day => 
      !formData.schedule.some(schedule => schedule.day === day.en)
    );
    
    if (availableDays.length > 0) {
      setFormData({
        ...formData,
        schedule: [
          ...formData.schedule,
          {
            day: availableDays[0].en,
            dayName: availableDays[0],
            periods: []
          }
        ]
      });
    }
  };

  const addPeriod = (dayIndex) => {
    const newSchedule = formData.schedule.map((day, index) => {
      if (index === dayIndex) {
        return {
          ...day,
          periods: [
            ...(day.periods || []),
            {
              periodNumber: (day.periods?.length || 0) + 1,
              startTime: '08:00',
              endTime: '08:45',
              subject: { en: 'Mathematics', bn: 'গণিত' },
              room: { en: '', bn: '' },
              type: 'Regular'
            }
          ]
        };
      }
      return { ...day };
    });
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoutine) {
        await dispatch(updateRoutine({ id: editingRoutine._id, routineData: formData }));
      } else {
        await dispatch(createRoutine(formData));
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving routine:', error);
    }
  };

  const handleDelete = async (routineId) => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      await dispatch(deleteRoutine(routineId));
    }
  };

  const filteredRoutines = routines?.filter(routine => {
    const matchesSearch = !searchTerm || 
      routine.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routine.title?.bn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routine.class?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routine.section?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !filterClass || routine.class?.en === filterClass;
    const matchesSection = !filterSection || routine.section === filterSection;
    
    return matchesSearch && matchesClass && matchesSection;
  }) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Routines Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage class schedules and exam routines</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add New Routine
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search routines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="form-input"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="form-input"
          >
            <option value="">All Sections</option>
            {sections.map(section => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterClass('');
              setFilterSection('');
            }}
            className="btn btn-outline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      )}

      {/* Routines Grid */}
      <div className="grid gap-6">
        {filteredRoutines.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-8 text-center">
            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Routines Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterClass || filterSection 
                ? 'No routines match your current filters.' 
                : 'Start by creating your first routine.'}
            </p>
            <button 
              onClick={() => handleOpenModal()}
              className="btn btn-primary"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create Routine
            </button>
          </div>
        ) : (
          filteredRoutines.map((routine) => (
            <motion.div
              key={routine._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {routine.title?.[currentLang] || routine.title?.en}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiBook className="w-4 h-4" />
                        {routine.class?.[currentLang] || routine.class?.en} - Section {routine.section}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {routine.academicYear} ({routine.type})
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {routine.schedule?.length || 0} days scheduled
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      routine.status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {routine.status}
                    </span>
                    <button
                      onClick={() => setSelectedRoutine(routine)}
                      className="btn btn-outline btn-sm"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(routine)}
                      className="btn btn-outline btn-sm"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(routine._id)}
                      className="btn btn-outline btn-sm text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Quick Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {routine.schedule?.slice(0, 3).map((day, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {day.dayName?.[currentLang] || day.day}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {day.periods?.length || 0} periods
                      </div>
                    </div>
                  ))}
                  {routine.schedule?.length > 3 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      +{routine.schedule.length - 3} more days
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingRoutine ? 'Edit Routine' : 'Add New Routine'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Title (English)</label>
                      <input
                        type="text"
                        value={formData.title.en}
                        onChange={(e) => setFormData({
                          ...formData,
                          title: { ...formData.title, en: e.target.value }
                        })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Title (Bengali)</label>
                      <input
                        type="text"
                        value={formData.title.bn}
                        onChange={(e) => setFormData({
                          ...formData,
                          title: { ...formData.title, bn: e.target.value }
                        })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Class (English)</label>
                      <select
                        value={formData.class.en}
                        onChange={(e) => setFormData({
                          ...formData,
                          class: { ...formData.class, en: e.target.value }
                        })}
                        className="form-input"
                        required
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Class (Bengali)</label>
                      <input
                        type="text"
                        value={formData.class.bn}
                        onChange={(e) => setFormData({
                          ...formData,
                          class: { ...formData.class, bn: e.target.value }
                        })}
                        className="form-input"
                        placeholder="e.g., নবম শ্রেণী"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Section</label>
                      <select
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="form-input"
                        required
                      >
                        <option value="">Select Section</option>
                        {sections.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Academic Year</label>
                      <input
                        type="text"
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="form-input"
                        required
                      >
                        <option value="Class">Class</option>
                        <option value="Exam">Exam</option>
                        <option value="Special">Special</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Effective From</label>
                      <input
                        type="date"
                        value={formData.effectiveFrom}
                        onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Schedule Builder */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule</h4>
                      <button
                        type="button"
                        onClick={addDay}
                        className="btn btn-outline btn-sm"
                        disabled={formData.schedule.length >= 7}
                      >
                        <FiPlus className="w-4 h-4 mr-1" />
                        Add Day
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.schedule.map((day, dayIndex) => (
                        <div key={dayIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <select
                              value={day.day}
                              onChange={(e) => {
                                const dayData = daysOfWeek.find(d => d.en === e.target.value);
                                const newSchedule = formData.schedule.map((d, index) => {
                                  if (index === dayIndex) {
                                    return {
                                      ...d,
                                      day: e.target.value,
                                      dayName: dayData
                                    };
                                  }
                                  return { ...d };
                                });
                                setFormData({ ...formData, schedule: newSchedule });
                              }}
                              className="form-input w-40"
                            >
                              {daysOfWeek.map(d => (
                                <option key={d.en} value={d.en}>{d.en}</option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => addPeriod(dayIndex)}
                                className="btn btn-outline btn-sm"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                              {formData.schedule.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSchedule = formData.schedule.filter((_, index) => index !== dayIndex);
                                    setFormData({ ...formData, schedule: newSchedule });
                                  }}
                                  className="btn btn-outline btn-sm text-red-600"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {day.periods?.map((period, periodIndex) => (
                              <div key={periodIndex} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                  <label className="form-label text-xs">Start</label>
                                  <select
                                    value={period.startTime}
                                    onChange={(e) => {
                                      const newSchedule = formData.schedule.map((day, dIndex) => {
                                        if (dIndex === dayIndex) {
                                          return {
                                            ...day,
                                            periods: day.periods.map((p, pIndex) => {
                                              if (pIndex === periodIndex) {
                                                return { ...p, startTime: e.target.value };
                                              }
                                              return { ...p };
                                            })
                                          };
                                        }
                                        return { ...day };
                                      });
                                      setFormData({ ...formData, schedule: newSchedule });
                                    }}
                                    className="form-input text-sm"
                                  >
                                    {timeSlots.map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="form-label text-xs">End</label>
                                  <select
                                    value={period.endTime}
                                    onChange={(e) => {
                                      const newSchedule = formData.schedule.map((day, dIndex) => {
                                        if (dIndex === dayIndex) {
                                          return {
                                            ...day,
                                            periods: day.periods.map((p, pIndex) => {
                                              if (pIndex === periodIndex) {
                                                return { ...p, endTime: e.target.value };
                                              }
                                              return { ...p };
                                            })
                                          };
                                        }
                                        return { ...day };
                                      });
                                      setFormData({ ...formData, schedule: newSchedule });
                                    }}
                                    className="form-input text-sm"
                                  >
                                    {timeSlots.map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="form-label text-xs">Subject</label>
                                  <select
                                    value={period.subject?.en || ''}
                                    onChange={(e) => {
                                      const selectedSubject = subjects.find(s => s.en === e.target.value);
                                      const newSchedule = formData.schedule.map((day, dIndex) => {
                                        if (dIndex === dayIndex) {
                                          return {
                                            ...day,
                                            periods: day.periods.map((p, pIndex) => {
                                              if (pIndex === periodIndex) {
                                                return { ...p, subject: selectedSubject };
                                              }
                                              return { ...p };
                                            })
                                          };
                                        }
                                        return { ...day };
                                      });
                                      setFormData({ ...formData, schedule: newSchedule });
                                    }}
                                    className="form-input text-sm"
                                  >
                                    {subjects.map(subject => (
                                      <option key={subject.en} value={subject.en}>{subject.en}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="form-label text-xs">Room</label>
                                  <input
                                    type="text"
                                    value={period.room?.en || ''}
                                    onChange={(e) => {
                                      const newSchedule = formData.schedule.map((day, dIndex) => {
                                        if (dIndex === dayIndex) {
                                          return {
                                            ...day,
                                            periods: day.periods.map((p, pIndex) => {
                                              if (pIndex === periodIndex) {
                                                return { 
                                                  ...p, 
                                                  room: {
                                                    en: e.target.value,
                                                    bn: e.target.value
                                                  }
                                                };
                                              }
                                              return { ...p };
                                            })
                                          };
                                        }
                                        return { ...day };
                                      });
                                      setFormData({ ...formData, schedule: newSchedule });
                                    }}
                                    className="form-input text-sm"
                                    placeholder="Room 101"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSchedule = formData.schedule.map((day, dIndex) => {
                                        if (dIndex === dayIndex) {
                                          const filteredPeriods = day.periods.filter((_, index) => index !== periodIndex);
                                          // Renumber periods
                                          const renumberedPeriods = filteredPeriods.map((p, index) => ({
                                            ...p,
                                            periodNumber: index + 1
                                          }));
                                          return {
                                            ...day,
                                            periods: renumberedPeriods
                                          };
                                        }
                                        return { ...day };
                                      });
                                      setFormData({ ...formData, schedule: newSchedule });
                                    }}
                                    className="btn btn-outline btn-sm text-red-600 w-full"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    {editingRoutine ? 'Update Routine' : 'Create Routine'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoutinesManager;
