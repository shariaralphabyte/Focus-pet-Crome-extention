import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);
      if (params.level) queryParams.append('level', params.level);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

      const response = await api.get(`/classes?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch classes');
    }
  }
);

export const fetchClassById = createAsyncThunk(
  'classes/fetchClassById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/classes/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch class');
    }
  }
);

export const createClass = createAsyncThunk(
  'classes/createClass',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await api.post('/classes', classData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create class');
    }
  }
);

export const updateClass = createAsyncThunk(
  'classes/updateClass',
  async ({ id, classData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/classes/${id}`, classData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update class');
    }
  }
);

export const deleteClass = createAsyncThunk(
  'classes/deleteClass',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/classes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete class');
    }
  }
);

export const fetchActiveClasses = createAsyncThunk(
  'classes/fetchActiveClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/classes/active');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active classes');
    }
  }
);

export const fetchClassesByLevel = createAsyncThunk(
  'classes/fetchClassesByLevel',
  async (level, { rejectWithValue }) => {
    try {
      const response = await api.get(`/classes/level/${level}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch classes by level');
    }
  }
);

const initialState = {
  classes: [],
  activeClasses: [],
  currentClass: null,
  loading: false,
  error: null,
  filters: {
    academicYear: new Date().getFullYear().toString(),
    level: '',
    isActive: true
  }
};

const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentClass: (state) => {
      state.currentClass = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch classes
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch class by ID
      .addCase(fetchClassById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClass = action.payload;
      })
      .addCase(fetchClassById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create class
      .addCase(createClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.loading = false;
        state.classes.push(action.payload);
      })
      .addCase(createClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update class
      .addCase(updateClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.classes.findIndex(cls => cls._id === action.payload._id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
        if (state.currentClass && state.currentClass._id === action.payload._id) {
          state.currentClass = action.payload;
        }
      })
      .addCase(updateClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete class
      .addCase(deleteClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = state.classes.filter(cls => cls._id !== action.payload);
        if (state.currentClass && state.currentClass._id === action.payload) {
          state.currentClass = null;
        }
      })
      .addCase(deleteClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch active classes
      .addCase(fetchActiveClasses.fulfilled, (state, action) => {
        state.activeClasses = action.payload;
      })
      
      // Fetch classes by level
      .addCase(fetchClassesByLevel.fulfilled, (state, action) => {
        state.classes = action.payload;
      });
  }
});

export const { clearError, setFilters, clearCurrentClass } = classSlice.actions;
export default classSlice.reducer;
