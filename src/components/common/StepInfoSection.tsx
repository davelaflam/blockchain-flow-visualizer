import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import React from 'react';

import { uiColors } from '../../theme/colors';

interface StepInfoSectionProps {
  stepLabel: string;
  stepDescription: string;
}

/**
 * StepInfoSection component displays a step label and description.
 * It adjusts its layout based on the screen size.
 *
 * @param {StepInfoSectionProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
const StepInfoSection: React.FC<StepInfoSectionProps> = ({ stepLabel, stepDescription }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ width: '100%' }}>
      {stepLabel && (
        <Typography
          variant="subtitle2"
          noWrap
          sx={{
            fontSize: { xs: '14px', sm: '16px' },
            fontWeight: 600,
            color: uiColors.primaryText,
            textAlign: { xs: 'center', sm: 'left' },
            mb: { xs: 0.5, sm: 1 },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {stepLabel}
        </Typography>
      )}

      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: '12px', sm: '14px' },
          lineHeight: 1.4,
          color: uiColors.secondaryText,
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        {stepDescription}
      </Typography>
    </Box>
  );
};

export default StepInfoSection;
