import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Async thunks for institution management
export const fetchInstitutionSettings = createAsyncThunk(
  'institution/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/institution/settings`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institution settings');
    }
  }
);

export const fetchInstitutionStatistics = createAsyncThunk(
  'institution/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/institution/statistics`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institution statistics');
    }
  }
);

export const updateInstitutionSettings = createAsyncThunk(
  'institution/updateSettings',
  async (settingsData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        }
      };
      const response = await axios.put(`${API_URL}/institution/settings`, settingsData, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update institution settings');
    }
  }
);

export const uploadInstitutionMedia = createAsyncThunk(
  'institution/uploadMedia',
  async ({ type, file, additionalData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          if (typeof additionalData[key] === 'object') {
            formData.append(key, JSON.stringify(additionalData[key]));
          } else {
            formData.append(key, additionalData[key]);
          }
        });
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      const response = await axios.post(`${API_URL}/institution/media`, formData, config);
      return { type, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload media');
    }
  }
);

const initialState = {
  settings: null,
  statistics: null,
  loading: false,
  error: null,
  uploadLoading: false
};

export const fetchInstitutionInfo = createAsyncThunk(
  'institution/fetchInfo',
  async (_, { rejectWithValue }) => {
    try {
      // Placeholder - will implement API call
      return {};
    } catch (error) {
      return rejectWithValue('Failed to fetch institution info');
    }
  }
);

const institutionSlice = createSlice({
  name: 'institution',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstitutionInfo.pending, (state) => { state.loading = true; })
      .addCase(fetchInstitutionInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.institutionInfo = action.payload;
      })
      .addCase(fetchInstitutionInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = institutionSlice.actions;
export default institutionSlice.reducer;
