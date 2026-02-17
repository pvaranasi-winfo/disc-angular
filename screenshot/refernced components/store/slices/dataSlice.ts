import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface DataState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  data: [],
  loading: false,
  error: null,
};

// Async thunk for fetching data
export const fetchData = createAsyncThunk(
  'data/fetchData',
  async (endpoint: string) => {
    const response = await api.get(endpoint);
    return response;
  }
);

// Async thunk for posting data
export const postData = createAsyncThunk(
  'data/postData',
  async ({ endpoint, data }: { endpoint: string; data: any }) => {
    const response = await api.post(endpoint, data);
    return response;
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch data';
      })
      .addCase(postData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postData.fulfilled, (state) => {
        state.loading = false;
        // Handle post success, maybe add to data or something
      })
      .addCase(postData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to post data';
      });
  },
});

export default dataSlice.reducer;