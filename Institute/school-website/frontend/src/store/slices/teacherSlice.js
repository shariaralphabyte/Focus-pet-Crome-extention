import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks
export const fetchTeachers = createAsyncThunk(
  'teachers/fetchTeachers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/teachers?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teachers');
    }
  }
);

export const fetchTeacher = createAsyncThunk(
  'teachers/fetchTeacher',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teachers/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teacher');
    }
  }
);

export const fetchTeacherStats = createAsyncThunk(
  'teachers/fetchTeacherStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teachers/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teacher statistics');
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'teachers/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teachers/departments');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

export const fetchDesignations = createAsyncThunk(
  'teachers/fetchDesignations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teachers/designations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch designations');
    }
  }
);

const initialState = {
  teachers: [],
  currentTeacher: null,
  stats: null,
  departments: [],
  designations: [],
  loading: false,
  statsLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  filters: {
    department: '',
    designation: '',
    search: '',
    status: '',
  },
};

const teacherSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { department: '', designation: '', search: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teachers
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Teacher
      .addCase(fetchTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTeacher = action.payload.data;
        state.error = null;
      })
      .addCase(fetchTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Teacher Stats
      .addCase(fetchTeacherStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacherStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(fetchTeacherStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      // Fetch Departments
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload.data || [];
      })
      // Fetch Designations
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.designations = action.payload.data || [];
      });
  },
});

export const { clearError, setFilters, clearFilters } = teacherSlice.actions;
export default teacherSlice.reducer;
