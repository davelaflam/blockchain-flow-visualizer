import { Box, Typography, Paper } from '@mui/material';
import React from 'react';

import { uiColors } from '../../../../theme/colors';

interface HealthFactorHUDProps {
  healthFactor: number;
  step: number;
}

// Helper function to determine risk level based on health factor
const getRiskLevel = (healthFactor: number): { level: string; color: string } => {
  if (healthFactor >= 2) {
    return { level: 'Safe', color: '#4caf50' }; // Green
  } else if (healthFactor >= 1.5) {
    return { level: 'Moderate', color: '#ff9800' }; // Orange
  } else if (healthFactor >= 1.1) {
    return { level: 'High', color: '#f44336' }; // Red
  } else {
    return { level: 'Critical', color: '#d32f2f' }; // Dark Red
  }
};

const HealthFactorHUD: React.FC<HealthFactorHUDProps> = ({ healthFactor, step }) => {
  // Only show during steps 6-7
  if (step !== 6 && step !== 7) {
    return null;
  }

  const { level, color } = getRiskLevel(healthFactor);

  // For step 7, simulate a decreasing health factor
  const displayedHealthFactor = step === 7 ? Math.max(1.05, healthFactor * 0.7) : healthFactor;
  const displayedRisk = step === 7 ? getRiskLevel(displayedHealthFactor) : { level, color };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        bottom: 80, // Increased to avoid overlap with any controls at the bottom
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000, // Higher z-index to ensure it appears above the flow chart
        padding: 2,
        borderRadius: 2,
        backgroundColor: 'rgba(26, 32, 44, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        width: 'auto',
        minWidth: 220,
        animation: 'popIn 0.3s ease-out forwards',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="subtitle1" sx={{ color: uiColors.primaryText, mb: 1, fontWeight: 600 }}>
        Health Factor
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        <Typography
          variant="h4"
          sx={{
            color: displayedRisk.color,
            fontWeight: 700,
            textShadow: '0 0 10px rgba(0,0,0,0.3)',
          }}
        >
          {displayedHealthFactor.toFixed(2)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 1,
          padding: '4px 12px',
          mt: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: displayedRisk.color, fontWeight: 600 }}>
          Risk Level: {displayedRisk.level}
        </Typography>
      </Box>

      {step === 7 && (
        <Typography
          variant="caption"
          sx={{
            color: '#f44336',
            mt: 1,
            fontWeight: 500,
            animation: 'pulse 1.5s infinite',
          }}
        >
          Warning: Approaching liquidation threshold!
        </Typography>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </Paper>
  );
};

export default HealthFactorHUD;
