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
  galleries: [],
  currentGallery: null,
  featuredGalleries: [],
  recentGalleries: [],
  categories: [],
  loading: false,
  featuredLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  },
  filters: {
    category: '',
    type: '',
    visibility: 'public',
    search: '',
  },
};

// Async thunks
export const fetchGalleries = createAsyncThunk(
  'gallery/fetchGalleries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/gallery?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch galleries');
    }
  }
);

export const fetchGallery = createAsyncThunk(
  'gallery/fetchGallery',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue('Gallery ID is required');
      }
      const response = await api.get(`/gallery/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gallery');
    }
  }
);

export const fetchGalleryBySlug = createAsyncThunk(
  'gallery/fetchGalleryBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/gallery/slug/${slug}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gallery');
    }
  }
);

export const fetchFeaturedGalleries = createAsyncThunk(
  'gallery/fetchFeaturedGalleries',
  async (limit = 6, { rejectWithValue }) => {
    try {
      const response = await api.get(`/gallery/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured galleries');
    }
  }
);

export const fetchRecentGalleries = createAsyncThunk(
  'gallery/fetchRecentGalleries',
  async (limit = 12, { rejectWithValue }) => {
    try {
      const response = await api.get(`/gallery/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent galleries');
    }
  }
);

export const fetchGalleriesByCategory = createAsyncThunk(
  'gallery/fetchGalleriesByCategory',
  async ({ category, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/gallery/category/${category}?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch galleries by category');
    }
  }
);

export const fetchGalleryCategories = createAsyncThunk(
  'gallery/fetchGalleryCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gallery/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const gallerySlice = createSlice({
  name: 'gallery',
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
        type: '',
        visibility: 'public',
        search: '',
      };
    },
    clearCurrentGallery: (state) => {
      state.currentGallery = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Galleries
      .addCase(fetchGalleries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleries.fulfilled, (state, action) => {
        state.loading = false;
        state.galleries = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchGalleries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Gallery
      .addCase(fetchGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGallery = action.payload.data;
        state.error = null;
      })
      .addCase(fetchGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Gallery by Slug
      .addCase(fetchGalleryBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleryBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGallery = action.payload.data;
        state.error = null;
      })
      .addCase(fetchGalleryBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Featured Galleries
      .addCase(fetchFeaturedGalleries.pending, (state) => {
        state.featuredLoading = true;
      })
      .addCase(fetchFeaturedGalleries.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featuredGalleries = action.payload.data || [];
      })
      .addCase(fetchFeaturedGalleries.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      })
      // Fetch Recent Galleries
      .addCase(fetchRecentGalleries.fulfilled, (state, action) => {
        state.recentGalleries = action.payload.data || [];
      })
      // Fetch Galleries by Category
      .addCase(fetchGalleriesByCategory.fulfilled, (state, action) => {
        state.galleries = action.payload.data || [];
      })
      // Fetch Categories
      .addCase(fetchGalleryCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || [];
      });
  },
});

export const { clearError, setFilters, clearFilters, clearCurrentGallery } = gallerySlice.actions;
export default gallerySlice.reducer;
