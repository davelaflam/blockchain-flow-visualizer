import { Box, CircularProgress } from '@mui/material';
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import ErrorBoundary from '../components/ErrorBoundary';

import { routes } from './routes';

// Loading component for suspense fallback
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

/**
 * RouterConfig component that renders all application routes
 * Uses React.Suspense for code splitting and lazy loading
 */
const RouterConfig: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {routes.map(route => (
          <Route
            key={route.id}
            path={route.path}
            element={<ErrorBoundary>{route.element ? <route.element /> : null}</ErrorBoundary>}
          />
        ))}
      </Routes>
    </Suspense>
  );
};

export default RouterConfig;
