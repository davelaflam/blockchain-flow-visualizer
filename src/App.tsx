/* eslint-disable no-console */

import { Box, CssBaseline } from '@mui/material';
import React, { useEffect } from 'react';

import ErrorBoundary from 'components/ErrorBoundary';
import Footer from 'components/Footer';
import NavBar from 'components/NavBar';
import { RouterConfig } from 'routes';
import { logDebug, logInfo, logWarn, logError } from 'services/logger';
import { ThemeProvider } from 'theme/ThemeProvider';

/**
 * Sets up error handling for ResizeObserver errors in development mode.
 */
const setupResizeObserverErrorHandling = () => {
  const originalError = console.error;

  if (process.env.NODE_ENV === 'development') {
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
        logDebug('ResizeObserver error suppressed:', args[0]);
        return;
      }
      const errorMessage = typeof args[0] === 'string' ? args[0] : 'Unknown error';
      logError('Unhandled error:', { message: errorMessage });
      originalError.apply(console, args);
    };
  }

  /**
   * Handles ResizeObserver errors by preventing them from propagating
   * @param e
   * @returns {boolean} - Returns false to prevent further propagation of the error
   */
  const handleResizeObserverError = (e: ErrorEvent) => {
    if (e.message && e.message.includes('ResizeObserver')) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  };

  window.addEventListener('error', handleResizeObserverError, true);

  return () => {
    if (process.env.NODE_ENV === 'development') {
      console.error = originalError;
      logDebug('Restored original console.error handler');
    }
    window.removeEventListener('error', handleResizeObserverError, true);
  };
};

/**
 * Main application component that sets up the theme, error boundary, and layout.
 * @constructor
 */
const App: React.FC = () => {
  useEffect(() => {
    const cleanup = setupResizeObserverErrorHandling();
    return cleanup;
  }, []);

  return (
    <ThemeProvider defaultMode="dark">
      <ErrorBoundary>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            color: 'text.primary',
          }}
        >
          <CssBaseline />
          <NavBar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              pt: 0,
              px: { xs: 2, sm: 4, md: 6 },
              pb: 10, // Increased padding at the bottom to account for the fixed footer
              maxWidth: '100%',
              mx: 'auto',
              width: '100%',
              '& .MuiContainer-root': {
                paddingTop: '0 !important',
              },
            }}
          >
            <RouterConfig />
          </Box>
          <Footer />
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
