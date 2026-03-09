import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  commandPaletteOpen: false,
  trailerModal: { open: false, movieId: null, key: null, title: null, posterUrl: null },
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCommandPalette: (state, { payload }) => {
      state.commandPaletteOpen = payload ?? !state.commandPaletteOpen;
    },
    openTrailerModal: (state, { payload }) => {
      state.trailerModal = {
        open: true,
        movieId: payload?.movieId ?? null,
        key: payload?.key ?? null,
        title: payload?.title ?? null,
        posterUrl: payload?.posterUrl ?? null,
      };
    },
    closeTrailerModal: (state) => {
      state.trailerModal = { open: false, movieId: null, key: null };
    },
    setSidebarOpen: (state, { payload }) => {
      state.sidebarOpen = payload ?? !state.sidebarOpen;
    },
  },
});

export const { toggleCommandPalette, openTrailerModal, closeTrailerModal, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
