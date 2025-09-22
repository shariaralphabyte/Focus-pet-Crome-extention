import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Async thunks for management committee
export const fetchManagementCommittee = createAsyncThunk(
  'managementCommittee/fetchAll',
  async ({ category, isActive = true } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (isActive !== undefined) params.append('isActive', isActive);
      
      const response = await axios.get(`${API_URL}/management-committee?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch management committee');
    }
  }
);

export const fetchManagementCommitteeMember = createAsyncThunk(
  'managementCommittee/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/management-committee/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch management committee member');
    }
  }
);

export const createManagementCommitteeMember = createAsyncThunk(
  'managementCommittee/create',
  async (memberData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(memberData).forEach(key => {
        if (key === 'photo' && memberData[key]) {
          formData.append('photo', memberData[key]);
        } else if (typeof memberData[key] === 'object') {
          formData.append(key, JSON.stringify(memberData[key]));
        } else {
          formData.append(key, memberData[key]);
        }
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      const response = await axios.post(`${API_URL}/management-committee`, formData, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create management committee member');
    }
  }
);

export const updateManagementCommitteeMember = createAsyncThunk(
  'managementCommittee/update',
  async ({ id, memberData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(memberData).forEach(key => {
        if (key === 'photo' && memberData[key]) {
          formData.append('photo', memberData[key]);
        } else if (typeof memberData[key] === 'object') {
          formData.append(key, JSON.stringify(memberData[key]));
        } else {
          formData.append(key, memberData[key]);
        }
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/management-committee/${id}`, formData, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update management committee member');
    }
  }
);

export const deleteManagementCommitteeMember = createAsyncThunk(
  'managementCommittee/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      await axios.delete(`${API_URL}/management-committee/${id}`, config);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete management committee member');
    }
  }
);

export const fetchManagementCommitteeStats = createAsyncThunk(
  'managementCommittee/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/management-committee/stats`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch management committee stats');
    }
  }
);

const initialState = {
  members: [],
  currentMember: null,
  stats: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false
};

const managementCommitteeSlice = createSlice({
  name: 'managementCommittee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMember: (state) => {
      state.currentMember = null;
    },
    setCurrentMember: (state, action) => {
      state.currentMember = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all management committee members
      .addCase(fetchManagementCommittee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagementCommittee.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchManagementCommittee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single management committee member
      .addCase(fetchManagementCommitteeMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagementCommitteeMember.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMember = action.payload;
      })
      .addCase(fetchManagementCommitteeMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create management committee member
      .addCase(createManagementCommitteeMember.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createManagementCommitteeMember.fulfilled, (state, action) => {
        state.createLoading = false;
        state.members.push(action.payload);
      })
      .addCase(createManagementCommitteeMember.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      
      // Update management committee member
      .addCase(updateManagementCommitteeMember.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateManagementCommitteeMember.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.members.findIndex(member => member._id === action.payload._id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
        if (state.currentMember && state.currentMember._id === action.payload._id) {
          state.currentMember = action.payload;
        }
      })
      .addCase(updateManagementCommitteeMember.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Delete management committee member
      .addCase(deleteManagementCommitteeMember.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteManagementCommitteeMember.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.members = state.members.filter(member => member._id !== action.payload);
        if (state.currentMember && state.currentMember._id === action.payload) {
          state.currentMember = null;
        }
      })
      .addCase(deleteManagementCommitteeMember.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      
      // Fetch management committee stats
      .addCase(fetchManagementCommitteeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagementCommitteeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchManagementCommitteeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentMember, setCurrentMember } = managementCommitteeSlice.actions;
export default managementCommitteeSlice.reducer;
