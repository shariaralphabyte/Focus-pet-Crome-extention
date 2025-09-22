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

const initialState = {
  students: [],
  currentStudent: null,
  stats: null,
  classes: [],
  sections: [],
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
    class: '',
    section: '',
    session: '',
    status: '',
    search: '',
  },
};

// Async thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/students?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
    }
  }
);

export const fetchStudent = createAsyncThunk(
  'students/fetchStudent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student');
    }
  }
);

export const fetchStudentStats = createAsyncThunk(
  'students/fetchStudentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student statistics');
    }
  }
);

export const fetchClasses = createAsyncThunk(
  'students/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/classes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch classes');
    }
  }
);

export const fetchSectionsByClass = createAsyncThunk(
  'students/fetchSectionsByClass',
  async (className, { rejectWithValue }) => {
    try {
      const response = await api.get(`/students/sections/${className}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sections');
    }
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => { state.filters = { class: '', section: '', search: '' }; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Student
      .addCase(fetchStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload.data;
        state.error = null;
      })
      .addCase(fetchStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Student Stats
      .addCase(fetchStudentStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(fetchStudentStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      // Fetch Classes
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.classes = action.payload.data || [];
      })
      // Fetch Sections by Class
      .addCase(fetchSectionsByClass.fulfilled, (state, action) => {
        state.sections = action.payload.data || [];
      });
  },
});

export const { clearError, setFilters, clearFilters } = studentSlice.actions;
export default studentSlice.reducer;
