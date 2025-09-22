import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiSave, FiX, FiImage, FiType, FiAlignLeft } from 'react-icons/fi';

const InlineEditor = ({ 
  children, 
  onSave, 
  type = 'text', // text, textarea, image, rich
  value = '',
  placeholder = '',
  className = '',
  editableClassName = '',
  showEditIcon = true,
  disabled = false
}) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  // Only show for admin users
  const canEdit = isAuthenticated && user?.role === 'admin' && !disabled;

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editValue !== value && onSave) {
      try {
        await onSave(editValue);
      } catch (error) {
        console.error('Save failed:', error);
        setEditValue(value); // Revert on error
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type === 'text') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && type === 'textarea') {
      handleSave();
    }
  };

  const renderEditor = () => {
    const baseInputClass = `w-full bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${editableClassName}`;

    switch (type) {
      case 'textarea':
        return (
          <textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${baseInputClass} resize-none min-h-[100px]`}
            rows={4}
          />
        );
      case 'image':
        return (
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="url"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || "Enter image URL..."}
              className={baseInputClass}
            />
            {editValue && (
              <img 
                src={editValue} 
                alt="Preview" 
                className="max-w-full h-32 object-cover rounded-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
        );
      default:
        return (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  const getEditIcon = () => {
    switch (type) {
      case 'textarea':
        return FiAlignLeft;
      case 'image':
        return FiImage;
      default:
        return FiType;
    }
  };

  const EditIcon = getEditIcon();

  if (!canEdit) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {renderEditor()}
          
          {/* Save/Cancel buttons */}
          <div className="flex items-center justify-end space-x-2 mt-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              <FiX className="w-3 h-3 mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              <FiSave className="w-3 h-3 mr-1" />
              Save
            </button>
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-gray-500 mt-1">
            {type === 'text' ? 'Press Enter to save, Esc to cancel' : 'Press Ctrl+Enter to save, Esc to cancel'}
          </div>
        </motion.div>
      ) : (
        <>
          {children}
          
          {/* Edit button */}
          <AnimatePresence>
            {(isHovered || showEditIcon) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleEdit}
                className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-lg transition-colors z-10"
                title={`Edit ${type}`}
              >
                <EditIcon className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Hover overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-500 border-dashed rounded-md pointer-events-none"
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default InlineEditor;
