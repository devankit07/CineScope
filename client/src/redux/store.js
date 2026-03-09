import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import movieReducer from './slices/movieSlice';
import favoritesReducer from './slices/favoritesSlice';
import historyReducer from './slices/historySlice';
import uiReducer from './slices/uiSlice';
import shortsReducer from './slices/shortsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    favorites: favoritesReducer,
    history: historyReducer,
    ui: uiReducer,
    shorts: shortsReducer,
  },
});
