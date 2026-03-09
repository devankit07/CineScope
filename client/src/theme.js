import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#e50914' },
    secondary: { main: '#d4af37' },
    background: { default: '#0a0a0f', paper: '#12121a' },
  },
  typography: {
    fontFamily: '"Saira", sans-serif',
    h1: { fontFamily: '"Sansation", sans-serif' },
    h2: { fontFamily: '"Sansation", sans-serif' },
    h3: { fontFamily: '"Sansation", sans-serif' },
    h4: { fontFamily: '"Sansation", sans-serif' },
    h5: { fontFamily: '"Sansation", sans-serif' },
    h6: { fontFamily: '"Sansation", sans-serif' },
  },
});
