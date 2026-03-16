import { PluginConfig } from './types';

const DEFAULT_CONFIG: PluginConfig = {
  taskSystemUrl: 'http://localhost:3000',
  autoSync: false,
  showNotifications: true,
  checkInterval: 60000,
  enabledSites: {
    koa: true,
    plm: true,
    ts: true
  }
};

export async function getConfig(): Promise<PluginConfig> {
  const result = await chrome.storage.local.get('pluginConfig');
  return result.pluginConfig || DEFAULT_CONFIG;
}

export async function setConfig(config: Partial<PluginConfig>): Promise<void> {
  const current = await getConfig();
  const updated = { ...current, ...config };
  await chrome.storage.local.set({ pluginConfig: updated });
}

export async function resetConfig(): Promise<void> {
  await chrome.storage.local.set({ pluginConfig: DEFAULT_CONFIG });
}

export async function getApiUrl(): Promise<string> {
  const config = await getConfig();
  return config.taskSystemUrl;
}

export { DEFAULT_CONFIG };
