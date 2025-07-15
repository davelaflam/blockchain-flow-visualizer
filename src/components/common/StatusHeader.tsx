import { Paper, Box, useTheme, useMediaQuery, styled } from '@mui/material';
import React from 'react';

import { uiColors } from '../../theme/colors';

import FlowControls from './FlowControls';
import StepInfoSection from './StepInfoSection';
import TitleSection from './TitleSection';
import { StatusHeaderProps, defaultGetTransactionStatus, TransactionStatus } from './types/StatusHeaderTypes';

/**
 * HeaderContent is a styled component that serves as the container for the header content.
 */
const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  width: '100%',
}));

/**
 * TitleSectionContainer is a styled component that serves as the container for the title and step information.
 */
const TitleSectionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  [theme.breakpoints.between('sm', 'md')]: {
    // Tablet layout (600-960px)
    flexDirection: 'row', // Horizontal layout
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
  [theme.breakpoints.up('md')]: {
    // Desktop (960px+)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
}));

/**
 * StatusHeader is a React functional component that renders a header for a status page.
 * @param title
 * @param stepData
 * @param getTransactionStatus
 * @param defaultDescription
 * @param useStore
 * @param onReset
 * @param showControls
 * @constructor
 */
const StatusHeader: React.FC<StatusHeaderProps> = ({
  title,
  stepData,
  getTransactionStatus = defaultGetTransactionStatus,
  defaultDescription = 'This flow visualization demonstrates the process of minting USDA tokens through a multi-signature approval workflow.',
  useStore,
  onReset,
  showControls = true,
}) => {
  if (!useStore) {
    throw new Error('StatusHeader requires a useStore prop. Please provide a store hook.');
  }

  const store = useStore();
  const { step, isPlaying, nextStep, prevStep, play, pause, reset: resetFlow } = store;
  const totalSteps = stepData.length;
  const currentStepNumber = step;
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * getStepLabel retrieves the label for the current step based on the step index.
   */
  const getStepLabel = (): string => {
    if (step === 0) return '';
    // Adjust for 0-based index in stepData array
    const dataIndex = Math.min(step - 1, totalSteps - 1);
    return stepData[dataIndex]?.label || (step >= totalSteps ? 'Completed' : '');
  };

  /**
   * getStepDescription retrieves the description for the current step based on the step index.
   */
  const getStepDescription = (): string => {
    if (step === 0) return defaultDescription;
    // Adjust for 0-based index in stepData array
    const dataIndex = Math.min(step - 1, totalSteps - 1);
    if (step > totalSteps) {
      return stepData[totalSteps - 1]?.description || 'Transaction completed successfully';
    }
    return stepData[dataIndex]?.description || 'Processing transaction...';
  };

  const handleReset = () => {
    resetFlow();
    onReset?.();
  };

  const isFirst = step === 0;
  // isLast should be true when at the last step (step 12 in 0-based index)
  // Use 1-based index for step comparison to match original FlowControlBar
  const isLast = step >= totalSteps;

  return (
    <Paper
      sx={{
        backgroundColor: uiColors.darkBackground,
        border: `1px solid ${uiColors.border}`,
        p: { xs: 2, sm: 3 },
      }}
    >
      <HeaderContent>
        <TitleSectionContainer>
          <TitleSection title={title} currentStepNumber={currentStepNumber} totalSteps={totalSteps} />

          {showControls && (
            <Box
              sx={{
                width: '100%',
                [theme.breakpoints.between('sm', 'md')]: {
                  // Tablet (600-960px) - horizontal compact layout
                  width: 'auto',
                  marginLeft: 'auto',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  mt: 0,
                  mb: 0,
                },
                [theme.breakpoints.up('md')]: {
                  // Desktop (960px+)
                  width: 'auto',
                  marginLeft: 'auto',
                  minWidth: '380px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                },
                [theme.breakpoints.down('sm')]: {
                  // mobile (below 600px)
                  mt: 1,
                },
              }}
            >
              <FlowControls
                step={step}
                isPlaying={isPlaying}
                isFirst={isFirst}
                isLast={isLast}
                onPlay={play}
                onPause={pause}
                onNext={nextStep}
                onPrev={prevStep}
                onReset={handleReset}
                totalSteps={totalSteps}
              />
            </Box>
          )}
        </TitleSectionContainer>

        <StepInfoSection stepLabel={getStepLabel()} stepDescription={getStepDescription()} />
      </HeaderContent>
    </Paper>
  );
};

export default StatusHeader;
