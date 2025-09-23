import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit, FiTrash2, FiDownload, FiUpload } from 'react-icons/fi';
import { fetchSyllabus, createSyllabus, updateSyllabus, deleteSyllabus } from '../../store/slices/syllabusSlice';

const SyllabusManager = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { syllabus, loading } = useSelector(state => state.syllabus);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: { en: '', bn: '' },
    class: { en: '', bn: '' },
    subject: { en: '', bn: '' },
    academicYear: new Date().getFullYear().toString(),
    semester: 'Annual'
  });

  useEffect(() => {
    dispatch(fetchSyllabus());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createSyllabus(formData));
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Syllabus Management</h2>
        <div className="flex gap-2">
          <button className="btn-secondary">
            <FiUpload /> Upload PDF
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <FiPlus /> Add Syllabus
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {syllabus.map((syl) => (
          <div key={syl._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{syl.title?.en}</h3>
                <p>{syl.class?.en} - {syl.subject?.en}</p>
                <p className="text-sm text-gray-500">{syl.academicYear} • {syl.semester}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary p-2">
                  <FiDownload />
                </button>
                <button className="btn-secondary p-2">
                  <FiEdit />
                </button>
                <button 
                  onClick={() => dispatch(deleteSyllabus(syl._id))}
                  className="btn-danger p-2"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Add Syllabus</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title (English)"
                value={formData.title.en}
                onChange={(e) => setFormData({
                  ...formData,
                  title: { ...formData.title, en: e.target.value }
                })}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="text"
                placeholder="Subject (English)"
                value={formData.subject.en}
                onChange={(e) => setFormData({
                  ...formData,
                  subject: { ...formData.subject, en: e.target.value }
                })}
                className="w-full p-2 border rounded mb-2"
              />
              <button type="submit" className="btn-primary mr-2">Save</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyllabusManager;
