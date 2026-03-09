import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clips: [],
  loading: false,
  error: null,
};

const shortsSlice = createSlice({
  name: 'shorts',
  initialState,
  reducers: {
    setClips: (state, { payload }) => {
      state.clips = Array.isArray(payload) ? payload : [];
      state.error = null;
    },
    setShortsLoading: (state, { payload }) => {
      state.loading = payload ?? false;
    },
    setShortsError: (state, { payload }) => {
      state.error = payload ?? null;
    },
  },
});

export const { setClips, setShortsLoading, setShortsError } = shortsSlice.actions;
export default shortsSlice.reducer;
