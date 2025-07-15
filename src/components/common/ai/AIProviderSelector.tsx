import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Tooltip } from '@mui/material';
import React, { useState, useEffect } from 'react';

import { AIProviderFactory } from '../../../services/ai/providers/AIProviderFactory';

import { AIProviderSelectorProps } from './types/AIProviderSelectorTypes';
import { AIProviderType, setCurrentProviderType, getCurrentProviderType } from './types/AIProviderTypes';

/**
 * AIProviderSelector component allows users to select an AI provider.
 * @param onChange
 * @constructor
 */
const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({ onChange }) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(getCurrentProviderType());
  const providers = AIProviderFactory.getInstance().getAllProviders();

  /**
   * Handles the change event for the AI provider selector.
   * @param event
   */
  const handleChange = (event: SelectChangeEvent) => {
    const newProvider = event.target.value as AIProviderType;
    setSelectedProvider(newProvider);
    setCurrentProviderType(newProvider);

    if (onChange) {
      onChange(newProvider);
    }
  };

  /**
   * Effect to set the initial provider based on localStorage
   */
  useEffect(() => {
    const currentProvider = getCurrentProviderType();
    const currentProviderInfo = providers.find(p => p.type === currentProvider);

    /**
     * If the current provider does not have an API key, we will automatically switch to the first available provider that has an API key.
     */
    if (currentProviderInfo && !currentProviderInfo.hasApiKey) {
      const availableProvider = providers.find(p => p.hasApiKey);
      if (availableProvider) {
        setSelectedProvider(availableProvider.type);
        setCurrentProviderType(availableProvider.type);
        if (onChange) {
          onChange(availableProvider.type);
        }
      } else {
        /**
         * If no provider has an API key, we will keep the current provider selected
         */
        setSelectedProvider(currentProvider);
      }
    } else {
      setSelectedProvider(currentProvider);
    }
  }, [providers, onChange]);

  return (
    <Box sx={{ minWidth: 120, maxWidth: 200 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="ai-provider-select-label">AI Provider</InputLabel>
        <Select
          labelId="ai-provider-select-label"
          id="ai-provider-select"
          value={selectedProvider}
          label="AI Provider"
          onChange={handleChange}
          sx={{
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            color: '#cbd5e1',
            '& .MuiSelect-icon': {
              color: '#cbd5e1',
            },
          }}
        >
          {providers.map(provider => (
            <MenuItem
              key={provider.type}
              value={provider.type}
              disabled={!provider.hasApiKey}
              sx={{
                opacity: provider.hasApiKey ? 1 : 0.5,
                '&.Mui-disabled': {
                  color: 'text.disabled',
                },
              }}
            >
              {provider.name}
              {!provider.hasApiKey && (
                <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.disabled' }}>
                  (API key not set)
                </Box>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default AIProviderSelector;
