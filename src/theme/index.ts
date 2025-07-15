import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface CustomThemeOptions {
    spacing: {
      section: number;
      component: number;
      grid: number;
      container: number;
    };
    gradients: {
      primary: string;
      secondary: string;
      error: string;
      success: string;
      warning: string;
      info: string;
    };
    shadows: {
      card: string;
      dialog: string;
      dropdown: string;
    };
  }

  interface Theme {
    custom: CustomThemeOptions;
  }

  interface ThemeOptions {
    custom?: CustomThemeOptions;
  }

  // Extend the Theme type to include our custom properties
  interface Theme {
    custom: CustomThemeOptions;
  }

  // Extend the ThemeOptions type to include our custom properties
  interface ThemeOptions {
    custom?: CustomThemeOptions;
  }
}

const baseTheme = {
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  spacing: 4, // Base unit of 4px (MUI default is 8px, but we want more granular control)
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          marginBottom: 3, // 3 * 4px = 12px
          '&:last-child': {
            marginBottom: 0,
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          '&.MuiGrid-item': {
            paddingTop: '24px', // Consistent spacing for Grid items
          },
        },
      },
    },
  },
  custom: {
    spacing: {
      section: 3, // 3 * 4px = 12px
      component: 2, // 2 * 4px = 8px
      grid: 3, // 3 * 4px = 12px
      container: 4, // 4 * 4px = 16px
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8A2BE2 0%, #4B0082 100%)',
      secondary: 'linear-gradient(135deg, #6C63FF 0%, #00BFFF 100%)',
      error: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
      success: 'linear-gradient(135deg, #00B09B 0%, #96C93D 100%)',
      warning: 'linear-gradient(135deg, #FDC830 0%, #F37335 100%)',
      info: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
    } satisfies Record<'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info', string>,
    shadows: {
      card: '0 4px 20px rgba(0, 0, 0, 0.1)',
      dialog: '0 8px 40px rgba(0, 0, 0, 0.2)',
      dropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
    } satisfies Record<'card' | 'dialog' | 'dropdown', string>,
  },
} satisfies ThemeOptions;

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#8A2BE2',
      light: '#9D4BFF',
      dark: '#6A1EC0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6C63FF',
      light: '#8B85FF',
      dark: '#4D44D1',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  } satisfies {
    mode: 'light';
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    background: {
      default: string;
      paper: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    divider: string;
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#9D4BFF',
      light: '#B77AFF',
      dark: '#7B2CBF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B85FF',
      light: '#A8A4FF',
      dark: '#6A63E6',
      contrastText: '#1E1B4B',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      disabled: '#64748B',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  } satisfies {
    mode: 'dark';
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    background: {
      default: string;
      paper: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    divider: string;
  },
  components: {
    ...baseTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
        },
      },
    } satisfies {
      styleOverrides: {
        root: {
          backgroundColor: string;
          backdropFilter: string;
        };
      };
    },
  },
});

export const getTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
