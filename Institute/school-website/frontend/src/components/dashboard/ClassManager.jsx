import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { fetchClasses, createClass, deleteClass } from '../../store/slices/classSlice';

const ClassManager = () => {
  const dispatch = useDispatch();
  const { classes } = useSelector(state => state.classes);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: { en: '', bn: '' },
    level: 'Secondary',
    grade: ''
  });

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createClass(formData));
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Class Management</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus /> Add Class
        </button>
      </div>

      <div className="grid gap-4">
        {classes.map((cls) => (
          <div key={cls._id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{cls.name?.en} - {cls.grade}</h3>
            <p>{cls.level}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Add Class</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Class Name (English)"
                value={formData.name.en}
                onChange={(e) => setFormData({
                  ...formData,
                  name: { ...formData.name, en: e.target.value }
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

export default ClassManager;
