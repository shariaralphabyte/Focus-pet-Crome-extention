import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { fetchResults, createResult, updateResult, deleteResult } from '../../store/slices/resultSlice';

const ResultsManager = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { results, loading } = useSelector(state => state.results);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: { en: '', bn: '' },
    examName: { en: '', bn: '' },
    examType: 'First Term',
    class: { en: '', bn: '' },
    section: ''
  });

  useEffect(() => {
    dispatch(fetchResults());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createResult(formData));
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Results Management</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus /> Add Result
        </button>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <div key={result._id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{result.title?.en}</h3>
            <p>{result.examName?.en} - {result.examType}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Add Result</h3>
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
              <button type="submit" className="btn-primary mr-2">Save</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsManager;
