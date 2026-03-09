import { createSlice } from '@reduxjs/toolkit';

const stored = () => {
  try {
    const user = localStorage.getItem('cinescope_user');
    const token = localStorage.getItem('cinescope_token');
    return user && token ? { user: JSON.parse(user), token } : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: stored()?.user ?? null,
  token: stored()?.token ?? null,
  isAuthenticated: !!stored()?.token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;
      if (payload.token) localStorage.setItem('cinescope_token', payload.token);
      if (payload.user) localStorage.setItem('cinescope_user', JSON.stringify(payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('cinescope_token');
      localStorage.removeItem('cinescope_user');
    },
    updateUser: (state, { payload }) => {
      if (state.user && payload) {
        state.user = { ...state.user, ...payload };
        try {
          localStorage.setItem('cinescope_user', JSON.stringify(state.user));
        } catch (_) {}
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
