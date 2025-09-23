import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  results: [],
  currentResult: null,
  loading: false,
  error: null,
  filters: {
    class: '',
    section: '',
    academicYear: new Date().getFullYear().toString(),
    examType: ''
  }
};

export const fetchResults = createAsyncThunk(
  'results/fetchResults',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.class) queryParams.append('class', params.class);
      if (params.section) queryParams.append('section', params.section);
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);
      if (params.examType) queryParams.append('examType', params.examType);

      const response = await api.get(`/results?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
    }
  }
);

export const createResult = createAsyncThunk(
  'results/createResult',
  async (resultData, { rejectWithValue }) => {
    try {
      const response = await api.post('/results', resultData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create result');
    }
  }
);

export const updateResult = createAsyncThunk(
  'results/updateResult',
  async ({ id, resultData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/results/${id}`, resultData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update result');
    }
  }
);

export const deleteResult = createAsyncThunk(
  'results/deleteResult',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/results/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete result');
    }
  }
);

const resultSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentResult: (state) => {
      state.currentResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createResult.fulfilled, (state, action) => {
        state.results.push(action.payload);
      })
      .addCase(updateResult.fulfilled, (state, action) => {
        const index = state.results.findIndex(result => result._id === action.payload._id);
        if (index !== -1) {
          state.results[index] = action.payload;
        }
      })
      .addCase(deleteResult.fulfilled, (state, action) => {
        state.results = state.results.filter(result => result._id !== action.payload);
      });
  },
});

export const { clearError, setFilters, clearCurrentResult } = resultSlice.actions;
export default resultSlice.reducer;
