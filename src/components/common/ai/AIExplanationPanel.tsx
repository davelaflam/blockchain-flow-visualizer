import CodeIcon from '@mui/icons-material/Code';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SchoolIcon from '@mui/icons-material/School';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import { getAIExplanation } from '../../../services/ai';
import { logError } from '../../../services/logger';
import env from '../../../utils/env';

import AIProviderSelector from './AIProviderSelector';
import { TabPanelProps, AIExplanationPanelProps } from './types/AIExplanationPanelTypes';
import { AIProviderType } from './types/AIProviderTypes';
import { AIExplanationResponse } from './types/AIResponseTypes';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`explanation-tabpanel-${index}`}
      aria-labelledby={`explanation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

/**
 * AIExplanationPanel component displays AI-generated explanations for a specific flow step.
 * This component fetches explanations based on the flow type and step number,
 * @param flowType
 * @param stepNumber
 * @param expanded
 * @param step
 * @param defaultDescription
 * @constructor
 */
const AIExplanationPanel: React.FC<AIExplanationPanelProps> = ({
  flowType,
  stepNumber,
  expanded = false,
  step = stepNumber,
  defaultDescription = 'This flow visualization demonstrates the process of minting USDA tokens through a multi-signature approval workflow.',
}) => {
  const [explanation, setExplanation] = useState<AIExplanationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);
  const [tabValue, setTabValue] = useState(0);
  const [providerChanged, setProviderChanged] = useState<boolean>(false);

  /**
   * Calculates the tab indices based on the available explanation content.
   * @param explanation
   */
  const getTabIndices = (explanation: AIExplanationResponse | null) => {
    if (!explanation) return { standard: 0, technical: -1, simplified: -1, whatIf: -1 };

    let technical = -1;
    let simplified = -1;
    let whatIf = -1;

    let currentIndex = 1; // Standard is always 0

    if (explanation.technicalDetails || explanation.technicalCode) {
      technical = currentIndex++;
    }

    if (explanation.simplifiedExplanation) {
      simplified = currentIndex++;
    }

    if (explanation.whatIfScenarios && explanation.whatIfScenarios.length > 0) {
      whatIf = currentIndex;
    }

    return { standard: 0, technical, simplified, whatIf };
  };

  /**
   * Handles changes in the AI provider selection.
   * This function sets the providerChanged state to true,
   * @param providerType - The type of AI provider selected.
   */
  const handleProviderChange = (providerType: AIProviderType) => {
    setProviderChanged(true);
    setTabValue(0);
  };

  /**
   * Fetches the AI explanation for the current flow type and step.
   */
  useEffect(() => {
    const fetchExplanation = async () => {
      if (!isExpanded) return; // Only fetch when expanded

      setLoading(true);
      setError(null);

      try {
        const data = await getAIExplanation(flowType, step, false, step === 0 ? defaultDescription : undefined);
        setExplanation(data);
        setTabValue(0);
      } catch (err) {
        if (env.NODE_ENV === 'development') {
          logError('Error fetching AI explanation:', err);
        }
        setError('Failed to load explanation. Please try again later.');
      } finally {
        setLoading(false);
        setProviderChanged(false);
      }
    };

    fetchExplanation();
  }, [flowType, step, isExpanded, providerChanged, defaultDescription]);

  /**
   * Validates the current tab value against the available explanation content.
   */
  useEffect(() => {
    if (explanation) {
      const tabIndices = getTabIndices(explanation);
      const validIndices = [tabIndices.standard, tabIndices.technical, tabIndices.simplified, tabIndices.whatIf].filter(
        index => index >= 0
      );

      if (!validIndices.includes(tabValue)) {
        setTabValue(0);
      }
    }
  }, [explanation, tabValue]);

  /**
   * Handles tab changes.
   * @param event
   * @param newValue
   */
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (explanation) {
      const tabIndices = getTabIndices(explanation);
      const validIndices = [tabIndices.standard, tabIndices.technical, tabIndices.simplified, tabIndices.whatIf].filter(
        index => index >= 0
      );

      if (validIndices.includes(newValue)) {
        setTabValue(newValue);
      }
    } else {
      if (newValue === 0) {
        setTabValue(newValue);
      }
    }
  };

  const handleAccordionChange = (event: React.SyntheticEvent, newExpanded: boolean) => {
    setIsExpanded(newExpanded);
  };

  return (
    <Accordion
      expanded={isExpanded}
      onChange={handleAccordionChange}
      sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        '&:before': {
          display: 'none',
        },
        mt: 0,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="ai-explanation-content"
        id="ai-explanation-header"
        sx={{
          borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          '&:hover': {
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToyIcon sx={{ mr: 1, color: '#60a5fa' }} />
            <Typography variant="subtitle1" fontWeight={600}>
              AI-Powered Explanation
            </Typography>
          </Box>
          {isExpanded && (
            <Box sx={{ ml: 2 }} onClick={e => e.stopPropagation()}>
              <AIProviderSelector onChange={handleProviderChange} />
            </Box>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          p: 0,
          backgroundColor: 'rgba(49, 63, 92, 0.6)',
          borderTop: '1px solid',
          borderColor: 'rgba(59, 130, 246, 0.1)',
          backdropFilter: 'blur(8px)',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        ) : explanation ? (
          <Box>
            {/* Calculate tab indices based on available content */}
            {(() => {
              const tabIndices = getTabIndices(explanation);

              return (
                <>
                  <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    variant="fullWidth"
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      '& .MuiTab-root': {
                        color: 'text.secondary',
                      },
                      '& .Mui-selected': {
                        color: '#60a5fa !important',
                      },
                    }}
                  >
                    <Tab label="Standard" icon={<SchoolIcon />} iconPosition="start" />
                    {explanation.technicalDetails && <Tab label="Technical" icon={<CodeIcon />} iconPosition="start" />}
                    {explanation.simplifiedExplanation && (
                      <Tab label="Simplified" icon={<SmartToyIcon />} iconPosition="start" />
                    )}
                    {explanation.whatIfScenarios && explanation.whatIfScenarios.length > 0 && (
                      <Tab label="What-if" icon={<HelpOutlineIcon />} iconPosition="start" />
                    )}
                  </Tabs>

                  <TabPanel value={tabValue} index={tabIndices.standard}>
                    <Box sx={{ display: tabValue === tabIndices.standard ? 'block' : 'none' }}>
                      <Typography variant="body1" sx={{ color: '#cbd5e1' }}>
                        {explanation.explanation}
                      </Typography>
                    </Box>
                  </TabPanel>

                  {(explanation.technicalDetails || explanation.technicalCode) && tabIndices.technical >= 0 && (
                    <TabPanel value={tabValue} index={tabIndices.technical}>
                      <Box sx={{ display: tabValue === tabIndices.technical ? 'block' : 'none' }}>
                        {explanation.technicalDetails && (
                          <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 3, fontFamily: 'inherit' }}>
                            {explanation.technicalDetails}
                          </Typography>
                        )}

                        {explanation.technicalCode && (
                          <Box
                            sx={{
                              mt: explanation.technicalDetails ? 3 : 0,
                              p: 2,
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              borderRadius: 1,
                              overflow: 'auto',
                              maxHeight: '400px',
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ color: '#60a5fa', mb: 1, fontWeight: 'bold' }}>
                              Code Example:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#cbd5e1',
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                fontSize: '0.9rem',
                                lineHeight: 1.5,
                              }}
                            >
                              {explanation.technicalCode}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TabPanel>
                  )}

                  {explanation.simplifiedExplanation && tabIndices.simplified >= 0 && (
                    <TabPanel value={tabValue} index={tabIndices.simplified}>
                      <Box sx={{ display: tabValue === tabIndices.simplified ? 'block' : 'none' }}>
                        <Typography variant="body1" sx={{ color: '#cbd5e1' }}>
                          {explanation.simplifiedExplanation}
                        </Typography>
                      </Box>
                    </TabPanel>
                  )}

                  {explanation.whatIfScenarios && explanation.whatIfScenarios.length > 0 && tabIndices.whatIf >= 0 && (
                    <TabPanel value={tabValue} index={tabIndices.whatIf}>
                      <Box
                        sx={{
                          display: tabValue === tabIndices.whatIf ? 'block' : 'none',
                        }}
                      >
                        <dl style={{ margin: 0, padding: 0 }}>
                          {explanation.whatIfScenarios.map((scenario, index) => {
                            // Handle both string format and object format
                            if (typeof scenario === 'string') {
                              // Handle string format (e.g., "Question? Answer")
                              const parts = scenario.split('?');
                              const question = parts[0] ? `${parts[0]}?` : '';
                              const answer = parts[1] || '';

                              return (
                                <React.Fragment key={index}>
                                  <dt
                                    style={{
                                      color: '#cbd5e1',
                                      fontWeight: 600,
                                      marginBottom: '0.25rem',
                                      marginTop: '1.5rem',
                                    }}
                                  >
                                    {question}
                                  </dt>
                                  <dd style={{ color: '#cbd5e1', marginBottom: '1.5rem', marginLeft: 0 }}>{answer}</dd>
                                </React.Fragment>
                              );
                            } else if (typeof scenario === 'object' && scenario !== null) {
                              // Handle object format (e.g., { scenario: "Question?", answer: "Answer" })
                              const question = 'scenario' in scenario ? scenario.scenario : '';
                              const answer = 'answer' in scenario ? scenario.answer : '';

                              return (
                                <React.Fragment key={index}>
                                  <dt
                                    style={{
                                      color: '#cbd5e1',
                                      fontWeight: 600,
                                      marginBottom: '0.25rem',
                                      marginTop: '1.5rem',
                                    }}
                                  >
                                    {question}
                                  </dt>
                                  <dd style={{ color: '#cbd5e1', marginBottom: '1.5rem', marginLeft: 0 }}>{answer}</dd>
                                </React.Fragment>
                              );
                            } else {
                              // Fallback for unexpected formats
                              return (
                                <React.Fragment key={index}>
                                  <dd style={{ color: '#cbd5e1', marginBottom: '1.5rem', marginLeft: 0 }}>
                                    {String(scenario)}
                                  </dd>
                                </React.Fragment>
                              );
                            }
                          })}
                        </dl>
                      </Box>
                    </TabPanel>
                  )}
                </>
              );
            })()}
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ color: '#cbd5e1' }}>
              No explanation available for this step.
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default AIExplanationPanel;
