import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks
export const fetchNotices = createAsyncThunk(
  'notices/fetchNotices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/notices?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notices'
      );
    }
  }
);

export const fetchNoticeById = createAsyncThunk(
  'notices/fetchNoticeById',
  async ({ id, language = 'en' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/notices/${id}?language=${language}`);
      console.log('API Response:', response.data); // Debug log
      // Ensure we return the notice data in the expected format
      return response.data.data || response.data; // Handle both response formats
    } catch (error) {
      console.error('Error fetching notice:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notice. The notice may not exist or you may have insufficient permissions.'
      );
    }
  }
);

export const createNotice = createAsyncThunk(
  'notices/createNotice',
  async (noticeData, { rejectWithValue }) => {
    try {
      // Ensure noticeData is an object
      if (!noticeData || typeof noticeData !== 'object') {
        throw new Error('Invalid notice data');
      }

      // Helper function to safely get localized field
      const getLocalizedField = (field, defaultValue = '') => {
        if (!noticeData[field]) return { en: defaultValue, bn: defaultValue };
        
        if (typeof noticeData[field] === 'string') {
          return { en: noticeData[field], bn: noticeData[field] };
        }
        
        return {
          en: noticeData[field]?.en || defaultValue,
          bn: noticeData[field]?.bn || defaultValue
        };
      };

      // Get title and content with fallbacks
      const title = getLocalizedField('title', 'Untitled Notice');
      const content = getLocalizedField('content', '');
      
      // Format the notice data to match the backend's expected format
      const formattedData = {
        title: {
          en: title.en,
          bn: title.bn
        },
        content: {
          en: content.en,
          bn: content.bn
        },
        excerpt: {
          en: noticeData.excerpt?.en || noticeData.excerpt || content.en.substring(0, 200),
          bn: noticeData.excerpt?.bn || noticeData.excerpt || content.bn.substring(0, 200)
        },
        category: noticeData.category || 'General',
        priority: noticeData.priority || 'Medium',
        targetAudience: Array.isArray(noticeData.targetAudience) 
          ? noticeData.targetAudience 
          : [noticeData.targetAudience || 'All'],
        publishDate: noticeData.publishDate || new Date().toISOString(),
        expiryDate: noticeData.expiryDate || null,
        isPublished: noticeData.isPublished !== undefined ? noticeData.isPublished : true
      };

      console.log('Sending notice data:', formattedData); // Debug log
      
      const response = await api.post('/notices', formattedData);
      return response.data.data || response.data; // Handle both response formats
    } catch (error) {
      console.error('Error creating notice:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create notice. Please check the data and try again.'
      );
    }
  }
);

export const updateNotice = createAsyncThunk(
  'notices/updateNotice',
  async ({ id, noticeData }, { rejectWithValue }) => {
    try {
      // Ensure noticeData is an object
      if (!noticeData || typeof noticeData !== 'object') {
        throw new Error('Invalid notice data');
      }

      // Helper function to safely get localized field
      const getLocalizedField = (field, defaultValue = '') => {
        if (!noticeData[field]) return { en: defaultValue, bn: defaultValue };
        
        if (typeof noticeData[field] === 'string') {
          return { en: noticeData[field], bn: noticeData[field] };
        }
        
        return {
          en: noticeData[field]?.en || defaultValue,
          bn: noticeData[field]?.bn || defaultValue
        };
      };

      // Get title and content with fallbacks
      const title = getLocalizedField('title', 'Untitled Notice');
      const content = getLocalizedField('content', '');
      const excerpt = getLocalizedField('excerpt', '');
      
      // Format the notice data to match the backend's expected format
      const formattedData = {
        title: {
          en: title.en,
          bn: title.bn
        },
        content: {
          en: content.en,
          bn: content.bn
        },
        excerpt: {
          en: excerpt.en || content.en.substring(0, 200),
          bn: excerpt.bn || content.bn.substring(0, 200)
        },
        category: noticeData.category || 'General',
        priority: noticeData.priority || 'Medium',
        targetAudience: Array.isArray(noticeData.targetAudience) 
          ? noticeData.targetAudience 
          : [noticeData.targetAudience || 'All'],
        publishDate: noticeData.publishDate || new Date().toISOString(),
        expiryDate: noticeData.expiryDate || null,
        isPublished: noticeData.isPublished !== undefined ? noticeData.isPublished : true
      };

      console.log('Updating notice with data:', formattedData); // Debug log
      
      const response = await api.put(`/notices/${id}`, formattedData);
      return response.data.data || response.data; // Handle both response formats
    } catch (error) {
      console.error('Error updating notice:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update notice. Please check the data and try again.'
      );
    }
  }
);

export const deleteNotice = createAsyncThunk(
  'notices/deleteNotice',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notices/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete notice'
      );
    }
  }
);

export const likeNotice = createAsyncThunk(
  'notices/likeNotice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/notices/${id}/like`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to like notice'
      );
    }
  }
);

