import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setHistory: (state, { payload }) => {
      state.items = Array.isArray(payload) ? payload : [];
    },
    addToHistory: (state, { payload }) => {
      const rest = state.items.filter((h) => h.movieId !== payload.movieId);
      state.items = [{ ...payload, lastWatchedAt: new Date().toISOString() }, ...rest].slice(0, 50);
    },
    removeFromHistory: (state, { payload }) => {
      state.items = state.items.filter((h) => h.movieId !== payload);
    },
    setHistoryLoading: (state, { payload }) => {
      state.loading = payload ?? false;
    },
  },
});

export const { setHistory, addToHistory, removeFromHistory, setHistoryLoading } = historySlice.actions;
export default historySlice.reducer;
