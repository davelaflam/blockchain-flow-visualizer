import { PlayArrow, Pause, SkipNext, SkipPrevious, Replay } from '@mui/icons-material';
import { Button, IconButton, useMediaQuery, useTheme, styled, Box } from '@mui/material';
import React, { useEffect, useRef } from 'react';

import { uiColors } from '../../theme/colors';

interface FlowControlsProps {
  step: number;
  isPlaying: boolean;
  isFirst: boolean;
  isLast: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  totalSteps: number;
}

// Base control container for all screen sizes with consistent styling
const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end', // Right-aligned for desktop
  width: '100%',
  gap: theme.spacing(0.75), // Tighter spacing for more compact look
  padding: theme.spacing(0.5, 0),
  // Desktop specific styling
  [theme.breakpoints.up('md')]: {
    padding: 0,
  },
  // Tighter spacing for tablet view
  [theme.breakpoints.between('sm', 'md')]: {
    gap: theme.spacing(0.5),
    padding: 0,
    justifyContent: 'flex-end',
  },
  // Mobile view
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    gap: theme.spacing(0.75),
    padding: 0,
  },
}));

// Base styling for all buttons (shared between icon and text buttons)
const buttonStyles = {
  borderRadius: '4px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(4px)',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.25)',
    filter: 'brightness(1.05)',
  },
  '&:active': {
    transform: 'translateY(0)',
    filter: 'brightness(0.95)',
  },
  '&.Mui-disabled': {
    opacity: 0.5,
    transform: 'none',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    color: 'rgba(255, 255, 255, 0.4)',
    filter: 'grayscale(0.5)',
  },
};

// Play/Pause button - consistent across breakpoints
const PlayButton = styled(Button)(({ theme }) => ({
  ...buttonStyles,
  backgroundColor: uiColors.primary,
  color: '#FFFFFF',
  fontWeight: 500,
  minWidth: '60px', // More compact
  height: '30px', // More compact height for desktop
  fontSize: '0.8rem',
  padding: '2px 8px',
  letterSpacing: '0.2px',
  background: `linear-gradient(135deg, ${uiColors.primary}, ${uiColors.primaryDark})`,
  boxShadow: '0 1px 3px rgba(106, 30, 192, 0.3)',
  border: '1px solid rgba(138, 43, 226, 0.2)',
  '& .MuiButton-startIcon': {
    marginRight: '3px',
    '& > *': { fontSize: '1rem' },
  },
  '&:hover': {
    ...buttonStyles['&:hover'],
    background: `linear-gradient(135deg, ${uiColors.primary} 30%, ${uiColors.primaryDark} 90%)`,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },
  // Responsive styles for mobile
  [theme.breakpoints.down('sm')]: {
    minWidth: 'unset',
    width: '40px', // Smaller circular button
    height: '40px', // Smaller circular button
    borderRadius: '20px',
    padding: 0,
    '& .MuiButton-startIcon': {
      margin: 0,
    },
    '& .button-text': {
      display: 'none',
    },
  },
  // Tablet optimizations
  [theme.breakpoints.between('sm', 'md')]: {
    minWidth: '60px', // Match desktop width
    height: '32px', // Slightly taller than desktop
    fontSize: '0.75rem',
    padding: '4px 8px',
    '& .MuiButton-startIcon': {
      marginRight: '3px',
      '& > *': { fontSize: '0.9rem' },
    },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  ...buttonStyles,
  fontWeight: 400,
  minWidth: '60px', // More compact
  height: '30px', // Match PlayButton height
  fontSize: '0.75rem',
  padding: '2px 6px',
  letterSpacing: '0.2px',
  color: uiColors.primaryText,
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
  '& .MuiButton-startIcon': {
    marginRight: '3px',
    '& > *': { fontSize: '0.9rem' },
  },
  '&:hover': {
    ...buttonStyles['&:hover'],
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  [theme.breakpoints.down('sm')]: {
    minWidth: 'unset',
    width: '36px', // Smaller square button
    height: '36px', // Smaller square button
    padding: 0,
    borderRadius: '4px', // Match desktop border radius
    '& .MuiButton-startIcon': {
      margin: 0,
    },
    '& .button-text': {
      display: 'none',
    },
  },
  // tablet optimizations (600-960px)
  [theme.breakpoints.between('sm', 'md')]: {
    minWidth: '56px', // Slightly smaller than desktop
    height: '32px', // Match PlayButton height
    fontSize: '0.7rem', // Smaller font
    padding: '3px 6px', // Compact padding
    '& .MuiButton-startIcon': {
      marginRight: '2px', // Less space after icon
      '& > *': { fontSize: '0.85rem' }, // Smaller icons
    },
  },
}));

const FlowControls: React.FC<FlowControlsProps> = ({
  step,
  isPlaying,
  isFirst,
  isLast,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  totalSteps,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Mobile: < 600px
  const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md')); // Medium: 600px-959px
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!controlsRef.current?.contains(document.activeElement) && document.activeElement !== document.body) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          if (!isLast) {
            onNext();
          }
          break;
        case 'ArrowLeft':
          if (!isFirst) {
            onPrev();
          }
          break;
        case 'Home':
          if (!isFirst) {
            onReset();
          }
          break;
        case 'End':
          // Go to last step - not directly supported in the interface
          // Could be implemented if needed
          break;
        case 'Escape':
          if (isPlaying) {
            onPause();
          }
          break;
        case ' ': // Space key
          isPlaying ? onPause() : onPlay();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isFirst, isLast, onPlay, onPause, onNext, onPrev, onReset]);

  return (
    <ControlsContainer ref={controlsRef}>
      <PlayButton
        variant="contained"
        onClick={isPlaying ? onPause : onPlay}
        disabled={isLast} // Always disable on last step
        startIcon={isLast ? <PlayArrow /> : isPlaying ? <Pause /> : <PlayArrow />}
        aria-label={isLast ? 'Play' : isPlaying ? 'Pause' : 'Play'}
      >
        <span className="button-text">{isLast ? 'Play' : isPlaying ? 'Pause' : 'Play'}</span>
      </PlayButton>

      <NavButton onClick={onPrev} disabled={isFirst} startIcon={<SkipPrevious />} aria-label="Previous step">
        <span className="button-text">{isMobile ? '' : isMedium ? 'Prev' : 'Previous'}</span>
      </NavButton>

      <NavButton onClick={onNext} disabled={isLast} startIcon={<SkipNext />} aria-label="Next step">
        <span className="button-text">Next</span>
      </NavButton>

      <NavButton onClick={onReset} startIcon={<Replay />} aria-label="Reset flow">
        <span className="button-text">Reset</span>
      </NavButton>

      {/* Keyboard shortcuts info */}
      {/*<Box
        sx={{
          display: { xs: 'none', md: 'block' },
          fontSize: '0.7rem',
          color: 'rgba(255, 255, 255, 0.5)',
          ml: 1,
          userSelect: 'none'
        }}
      >
        ← Prev | → Next | Home Reset | Space Play/Pause | Esc Stop
      </Box>*/}
    </ControlsContainer>
  );
};

export default FlowControls;
