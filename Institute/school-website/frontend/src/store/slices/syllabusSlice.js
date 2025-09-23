import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  syllabus: [],
  currentSyllabus: null,
  loading: false,
  error: null,
  filters: {
    class: '',
    subject: '',
    academicYear: new Date().getFullYear().toString(),
    semester: ''
  }
};

export const fetchSyllabus = createAsyncThunk(
  'syllabus/fetchSyllabus',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.class) queryParams.append('class', params.class);
      if (params.subject) queryParams.append('subject', params.subject);
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);
      if (params.semester) queryParams.append('semester', params.semester);

      const response = await api.get(`/syllabus?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch syllabus');
    }
  }
);

export const createSyllabus = createAsyncThunk(
  'syllabus/createSyllabus',
  async (syllabusData, { rejectWithValue }) => {
    try {
      const response = await api.post('/syllabus', syllabusData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create syllabus');
    }
  }
);

export const updateSyllabus = createAsyncThunk(
  'syllabus/updateSyllabus',
  async ({ id, syllabusData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/syllabus/${id}`, syllabusData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update syllabus');
    }
  }
);

export const deleteSyllabus = createAsyncThunk(
  'syllabus/deleteSyllabus',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/syllabus/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete syllabus');
    }
  }
);

const syllabusSlice = createSlice({
  name: 'syllabus',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentSyllabus: (state) => {
      state.currentSyllabus = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSyllabus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSyllabus.fulfilled, (state, action) => {
        state.loading = false;
        state.syllabus = action.payload;
      })
      .addCase(fetchSyllabus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSyllabus.fulfilled, (state, action) => {
        state.syllabus.push(action.payload);
      })
      .addCase(updateSyllabus.fulfilled, (state, action) => {
        const index = state.syllabus.findIndex(syl => syl._id === action.payload._id);
        if (index !== -1) {
          state.syllabus[index] = action.payload;
        }
      })
      .addCase(deleteSyllabus.fulfilled, (state, action) => {
        state.syllabus = state.syllabus.filter(syl => syl._id !== action.payload);
      });
  },
});

export const { clearError, setFilters, clearCurrentSyllabus } = syllabusSlice.actions;
export default syllabusSlice.reducer;
