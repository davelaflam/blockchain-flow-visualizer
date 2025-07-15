import { AIProviderType } from './AIProviderTypes';

export interface AIProviderSelectorProps {
  onChange?: (providerType: AIProviderType) => void;
}