export const addComment = createAsyncThunk(
  'notices/addComment',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/notices/${id}/comments`, { content });
      return { id, comment: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add comment'
      );
    }
  }
);

const initialState = {
  notices: [],
  currentNotice: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  },
  filters: {
    category: '',
    search: '',
    targetAudience: '',
    language: 'en',
  },
  categories: [
    'General', 'Academic', 'Examination', 'Admission', 'Holiday',
    'Event', 'Sports', 'Cultural', 'Emergency', 'Fee', 'Result',
    'Meeting', 'Training', 'Workshop'
  ],
};

const noticeSlice = createSlice({
  name: 'notices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        search: '',
        targetAudience: '',
        language: state.filters.language,
      };
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearCurrentNotice: (state) => {
      state.currentNotice = null;
    },
    updateNoticeInList: (state, action) => {
      const index = state.notices.findIndex(notice => notice._id === action.payload._id);
      if (index !== -1) {
        state.notices[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notices
      .addCase(fetchNotices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.loading = false;
        state.notices = action.payload.data || [];
        state.pagination = {
          currentPage: action.payload.page || 1,
          totalPages: action.payload.pages || 1,
          total: action.payload.total || 0,
          limit: state.pagination.limit,
        };
        state.error = null;
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch notice by ID
      .addCase(fetchNoticeById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentNotice = null; // Clear current notice when starting a new fetch
      })
      .addCase(fetchNoticeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNotice = action.payload;
        state.error = null;
      })
      .addCase(fetchNoticeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load notice';
        state.currentNotice = null; // Clear current notice on error
        console.error('Error in fetchNoticeById:', action.payload); // Debug log
      })
      
      // Create notice
      .addCase(createNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotice.fulfilled, (state, action) => {
        state.loading = false;
        state.notices.unshift(action.payload);
        state.error = null;
      })
      .addCase(createNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update notice
      .addCase(updateNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notices.findIndex(notice => notice._id === action.payload._id);
        if (index !== -1) {
          state.notices[index] = action.payload;
        }
        if (state.currentNotice && state.currentNotice._id === action.payload._id) {
          state.currentNotice = action.payload;
        }
        state.error = null;
      })
      .addCase(updateNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete notice
      .addCase(deleteNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotice.fulfilled, (state, action) => {
        state.loading = false;
        state.notices = state.notices.filter(notice => notice._id !== action.payload);
        if (state.currentNotice && state.currentNotice._id === action.payload) {
          state.currentNotice = null;
        }
        state.error = null;
      })
      .addCase(deleteNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Like notice
      .addCase(likeNotice.fulfilled, (state, action) => {
        const { id, isLiked, likeCount } = action.payload;
        const notice = state.notices.find(n => n._id === id);
        if (notice) {
          notice.isLiked = isLiked;
          notice.likeCount = likeCount;
        }
        if (state.currentNotice && state.currentNotice._id === id) {
          state.currentNotice.isLiked = isLiked;
          state.currentNotice.likeCount = likeCount;
        }
      })
      
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        // Comment added successfully (pending approval)
        // No need to update state as comments need approval
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentPage,
  clearCurrentNotice,
  updateNoticeInList,
} = noticeSlice.actions;

// Selectors
export const selectNotices = (state) => state.notices.notices;
export const selectCurrentNotice = (state) => state.notices.currentNotice;
export const selectNoticesLoading = (state) => state.notices.loading;
export const selectNoticesError = (state) => state.notices.error;
export const selectNoticesPagination = (state) => state.notices.pagination;
export const selectNoticesFilters = (state) => state.notices.filters;
export const selectNoticeCategories = (state) => state.notices.categories;

export default noticeSlice.reducer;
