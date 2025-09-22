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
  events: [],
  currentEvent: null,
  featuredEvents: [],
  popularEvents: [],
  recentEvents: [],
  categories: [],
  loading: false,
  featuredLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  filters: {
    category: '',
    featured: false,
    dateFrom: '',
    dateTo: '',
    search: '',
  },
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/events?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const fetchEvent = createAsyncThunk(
  'events/fetchEvent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event');
    }
  }
);

export const fetchEventBySlug = createAsyncThunk(
  'events/fetchEventBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/slug/${slug}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event');
    }
  }
);

export const fetchFeaturedEvents = createAsyncThunk(
  'events/fetchFeaturedEvents',
  async (limit = 3, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured events');
    }
  }
);

export const fetchPopularEvents = createAsyncThunk(
  'events/fetchPopularEvents',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular events');
    }
  }
);

export const fetchRecentEvents = createAsyncThunk(
  'events/fetchRecentEvents',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent events');
    }
  }
);

export const fetchEventCategories = createAsyncThunk(
  'events/fetchEventCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/events/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const addEventComment = createAsyncThunk(
  'events/addEventComment',
  async ({ eventId, commentData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/events/${eventId}/comments`, commentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

// CRUD Operations
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/events/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
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
        featured: false,
        dateFrom: '',
        dateTo: '',
        search: '',
      };
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Event
      .addCase(fetchEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload.data;
        state.error = null;
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Event by Slug
      .addCase(fetchEventBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload.data;
        state.error = null;
      })
      .addCase(fetchEventBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Featured Events
      .addCase(fetchFeaturedEvents.pending, (state) => {
        state.featuredLoading = true;
      })
      .addCase(fetchFeaturedEvents.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featuredEvents = action.payload.data || [];
      })
      .addCase(fetchFeaturedEvents.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      })
      // Fetch Popular Events
      .addCase(fetchPopularEvents.fulfilled, (state, action) => {
        state.popularEvents = action.payload.data || [];
      })
      // Fetch Recent Events
      .addCase(fetchRecentEvents.fulfilled, (state, action) => {
        state.recentEvents = action.payload.data || [];
      })
      // Fetch Categories
      .addCase(fetchEventCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || [];
      })
      // Add Comment
      .addCase(addEventComment.fulfilled, (state, action) => {
        // Comment added successfully - could show success message
        state.error = null;
      })
      .addCase(addEventComment.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex(event => event._id === action.payload.data._id);
        if (index !== -1) {
          state.events[index] = action.payload.data;
        }
        if (state.currentEvent && state.currentEvent._id === action.payload.data._id) {
          state.currentEvent = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event._id !== action.payload);
        if (state.currentEvent && state.currentEvent._id === action.payload) {
          state.currentEvent = null;
        }
        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, clearFilters, clearCurrentEvent } = eventSlice.actions;
export default eventSlice.reducer;
