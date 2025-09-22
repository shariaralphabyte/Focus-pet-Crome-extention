import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUpload,
  FiX,
  FiSave,
  FiEye
} from 'react-icons/fi';

import {
  fetchManagementCommittee,
  createManagementCommitteeMember,
  updateManagementCommitteeMember,
  deleteManagementCommitteeMember,
  clearError
} from '../../store/slices/managementCommitteeSlice';

const ManagementCommitteeManager = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const {
    members,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    error
  } = useSelector(state => state.managementCommittee);

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: { en: '', bn: '' },
    position: { en: '', bn: '' },
    qualification: { en: '', bn: '' },
    experience: { en: '', bn: '' },
    bio: { en: '', bn: '' },
    contactInfo: {
      email: '',
      phone: '',
      address: { en: '', bn: '' }
    },
    category: 'administrative',
    joinDate: '',
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchManagementCommittee());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const resetForm = () => {
    setFormData({
      name: { en: '', bn: '' },
      position: { en: '', bn: '' },
      qualification: { en: '', bn: '' },
      experience: { en: '', bn: '' },
      bio: { en: '', bn: '' },
      contactInfo: {
        email: '',
        phone: '',
        address: { en: '', bn: '' }
      },
      category: 'administrative',
      joinDate: '',
      isActive: true
    });
    setEditingMember(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMember) {
        await dispatch(updateManagementCommitteeMember({
          id: editingMember._id,
          data: formData
        })).unwrap();
        toast.success(currentLang === 'bn' ? 'সদস্য সফলভাবে আপডেট হয়েছে' : 'Member updated successfully');
      } else {
        await dispatch(createManagementCommitteeMember(formData)).unwrap();
        toast.success(currentLang === 'bn' ? 'নতুন সদস্য যোগ করা হয়েছে' : 'New member added successfully');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error || 'Operation failed');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      qualification: member.qualification,
      experience: member.experience,
      bio: member.bio,
      contactInfo: member.contactInfo,
      category: member.category,
      joinDate: member.joinDate ? member.joinDate.split('T')[0] : '',
      isActive: member.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(currentLang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      try {
        await dispatch(deleteManagementCommitteeMember(id)).unwrap();
        toast.success(currentLang === 'bn' ? 'সদস্য মুছে ফেলা হয়েছে' : 'Member deleted successfully');
      } catch (error) {
        toast.error(error || 'Delete failed');
      }
    }
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {currentLang === 'bn' ? 'ব্যবস্থাপনা কমিটি' : 'Management Committee'}
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'নতুন সদস্য যোগ করুন' : 'Add New Member'}</span>
        </button>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members?.map((member) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {member.name?.[currentLang] || member.name?.en}
                  </h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 truncate">
                    {member.position?.[currentLang] || member.position?.en}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <FiMail className="w-4 h-4 mr-2" />
                  <span className="truncate">{member.contactInfo?.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <FiPhone className="w-4 h-4 mr-2" />
                  <span>{member.contactInfo?.phone}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 btn btn-outline btn-sm flex items-center justify-center space-x-1"
                >
                  <FiEdit2 className="w-3 h-3" />
                  <span>{currentLang === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                </button>
                <button
                  onClick={() => handleDelete(member._id)}
                  className="btn btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-600 hover:text-white p-2"
                >
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingMember 
                      ? (currentLang === 'bn' ? 'সদস্য সম্পাদনা' : 'Edit Member')
                      : (currentLang === 'bn' ? 'নতুন সদস্য যোগ' : 'Add New Member')
                    }
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name (English)
                    </label>
                    <input
                      type="text"
                      value={formData.name.en}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, en: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      নাম (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={formData.name.bn}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, bn: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Position Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position (English)
                    </label>
                    <input
                      type="text"
                      value={formData.position.en}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        position: { ...prev.position, en: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      পদবী (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={formData.position.bn}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        position: { ...prev.position, bn: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-outline"
                  >
                    {currentLang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || updateLoading}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>
                      {(createLoading || updateLoading) 
                        ? (currentLang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') 
                        : (currentLang === 'bn' ? 'সংরক্ষণ' : 'Save')
                      }
                    </span>
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

export default ManagementCommitteeManager;
