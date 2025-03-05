import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MAIN_COLOR_1, MAIN_COLOR_2, MAIN_COLOR_3, MAIN_COLOR_5 } from './colors.ts';
import 'bootstrap/dist/css/bootstrap.min.css'; 
// import { createTheme } from '@mui/material/styles';
// import { ThemeProvider } from '@mui/material/styles';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

// We define your two main colors as 'primary' and 'secondary'
const theme = createTheme({
  palette: {
    primary: {
      main: MAIN_COLOR_1,  // Dark color
    },
    secondary: {
      main: MAIN_COLOR_2, // Light color
    },
    background: {
      default: MAIN_COLOR_5,  // This sets the global background color for the body
    },
  },
  // Optionally add any other theme customizations you like
});

export default theme;

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline applies the global styles based on your theme, including the background */}
    <CssBaseline />
    <App />
  </ThemeProvider>
);
