import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import React from 'react';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.secondary',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 1.5,
        mt: 'auto',
        width: '100%',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Blockchain Flow Visualizations
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
