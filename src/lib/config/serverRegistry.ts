import configManager from './index';
import { ConfigModelProvider } from './types';

export const getConfiguredModelProviders = (): ConfigModelProvider[] => {
  return configManager.getConfig('modelProviders', []);
};

export const getConfiguredModelProviderById = (
  id: string,
): ConfigModelProvider | undefined => {
  return getConfiguredModelProviders().find((p) => p.id === id) ?? undefined;
};

export const getSearxngURL = () =>
  configManager.getEffectiveSearchValue('searxngURL', 'SEARXNG_API_URL');

export const getSearxngAuthHeader = () =>
  configManager.getEffectiveSearchValue(
    'searxngAuthHeader',
    'SEARXNG_AUTH_HEADER',
  );

export const getSearxngAuthValue = () =>
  configManager.getEffectiveSearchValue(
    'searxngAuthValue',
    'SEARXNG_AUTH_VALUE',
  );
