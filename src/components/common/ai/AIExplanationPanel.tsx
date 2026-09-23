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
import React, { useState, useEffect, useCallback } from 'react';

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
   * All four tabs are shown while a request is in flight so the layout is
   * stable; tabs whose section never arrives disappear once loading finishes.
   */
  const getTabIndices = useCallback(() => {
    if (!explanation && !loading) return { standard: 0, technical: -1, simplified: -1, whatIf: -1 };

    let currentIndex = 1; // Standard is always 0
    const technical = loading || !!(explanation?.technicalDetails || explanation?.technicalCode) ? currentIndex++ : -1;
    const simplified = loading || !!explanation?.simplifiedExplanation ? currentIndex++ : -1;
    const whatIf = loading || (explanation?.whatIfScenarios?.length ?? 0) > 0 ? currentIndex : -1;

    return { standard: 0, technical, simplified, whatIf };
  }, [explanation, loading]);

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
    let cancelled = false;

    const fetchExplanation = async () => {
      if (!isExpanded) return; // Only fetch when expanded

      setLoading(true);
      setError(null);
      setExplanation(null);

      try {
        const data = await getAIExplanation(
          flowType,
          step,
          false,
          step === 0 ? defaultDescription : undefined,
          partial => {
            if (!cancelled) setExplanation(prev => ({ explanation: '', ...prev, ...partial }));
          }
        );
        if (!cancelled) {
          setExplanation(data);
          setTabValue(0);
        }
      } catch (err) {
        if (env.NODE_ENV === 'development') {
          logError('Error fetching AI explanation:', err);
        }
        if (!cancelled) setError('Failed to load explanation. Please try again later.');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setProviderChanged(false);
        }
      }
    };

    fetchExplanation();
    return () => {
      cancelled = true;
    };
  }, [flowType, step, isExpanded, providerChanged, defaultDescription]);

  /**
   * Validates the current tab value against the available explanation content.
   */
  useEffect(() => {
    if (explanation || loading) {
      const tabIndices = getTabIndices();
      const validIndices = [tabIndices.standard, tabIndices.technical, tabIndices.simplified, tabIndices.whatIf].filter(
        index => index >= 0
      );

      if (!validIndices.includes(tabValue)) {
        setTabValue(0);
      }
    }
  }, [explanation, loading, tabValue, getTabIndices]);

  /**
   * Handles tab changes.
   * @param event
   * @param newValue
   */
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    const tabIndices = getTabIndices();
    const validIndices = [tabIndices.standard, tabIndices.technical, tabIndices.simplified, tabIndices.whatIf].filter(
      index => index >= 0
    );

    if (validIndices.includes(newValue)) {
      setTabValue(newValue);
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
        {loading || explanation ? (
          <Box>
            {/* Calculate tab indices based on available content */}
            {(() => {
              const tabIndices = getTabIndices();
              const pendingSpinner = (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={22} />
                </Box>
              );

              return (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleChange}
                      variant="fullWidth"
                      sx={{
                        flex: 1,
                        '& .MuiTab-root': {
                          color: 'text.secondary',
                        },
                        '& .Mui-selected': {
                          color: '#60a5fa !important',
                        },
                      }}
                    >
                      <Tab label="Standard" icon={<SchoolIcon />} iconPosition="start" />
                      {tabIndices.technical >= 0 && <Tab label="Technical" icon={<CodeIcon />} iconPosition="start" />}
                      {tabIndices.simplified >= 0 && (
                        <Tab label="Simplified" icon={<SmartToyIcon />} iconPosition="start" />
                      )}
                      {tabIndices.whatIf >= 0 && (
                        <Tab label="What-if" icon={<HelpOutlineIcon />} iconPosition="start" />
                      )}
                    </Tabs>
                  </Box>

                  <TabPanel value={tabValue} index={tabIndices.standard}>
                    <Box sx={{ display: tabValue === tabIndices.standard ? 'block' : 'none' }}>
                      {explanation?.explanation ? (
                        <Typography variant="body1" sx={{ color: '#cbd5e1' }}>
                          {explanation.explanation}
                        </Typography>
                      ) : (
                        pendingSpinner
                      )}
                    </Box>
                  </TabPanel>

                  {tabIndices.technical >= 0 && (
                    <TabPanel value={tabValue} index={tabIndices.technical}>
                      <Box sx={{ display: tabValue === tabIndices.technical ? 'block' : 'none' }}>
                        {!explanation?.technicalDetails && !explanation?.technicalCode && pendingSpinner}
                        {explanation?.technicalDetails && (
                          <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 3, fontFamily: 'inherit' }}>
                            {explanation.technicalDetails}
                          </Typography>
                        )}

                        {explanation?.technicalCode && (
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

                  {tabIndices.simplified >= 0 && (
                    <TabPanel value={tabValue} index={tabIndices.simplified}>
                      <Box sx={{ display: tabValue === tabIndices.simplified ? 'block' : 'none' }}>
                        {explanation?.simplifiedExplanation ? (
                          <Typography variant="body1" sx={{ color: '#cbd5e1' }}>
                            {explanation.simplifiedExplanation}
                          </Typography>
                        ) : (
                          pendingSpinner
                        )}
                      </Box>
                    </TabPanel>
                  )}

                  {tabIndices.whatIf >= 0 && (
                    <TabPanel value={tabValue} index={tabIndices.whatIf}>
                      <Box
                        sx={{
                          display: tabValue === tabIndices.whatIf ? 'block' : 'none',
                        }}
                      >
                        {explanation?.whatIfScenarios && explanation.whatIfScenarios.length > 0 ? (
                          <dl style={{ margin: 0, padding: 0 }}>
                            {explanation.whatIfScenarios.map((scenario, index) => {
                              if (typeof scenario === 'string') {
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
                                    <dd style={{ color: '#cbd5e1', marginBottom: '1.5rem', marginLeft: 0 }}>
                                      {answer}
                                    </dd>
                                  </React.Fragment>
                                );
                              } else if (typeof scenario === 'object' && scenario !== null) {
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
                                    <dd style={{ color: '#cbd5e1', marginBottom: '1.5rem', marginLeft: 0 }}>
                                      {answer}
                                    </dd>
                                  </React.Fragment>
                                );
                              } else {
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
                        ) : (
                          pendingSpinner
                        )}
                      </Box>
                    </TabPanel>
                  )}
                </>
              );
            })()}
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, color: 'error.main' }}>
            <Typography>{error}</Typography>
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
