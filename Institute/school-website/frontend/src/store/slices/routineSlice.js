import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  routines: [],
  currentRoutine: null,
  loading: false,
  error: null,
  filters: {
    class: '',
    section: '',
    academicYear: new Date().getFullYear().toString(),
    type: '',
    semester: ''
  }
};

// Async thunks
export const fetchRoutines = createAsyncThunk(
  'routines/fetchRoutines',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.class) queryParams.append('class', params.class);
      if (params.section) queryParams.append('section', params.section);
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);
      if (params.type) queryParams.append('type', params.type);
      if (params.semester) queryParams.append('semester', params.semester);
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.page) queryParams.append('page', params.page);

      const response = await api.get(`/routines?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch routines');
    }
  }
);

export const fetchRoutineById = createAsyncThunk(
  'routines/fetchRoutineById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/routines/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch routine');
    }
  }
);

export const createRoutine = createAsyncThunk(
  'routines/createRoutine',
  async (routineData, { rejectWithValue }) => {
    try {
      const response = await api.post('/routines', routineData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create routine');
    }
  }
);

export const updateRoutine = createAsyncThunk(
  'routines/updateRoutine',
  async ({ id, routineData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/routines/${id}`, routineData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update routine');
    }
  }
);

export const deleteRoutine = createAsyncThunk(
  'routines/deleteRoutine',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/routines/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete routine');
    }
  }
);

export const getCurrentRoutine = createAsyncThunk(
  'routines/getCurrentRoutine',
  async ({ className, section, academicYear }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/routines/current?class=${className}&section=${section}&academicYear=${academicYear}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch current routine');
    }
  }
);

const routineSlice = createSlice({
  name: 'routines',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentRoutine: (state) => {
      state.currentRoutine = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch routines
      .addCase(fetchRoutines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutines.fulfilled, (state, action) => {
        state.loading = false;
        state.routines = action.payload;
      })
      .addCase(fetchRoutines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch routine by ID
      .addCase(fetchRoutineById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutineById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoutine = action.payload;
      })
      .addCase(fetchRoutineById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create routine
      .addCase(createRoutine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoutine.fulfilled, (state, action) => {
        state.loading = false;
        state.routines.push(action.payload);
      })
      .addCase(createRoutine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update routine
      .addCase(updateRoutine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoutine.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.routines.findIndex(routine => routine._id === action.payload._id);
        if (index !== -1) {
          state.routines[index] = action.payload;
        }
        if (state.currentRoutine && state.currentRoutine._id === action.payload._id) {
          state.currentRoutine = action.payload;
        }
      })
      .addCase(updateRoutine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete routine
      .addCase(deleteRoutine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoutine.fulfilled, (state, action) => {
        state.loading = false;
        state.routines = state.routines.filter(routine => routine._id !== action.payload);
        if (state.currentRoutine && state.currentRoutine._id === action.payload) {
          state.currentRoutine = null;
        }
      })
      .addCase(deleteRoutine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get current routine
      .addCase(getCurrentRoutine.fulfilled, (state, action) => {
        state.currentRoutine = action.payload;
      });
  },
});

export const { clearError, setFilters, clearCurrentRoutine } = routineSlice.actions;
export default routineSlice.reducer;
