import { Box, Grid, styled } from '@mui/material';
import React from 'react';

/**
 * FeatureGrid is a styled component that creates a responsive grid layout for displaying features.
 */
const FeatureGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)',
  gap: theme.spacing(2.5),
  '@media (min-width: 600px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (min-width: 900px)': {
    gap: theme.spacing(3),
  },
}));

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FlowInfoSectionProps {
  advancedTips?: string[];
  description: string;
  featureTitle: string;
  features: FeatureItem[];
  keyPoints: string[];
  securityConsiderations?: string[];
  title: string;
}

/**
 * FlowInfoSection is a React functional component that displays detailed information about a flow.
 * @param title
 * @param description
 * @param keyPoints
 * @param featureTitle
 * @param features
 * @param advancedTips
 * @param securityConsiderations
 * @constructor
 */
const FlowInfoSection: React.FC<FlowInfoSectionProps> = ({
  title,
  description,
  keyPoints,
  featureTitle,
  features,
  advancedTips,
  securityConsiderations,
}) => {
  return (
    <Box
      sx={{
        mt: 0,
        mb: 4,
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'rgba(26, 32, 44, 0.8)',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Grid container spacing={3}>
        <Grid component="div" size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: { xs: 3, md: 0 } }}>
            <Box
              component="h2"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                mb: 2,
                color: 'white',
                lineHeight: 1.3,
              }}
            >
              {title}
            </Box>
            <Box
              component="p"
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                mb: 2,
                fontSize: '0.95rem',
                lineHeight: 1.6,
              }}
            >
              {description}
            </Box>
            <Box
              component="p"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 1.5,
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            >
              Key processes include:
            </Box>
            <Box
              component="ul"
              sx={{
                pl: 3,
                color: 'rgba(255, 255, 255, 0.8)',
                '& li': {
                  mb: 1,
                  '&:last-child': {
                    mb: 0,
                  },
                },
              }}
            >
              {keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 6 }}>
          <Box>
            <Box
              component="h2"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                mb: 2,
                color: 'white',
                lineHeight: 1.3,
              }}
            >
              {featureTitle}
            </Box>

            <FeatureGrid>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'rgba(59, 130, 246, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: [
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      '0 0 15px 5px rgba(76, 29, 149, 0.1)',
                    ].join(','),
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: '10px',
                      padding: '1px',
                      background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.3), rgba(29, 78, 216, 0.1))',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                      pointerEvents: 'none',
                    },
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
                      opacity: 0.8,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.4s ease',
                      zIndex: 1,
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: [
                        '0 10px 25px -5px rgba(76, 29, 149, 0.4)',
                        '0 10px 10px -5px rgba(29, 78, 216, 0.2)',
                        '0 0 25px 10px rgba(76, 29, 149, 0.2)',
                      ].join(','),
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      '&:after': {
                        opacity: 0.5,
                        transform: 'scaleX(1)',
                      },
                    },
                  }}
                >
                  <Box
                    component="h3"
                    sx={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      mb: 1.5,
                      mt: 0,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                      pl: 2.5,
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        boxShadow: '0 0 12px rgba(139, 92, 246, 0.7)',
                      },
                    }}
                  >
                    {feature.title}
                  </Box>
                  <Box
                    component="p"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.75)',
                      flexGrow: 1,
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      mb: 0,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {feature.description}
                  </Box>
                </Box>
              ))}
            </FeatureGrid>
          </Box>
        </Grid>
      </Grid>

      {/* Additional row for Advanced Tips and Security Considerations */}
      {(advancedTips || securityConsiderations) && (
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {/* Advanced Tips Section */}
          {advancedTips && (
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'rgba(59, 130, 246, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: [
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '0 0 15px 5px rgba(76, 29, 149, 0.1)',
                  ].join(','),
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '10px',
                    padding: '1px',
                    background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.3), rgba(29, 78, 216, 0.1))',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    pointerEvents: 'none',
                  },
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
                    opacity: 0.8,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.4s ease',
                    zIndex: 1,
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: [
                      '0 10px 25px -5px rgba(76, 29, 149, 0.4)',
                      '0 10px 10px -5px rgba(29, 78, 216, 0.2)',
                      '0 0 25px 10px rgba(76, 29, 149, 0.2)',
                    ].join(','),
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    '&:after': {
                      opacity: 0.5,
                      transform: 'scaleX(1)',
                    },
                  },
                }}
              >
                <Box
                  component="h2"
                  sx={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    mb: 1.5,
                    mt: 0,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    pl: 2.5,
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.7)',
                    },
                  }}
                >
                  Advanced Tips
                </Box>
                <Box
                  component="ul"
                  sx={{
                    pl: 3,
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    letterSpacing: '0.01em',
                    '& li': {
                      mb: 1,
                      '&:last-child': {
                        mb: 0,
                      },
                    },
                  }}
                >
                  {advancedTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}

          {/* Security Considerations Section */}
          {securityConsiderations && (
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'rgba(59, 130, 246, 0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: [
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '0 0 15px 5px rgba(76, 29, 149, 0.1)',
                  ].join(','),
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '10px',
                    padding: '1px',
                    background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.3), rgba(29, 78, 216, 0.1))',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    pointerEvents: 'none',
                  },
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
                    opacity: 0.8,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.4s ease',
                    zIndex: 1,
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: [
                      '0 10px 25px -5px rgba(76, 29, 149, 0.4)',
                      '0 10px 10px -5px rgba(29, 78, 216, 0.2)',
                      '0 0 25px 10px rgba(76, 29, 149, 0.2)',
                    ].join(','),
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    '&:after': {
                      opacity: 0.5,
                      transform: 'scaleX(1)',
                    },
                  },
                }}
              >
                <Box
                  component="h2"
                  sx={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    mb: 1.5,
                    mt: 0,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    pl: 2.5,
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.7)',
                    },
                  }}
                >
                  Security Considerations
                </Box>
                <Box
                  component="ul"
                  sx={{
                    pl: 3,
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    letterSpacing: '0.01em',
                    '& li': {
                      mb: 1,
                      '&:last-child': {
                        mb: 0,
                      },
                    },
                  }}
                >
                  {securityConsiderations.map((consideration, index) => (
                    <li key={index}>{consideration}</li>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default FlowInfoSection;
