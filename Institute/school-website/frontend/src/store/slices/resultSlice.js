import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  results: [],
  loading: false,
  error: null,
};

export const fetchResults = createAsyncThunk(
  'results/fetchResults',
  async (_, { rejectWithValue }) => {
    try {
      return { results: [] };
    } catch (error) {
      return rejectWithValue('Failed to fetch results');
    }
  }
);

const resultSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => { state.loading = true; })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results || [];
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = resultSlice.actions;
export default resultSlice.reducer;
