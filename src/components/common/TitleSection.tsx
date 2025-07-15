import { Box, Typography, useTheme, useMediaQuery, styled } from '@mui/material';
import React from 'react';

import { uiColors } from '../../theme/colors';

/**
 * TitleWrapper is a styled component that wraps the title and step information.
 */
const TitleWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0, // Prevents flex item from overflowing
  [theme.breakpoints.down('sm')]: {
    // Mobile only (below 600px)
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  [theme.breakpoints.between('sm', 'md')]: {
    // Tablet (600-960px)
    textAlign: 'left',
    marginBottom: 0, // Remove bottom margin to keep compact
  },
}));

interface TitleSectionProps {
  title: string;
  currentStepNumber: number;
  totalSteps: number;
}

/**
 * TitleSection component displays the title and current step information.
 * @param title
 * @param currentStepNumber
 * @param totalSteps
 * @constructor
 */
const TitleSection: React.FC<TitleSectionProps> = ({ title, currentStepNumber, totalSteps }) => {
  const theme = useTheme();

  return (
    <TitleWrapper sx={{ minWidth: 0, width: '100%' }}>
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '70%' } }}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '18px', sm: '22px', md: '24px' },
            fontWeight: 'bold',
            color: uiColors.tertiaryText,
            lineHeight: 1.2,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflow: 'visible',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            mb: 0.5,
          }}
        >
          {title}
        </Typography>

        <Typography
          component="h3"
          sx={{
            fontSize: { xs: '14px', sm: '16px' },
            fontWeight: 500,
            color: uiColors.primaryText,
            opacity: 0.9,
            lineHeight: 1.4,
            mt: 0.5,
          }}
        >
          Step {currentStepNumber} of {totalSteps}
        </Typography>
      </Box>
    </TitleWrapper>
  );
};

export default TitleSection;
