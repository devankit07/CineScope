import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trending: [],
  popular: [],
  topRated: [],
  upcoming: [],
  searchResults: [],
  searchQuery: '',
  filters: { genre: '', rating: '', year: '', sortBy: 'popularity.desc' },
  loading: false,
  searchLoading: false,
  page: 1,
  hasMore: true,
};

const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setTrending: (state, { payload }) => {
      state.trending = payload;
    },
    setPopular: (state, { payload }) => {
      state.popular = payload;
    },
    setTopRated: (state, { payload }) => {
      state.topRated = payload;
    },
    setUpcoming: (state, { payload }) => {
      state.upcoming = payload;
    },
    setSearchResults: (state, { payload }) => {
      state.searchResults = payload?.results ?? payload ?? [];
    },
    appendSearchResults: (state, { payload }) => {
      const list = payload?.results ?? payload ?? [];
      state.searchResults = [...(state.searchResults || []), ...list];
    },
    setSearchQuery: (state, { payload }) => {
      state.searchQuery = payload ?? '';
    },
    setFilters: (state, { payload }) => {
      state.filters = { ...state.filters, ...payload };
    },
    setLoading: (state, { payload }) => {
      state.loading = payload ?? false;
    },
    setSearchLoading: (state, { payload }) => {
      state.searchLoading = payload ?? false;
    },
    setPage: (state, { payload }) => {
      state.page = payload ?? 1;
    },
    setHasMore: (state, { payload }) => {
      state.hasMore = payload ?? false;
    },
    resetDiscover: (state) => {
      state.searchResults = [];
      state.page = 1;
      state.hasMore = true;
    },
    appendPopular: (state, { payload }) => {
      state.popular = [...(state.popular || []), ...(payload?.results ?? payload ?? [])];
    },
  },
});

export const {
  setTrending,
  setPopular,
  setTopRated,
  setUpcoming,
  setSearchResults,
  appendSearchResults,
  setSearchQuery,
  setFilters,
  setLoading,
  setSearchLoading,
  setPage,
  setHasMore,
  resetDiscover,
  appendPopular,
} = movieSlice.actions;
export default movieSlice.reducer;
