import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiUser,
  FiMail,
  FiPhone,
  FiCamera,
  FiX,
  FiSave
} from 'react-icons/fi';

const TeachersManager = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  // Safely convert bilingual objects or values to displayable strings
  const textOf = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
      return v[currentLang] || v.en || v.bn || '';
    }
    return v;
  };

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    user: { name: { en: '', bn: '' }, email: '', phone: '' },
    teacherId: '',
    designation: { en: '', bn: '' },
    department: '',
    joiningDate: '',
    employeeType: 'Permanent',
    mpoStatus: 'Non-MPO',
    personalInfo: {
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      maritalStatus: 'Single'
    },
    contactInfo: {
      phone: '',
      email: '',
      address: { present: { en: '', bn: '' } }
    },
    status: 'Active'
  });

  const departments = [
    'Bangla', 'English', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
    'Social Science', 'ICT', 'Physical Education', 'Islamic Studies', 'General'
  ];

  const designations = [
    { en: 'Principal', bn: 'প্রধান শিক্ষক' },
    { en: 'Assistant Head Teacher', bn: 'সহকারী প্রধান শিক্ষক' },
    { en: 'Senior Teacher', bn: 'সিনিয়র শিক্ষক' },
    { en: 'Assistant Teacher', bn: 'সহকারী শিক্ষক' },
    { en: 'Professor', bn: 'অধ্যাপক' }
  ];

  useEffect(() => {
    fetchTeachers();
  }, [searchTerm]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const url = `http://localhost:5001/api/teachers${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    if (selectedImage) {
      submitData.append('photo', selectedImage);
    }
    
    // Add form data as JSON
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'object') {
        submitData.append(key, JSON.stringify(formData[key]));
      } else {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const url = editingTeacher 
        ? `http://localhost:5001/api/teachers/${editingTeacher._id}`
        : 'http://localhost:5001/api/teachers';
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        method: editingTeacher ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (response.ok) {
        handleCloseForm();
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      user: {
        name: {
          en: teacher.user?.name?.en || teacher.user?.name || '',
          bn: teacher.user?.name?.bn || ''
        },
        email: teacher.user?.email || '',
        phone: teacher.user?.phone || ''
      },
      teacherId: teacher.teacherId || '',
      designation: teacher.designation || { en: '', bn: '' },
      department: teacher.department || '',
      joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : '',
      employeeType: teacher.employeeType || 'Permanent',
      mpoStatus: teacher.mpoStatus || 'Non-MPO',
      personalInfo: {
        dateOfBirth: teacher.personalInfo?.dateOfBirth ? new Date(teacher.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
        gender: teacher.personalInfo?.gender || '',
        bloodGroup: teacher.personalInfo?.bloodGroup || '',
        maritalStatus: teacher.personalInfo?.maritalStatus || 'Single'
      },
      contactInfo: {
        phone: teacher.contactInfo?.phone || teacher.user?.phone || '',
        email: teacher.contactInfo?.email || teacher.user?.email || '',
        address: {
          present: {
            en: teacher.contactInfo?.address?.present?.en || '',
            bn: teacher.contactInfo?.address?.present?.bn || ''
          }
        }
      },
      status: teacher.status || 'Active'
    });
    setImagePreview(teacher.personalInfo?.photo?.url ? `http://localhost:5001${teacher.personalInfo.photo.url}` : '');
    setShowForm(true);
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/teachers/${teacherId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          fetchTeachers();
        }
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTeacher(null);
    setFormData({
      user: { name: { en: '', bn: '' }, email: '', phone: '' },
      teacherId: '',
      designation: { en: '', bn: '' },
      department: '',
      joiningDate: '',
      employeeType: 'Permanent',
      mpoStatus: 'Non-MPO',
      personalInfo: {
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        maritalStatus: 'Single'
      },
      contactInfo: {
        phone: '',
        email: '',
        address: { present: { en: '', bn: '' } }
      },
      status: 'Active'
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teachers Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage school teachers and staff</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading teachers...</p>
          </div>
        ) : teachers?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {teacher.personalInfo?.photo?.url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`http://localhost:5001${teacher.personalInfo.photo.url}`}
                              alt={textOf(teacher.user?.name)}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {textOf(teacher.user?.name)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {teacher.teacherId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {textOf(teacher.designation)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {teacher.designation?.bn || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {textOf(teacher.department)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {teacher.user?.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {teacher.user?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        teacher.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No teachers found</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Basic Information</h4>
                    
                    <div>
                      <label className="form-label">Full Name (English)</label>
                      <input
                        type="text"
                        value={formData.user.name.en}
                        onChange={(e) => setFormData({
                          ...formData,
                          user: { ...formData.user, name: { ...formData.user.name, en: e.target.value } }
                        })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Full Name (Bengali)</label>
                      <input
                        type="text"
                        value={formData.user.name.bn}
                        onChange={(e) => setFormData({
                          ...formData,
                          user: { ...formData.user, name: { ...formData.user.name, bn: e.target.value } }
                        })}
                        className="form-input"
                        placeholder="বাংলা নাম"
                      />
                    </div>

                    <div>
                      <label className="form-label">Teacher ID</label>
                      <input
                        type="text"
                        value={formData.teacherId}
                        onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                        className="form-input"
                        placeholder="Auto-generated if empty"
                      />
                    </div>

                    <div>
                      <label className="form-label">Designation (English)</label>
                      <select
                        value={formData.designation.en}
                        onChange={(e) => {
                          const selected = designations.find(d => d.en === e.target.value);
                          setFormData({
                            ...formData,
                            designation: selected || { en: e.target.value, bn: '' }
                          });
                        }}
                        className="form-input"
                        required
                      >
                        <option value="">Select Designation</option>
                        {designations.map(designation => (
                          <option key={designation.en} value={designation.en}>
                            {designation.en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Designation (Bengali)</label>
                      <input
                        type="text"
                        value={formData.designation.bn}
                        onChange={(e) => setFormData({
                          ...formData,
                          designation: { ...formData.designation, bn: e.target.value }
                        })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="form-input"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Joining Date</label>
                      <input
                        type="date"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Contact Information</h4>
                    
                    <div>
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        value={formData.user.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          user: { ...formData.user, email: e.target.value },
                          contactInfo: { ...formData.contactInfo, email: e.target.value }
                        })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        value={formData.user.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          user: { ...formData.user, phone: e.target.value },
                          contactInfo: { ...formData.contactInfo, phone: e.target.value }
                        })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Present Address (English)</label>
                      <textarea
                        value={formData.contactInfo.address.present.en}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactInfo: {
                            ...formData.contactInfo,
                            address: {
                              ...formData.contactInfo.address,
                              present: { ...formData.contactInfo.address.present, en: e.target.value }
                            }
                          }
                        })}
                        className="form-input"
                        rows="2"
                      />
                    </div>

                    <div>
                      <label className="form-label">Present Address (Bengali)</label>
                      <textarea
                        value={formData.contactInfo.address.present.bn}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactInfo: {
                            ...formData.contactInfo,
                            address: {
                              ...formData.contactInfo.address,
                              present: { ...formData.contactInfo.address.present, bn: e.target.value }
                            }
                          }
                        })}
                        className="form-input"
                        rows="2"
                      />
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="form-label">Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <FiCamera className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.personalInfo.dateOfBirth}
                      onChange={(e) => setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, dateOfBirth: e.target.value }
                      })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Gender</label>
                    <select
                      value={formData.personalInfo.gender}
                      onChange={(e) => setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, gender: e.target.value }
                      })}
                      className="form-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Blood Group</label>
                    <select
                      value={formData.personalInfo.bloodGroup}
                      onChange={(e) => setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, bloodGroup: e.target.value }
                      })}
                      className="form-input"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Employee Type</label>
                    <select
                      value={formData.employeeType}
                      onChange={(e) => setFormData({ ...formData, employeeType: e.target.value })}
                      className="form-input"
                    >
                      <option value="Permanent">Permanent</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">MPO Status</label>
                    <select
                      value={formData.mpoStatus}
                      onChange={(e) => setFormData({ ...formData, mpoStatus: e.target.value })}
                      className="form-input"
                    >
                      <option value="Non-MPO">Non-MPO</option>
                      <option value="MPO">MPO</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="form-input"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
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

export default TeachersManager;
