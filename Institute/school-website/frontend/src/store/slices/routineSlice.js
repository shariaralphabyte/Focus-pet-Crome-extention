import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  routines: [],
  loading: false,
  error: null,
};

export const fetchRoutines = createAsyncThunk(
  'routines/fetchRoutines',
  async (_, { rejectWithValue }) => {
    try {
      return { routines: [] };
    } catch (error) {
      return rejectWithValue('Failed to fetch routines');
    }
  }
);

const routineSlice = createSlice({
  name: 'routines',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutines.pending, (state) => { state.loading = true; })
      .addCase(fetchRoutines.fulfilled, (state, action) => {
        state.loading = false;
        state.routines = action.payload.routines || [];
      })
      .addCase(fetchRoutines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = routineSlice.actions;
export default routineSlice.reducer;
