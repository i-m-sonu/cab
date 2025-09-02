import { createTheme } from '@mui/material/styles';

// Premium theme colors inspired by modern ride-hailing apps
const themeColors = {
  light: {
    primary: {
      main: '#00D2AA', // Teal accent
      dark: '#00B597',
      light: '#33E0C0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6366F1', // Electric blue
      dark: '#4F46E5',
      light: '#8B87F6',
      contrastText: '#ffffff',
    },
    accent: {
      main: '#84CC16', // Lime green
      dark: '#65A30D',
      light: '#A3E635',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
      elevated: '#FFFFFF',
    },
    surface: {
      main: '#F1F5F9',
      variant: '#E2E8F0',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
  },
  dark: {
    primary: {
      main: '#00D2AA',
      dark: '#00B597',
      light: '#33E0C0',
      contrastText: '#000000',
    },
    secondary: {
      main: '#8B87F6',
      dark: '#6366F1',
      light: '#A5A1F8',
      contrastText: '#000000',
    },
    accent: {
      main: '#A3E635',
      dark: '#84CC16',
      light: '#BEF264',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
      elevated: '#334155',
    },
    surface: {
      main: '#334155',
      variant: '#475569',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      disabled: '#64748B',
    },
    divider: '#334155',
    success: {
      main: '#34D399',
      light: '#6EE7B7',
      dark: '#10B981',
    },
    warning: {
      main: '#FBBF24',
      light: '#FCD34D',
      dark: '#F59E0B',
    },
    error: {
      main: '#F87171',
      light: '#FCA5A5',
      dark: '#EF4444',
    },
  },
};

export const createAppTheme = (mode) => {
  const colors = themeColors[mode];
  
  return createTheme({
    palette: {
      mode,
      ...colors,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none',
        letterSpacing: '0.02em',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.4,
      },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: mode === 'light' ? [
      'none',
      '0px 1px 3px rgba(0, 0, 0, 0.05)',
      '0px 4px 6px rgba(0, 0, 0, 0.05)',
      '0px 10px 15px rgba(0, 0, 0, 0.05)',
      '0px 20px 25px rgba(0, 0, 0, 0.05)',
      '0px 25px 50px rgba(0, 0, 0, 0.1)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      ...Array(17).fill('0px 25px 50px rgba(0, 0, 0, 0.15)'),
    ] : [
      'none',
      '0px 1px 3px rgba(0, 0, 0, 0.2)',
      '0px 4px 6px rgba(0, 0, 0, 0.2)',
      '0px 10px 15px rgba(0, 0, 0, 0.2)',
      '0px 20px 25px rgba(0, 0, 0, 0.2)',
      '0px 25px 50px rgba(0, 0, 0, 0.3)',
      '0px 25px 50px rgba(0, 0, 0, 0.4)',
      ...Array(17).fill('0px 25px 50px rgba(0, 0, 0, 0.4)'),
    ],
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 20,
            border: mode === 'light' ? '1px solid #F1F5F9' : '1px solid #334155',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'light' 
                ? '0px 20px 25px rgba(0, 0, 0, 0.1)' 
                : '0px 20px 25px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 500,
            padding: '12px 24px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            height: 32,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            borderBottom: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
          },
        },
      },
    },
  });
};

export default createAppTheme;
