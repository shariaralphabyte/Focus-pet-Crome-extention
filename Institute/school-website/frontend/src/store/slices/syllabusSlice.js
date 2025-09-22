import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  syllabus: [],
  loading: false,
  error: null,
};

export const fetchSyllabus = createAsyncThunk(
  'syllabus/fetchSyllabus',
  async (_, { rejectWithValue }) => {
    try {
      return { syllabus: [] };
    } catch (error) {
      return rejectWithValue('Failed to fetch syllabus');
    }
  }
);

const syllabusSlice = createSlice({
  name: 'syllabus',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSyllabus.pending, (state) => { state.loading = true; })
      .addCase(fetchSyllabus.fulfilled, (state, action) => {
        state.loading = false;
        state.syllabus = action.payload.syllabus || [];
      })
      .addCase(fetchSyllabus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = syllabusSlice.actions;
export default syllabusSlice.reducer;
