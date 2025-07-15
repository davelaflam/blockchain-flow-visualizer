import { Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { getNavRoutes } from '../routes';

const NavBar: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // State for hamburger menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Get navigation routes from centralized configuration
  const navLinks = getNavRoutes();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            minHeight: 64,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                color: 'text.primary',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  opacity: 0.9,
                },
                // On mobile, truncate the title
                // maxWidth: { xs: '200px', sm: 'none' },
                whiteSpace: { xs: 'nowrap', sm: 'normal' },
                overflow: { xs: 'hidden', sm: 'visible' },
                textOverflow: { xs: 'ellipsis', sm: 'clip' },
              }}
            >
              <Box
                component="img"
                src="/blockchain-flow-visualizer-navbar.png"
                alt="Flow Visualizer Logo"
                sx={{
                  display: 'inline-block',
                  width: 28,
                  height: 28,
                  borderRadius: '4px',
                  mr: 1,
                  objectFit: 'contain',
                }}
              />
              {isMobile ? 'Blockchain Flow Visualizer' : 'Blockchain Flow Visualizer'}
            </Typography>
          </Box>

          {/* Hamburger menu button */}
          <Box>
            <IconButton
              onClick={handleMenuClick}
              size="large"
              aria-label="navigation menu"
              aria-controls={open ? 'nav-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
                '& .MuiSvgIcon-root': {
                  fontSize: '1.5rem',
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Navigation Menu */}
            <Menu
              id="nav-menu"
              MenuListProps={{
                'aria-labelledby': 'nav-button',
                sx: {
                  py: 1,
                  '& .MuiMenuItem-root': {
                    minHeight: 48,
                    px: 2.5,
                  },
                },
              }}
              anchorEl={menuAnchorEl}
              open={open}
              onClose={handleMenuClose}
              disablePortal
              keepMounted
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 4,
                sx: {
                  backgroundColor: 'rgba(25, 33, 52, 0.98)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mt: 1,
                  minWidth: 250,
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'rgba(25, 33, 52, 0.98)',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    borderTop: '1px solid',
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                  },
                  '& .MuiMenuItem-root': {
                    '&:hover': {
                      backgroundColor: 'rgba(138, 75, 255, 0.1)',
                    },
                  },
                },
              }}
              TransitionProps={{
                timeout: {
                  enter: 150,
                  exit: 100,
                },
              }}
            >
              {navLinks.map(link => (
                <MenuItem
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  onClick={handleMenuClose}
                  selected={location.pathname === link.path}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(138, 75, 255, 0.1)',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(138, 75, 255, 0.15)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {link.icon && React.createElement(link.icon, { fontSize: 'small' })}
                  </ListItemIcon>
                  <ListItemText
                    primary={link.name}
                    secondary={link.description}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: location.pathname === link.path ? 600 : 400,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.8rem',
                      sx: { opacity: 0.7 },
                    }}
                  />
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
