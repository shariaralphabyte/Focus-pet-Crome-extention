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
      return response.data.notice;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notice'
      );
    }
  }
);

export const createNotice = createAsyncThunk(
  'notices/createNotice',
  async (noticeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/notices', noticeData);
      return response.data.notice;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create notice'
      );
    }
  }
);

export const updateNotice = createAsyncThunk(
  'notices/updateNotice',
  async ({ id, noticeData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/notices/${id}`, noticeData);
      return response.data.notice;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update notice'
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
        state.notices = action.payload.notices;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
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
      })
      .addCase(fetchNoticeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNotice = action.payload;
        state.error = null;
      })
      .addCase(fetchNoticeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
