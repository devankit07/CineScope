import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, { payload }) => {
      state.items = Array.isArray(payload) ? payload : [];
    },
    addFavorite: (state, { payload }) => {
      const exists = state.items.some((f) => f.movieId === payload.movieId);
      if (!exists) state.items.push(payload);
    },
    removeFavorite: (state, { payload }) => {
      state.items = state.items.filter((f) => f.movieId !== payload);
    },
    setFavoritesLoading: (state, { payload }) => {
      state.loading = payload ?? false;
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite, setFavoritesLoading } = favoritesSlice.actions;
export default favoritesSlice.reducer;
