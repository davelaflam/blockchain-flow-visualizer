import { Typography, Card, CardContent, CardActions, Button, Box, useTheme, Grid } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import { getHomeRoutes } from '../routes';

const HomePage: React.FC = () => {
  const theme = useTheme();
  // Get routes that should be displayed on the home page
  const flowVisualizations = getHomeRoutes().map(route => ({
    id: route.id,
    title: `${route.name} Flow`,
    description: route.homeDescription || route.description || '',
    path: route.path,
  }));

  return (
    <MainLayout showHeaderBox={false}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 700, pt: { xs: 2, sm: 3, md: 4 } }}>
        Blockchain Flow Visualizations
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Select a flow visualization to explore the blockchain processes in detail.
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {flowVisualizations.map(flow => (
          <Grid key={flow.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Box sx={{ height: '100%', display: 'flex', width: '100%' }}>
              <Card
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#1F2937',
                  color: '#F9FAFB',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {flow.title}
                  </Typography>
                  <Typography variant="body2" color="#D1D5DB">
                    {flow.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button component={Link} to={flow.path} variant="contained" color="primary">
                    View Flow
                  </Button>
                </CardActions>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </MainLayout>
  );
};

export default HomePage;
