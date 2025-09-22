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
  heroSlides: [],
  visionMission: null,
  aboutSections: [],
  contactInfo: null,
  institutionOverview: null,
  allContent: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  },
};

// Async thunks
export const fetchContentByKey = createAsyncThunk(
  'content/fetchContentByKey',
  async (key, { rejectWithValue }) => {
    try {
      const response = await api.get(`/content/key/${key}`);
      return { key, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch content');
    }
  }
);

export const fetchContentByType = createAsyncThunk(
  'content/fetchContentByType',
  async ({ type, options = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(options).toString();
      const response = await api.get(`/content/type/${type}?${queryParams}`);
      return { type, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch content');
    }
  }
);

export const fetchHeroSlides = createAsyncThunk(
  'content/fetchHeroSlides',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/content/hero-slides');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hero slides');
    }
  }
);

export const fetchVisionMission = createAsyncThunk(
  'content/fetchVisionMission',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/content/vision-mission');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vision/mission');
    }
  }
);

export const fetchAllContent = createAsyncThunk(
  'content/fetchAllContent',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/content?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch content');
    }
  }
);

export const updateContentInline = createAsyncThunk(
  'content/updateContentInline',
  async ({ key, field, value, language }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/content/${key}/inline`, {
        field,
        value,
        language,
      });
      return { key, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update content');
    }
  }
);

export const createContent = createAsyncThunk(
  'content/createContent',
  async (contentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/content', contentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create content');
    }
  }
);

export const updateContent = createAsyncThunk(
  'content/updateContent',
  async ({ id, contentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/content/${id}`, contentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update content');
    }
  }
);

export const deleteContent = createAsyncThunk(
  'content/deleteContent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/content/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete content');
    }
  }
);

export const publishContent = createAsyncThunk(
  'content/publishContent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/content/${id}/publish`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to publish content');
    }
  }
);

export const unpublishContent = createAsyncThunk(
  'content/unpublishContent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/content/${id}/unpublish`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unpublish content');
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setHeroSlides: (state, action) => {
      state.heroSlides = action.payload;
    },
    setVisionMission: (state, action) => {
      state.visionMission = action.payload;
    },
    updateContentItem: (state, action) => {
      const { key, data } = action.payload;
      // Update specific content based on key
      if (key === 'hero-slides') {
        state.heroSlides = data;
      } else if (key === 'vision-mission') {
        state.visionMission = data;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Content by Key
      .addCase(fetchContentByKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContentByKey.fulfilled, (state, action) => {
        state.loading = false;
        const { key, data } = action.payload;
        // Store content based on key
        if (key === 'hero-slides') {
          state.heroSlides = data;
        } else if (key === 'vision-mission') {
          state.visionMission = data;
        } else if (key === 'contact-info') {
          state.contactInfo = data;
        } else if (key === 'institution-overview') {
          state.institutionOverview = data;
        }
        state.error = null;
      })
      .addCase(fetchContentByKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Content by Type
      .addCase(fetchContentByType.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        if (type === 'hero-slide') {
          state.heroSlides = data;
        } else if (type === 'about-section') {
          state.aboutSections = data;
        }
      })
      // Fetch Hero Slides
      .addCase(fetchHeroSlides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroSlides.fulfilled, (state, action) => {
        state.loading = false;
        state.heroSlides = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchHeroSlides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Vision/Mission
      .addCase(fetchVisionMission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisionMission.fulfilled, (state, action) => {
        state.loading = false;
        state.visionMission = action.payload.data;
        state.error = null;
      })
      .addCase(fetchVisionMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Content (Admin)
      .addCase(fetchAllContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllContent.fulfilled, (state, action) => {
        state.loading = false;
        state.allContent = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchAllContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Content Inline
      .addCase(updateContentInline.fulfilled, (state, action) => {
        const { key, data } = action.payload;
        // Update the specific content item
        if (key === 'hero-slides') {
          state.heroSlides = data;
        } else if (key === 'vision-mission') {
          state.visionMission = data;
        }
        state.error = null;
      })
      .addCase(updateContentInline.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Create Content
      .addCase(createContent.fulfilled, (state, action) => {
        state.allContent.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createContent.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update Content
      .addCase(updateContent.fulfilled, (state, action) => {
        const updatedContent = action.payload.data;
        const index = state.allContent.findIndex(item => item._id === updatedContent._id);
        if (index !== -1) {
          state.allContent[index] = updatedContent;
        }
        state.error = null;
      })
      .addCase(updateContent.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete Content
      .addCase(deleteContent.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.allContent = state.allContent.filter(item => item._id !== deletedId);
        state.error = null;
      })
      .addCase(deleteContent.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Publish/Unpublish Content
      .addCase(publishContent.fulfilled, (state, action) => {
        const updatedContent = action.payload.data;
        const index = state.allContent.findIndex(item => item._id === updatedContent._id);
        if (index !== -1) {
          state.allContent[index] = updatedContent;
        }
        state.error = null;
      })
      .addCase(unpublishContent.fulfilled, (state, action) => {
        const updatedContent = action.payload.data;
        const index = state.allContent.findIndex(item => item._id === updatedContent._id);
        if (index !== -1) {
          state.allContent[index] = updatedContent;
        }
        state.error = null;
      });
  },
});

export const { clearError, setHeroSlides, setVisionMission, updateContentItem } = contentSlice.actions;
export default contentSlice.reducer;
