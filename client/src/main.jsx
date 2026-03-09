import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import App from './App';
import { store } from './redux/store';
import { logout } from './redux/slices/authSlice';
import { api } from './services/api';
import './index.css';

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) store.dispatch(logout());
    return Promise.reject(err);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
