import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  headerContent?: ReactNode;
  showHeaderBox?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, headerContent, showHeaderBox = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  return (
    <Container
      maxWidth="lg"
      sx={{
        position: 'relative',
        p: { xs: 1, sm: 2, md: 3 },
        overflow: 'hidden',
      }}
    >
      {showHeaderBox && headerContent && (
        <Box
          sx={{
            position: 'sticky',
            top: { xs: 0, sm: 16, md: 24 },
            zIndex: 100,
            backgroundColor: '#181A20',
            pt: { xs: 1, sm: 1.5, md: 2 },
            pb: 1,
            mb: 1,
          }}
        >
          {headerContent}
        </Box>
      )}
      {children}
    </Container>
  );
};

export default MainLayout;
