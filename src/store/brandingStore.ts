import { create } from 'zustand';
import { shm_request, normalizeListResponse } from '../lib/shm_request';

export interface BrandingSettings {
  appName: string;
  appTitle: string;
  logoUrl: string;
  primaryColor: string;
  loginSubtitle: string;
}

interface BrandingState {
  branding: BrandingSettings;
  loading: boolean;
  loaded: boolean;
  fetchBranding: () => Promise<void>;
  refetchBranding: () => Promise<void>;
  updateBranding: (settings: Partial<BrandingSettings>) => Promise<void>;
  resetBranding: () => Promise<void>;
}

const DEFAULT_BRANDING: BrandingSettings = {
  appName: 'SHM Admin',
  appTitle: 'SHM Admin',
  logoUrl: '',
  primaryColor: '#22d3ee',
  loginSubtitle: 'Войдите в систему управления',
};

export const useBrandingStore = create<BrandingState>((set, get) => ({
  branding: DEFAULT_BRANDING,
  loading: false,
  loaded: false,

  fetchBranding: async () => {
    if (get().loaded) return;

    set({ loading: true });
    try {
      // Получаем настройки компании из SHM API
      const result = await shm_request('shm/v1/company');
      if (result.status === 200 && result.data?.[0]) {
        const company = result.data[0];
        const branding = {
          ...DEFAULT_BRANDING,
          appName: company.name || DEFAULT_BRANDING.appName,
          appTitle: company.title || DEFAULT_BRANDING.appTitle,
        };
        set({ branding, loaded: true });
        document.title = branding.appTitle;
      } else {
        set({ branding: DEFAULT_BRANDING, loaded: true });
        document.title = DEFAULT_BRANDING.appTitle;
      }
    } catch (error) {
      // Тихо игнорируем ошибки (например, 401 для неавторизованных)
      set({ branding: DEFAULT_BRANDING, loaded: true });
      document.title = DEFAULT_BRANDING.appTitle;
    } finally {
      set({ loading: false });
    }
  },

  refetchBranding: async () => {
    set({ loaded: false });
    await get().fetchBranding();
  },

  updateBranding: async (settings) => {
    set({ loading: true });
    try {
      const newBranding = { ...get().branding, ...settings };

      // Сохраняем в SHM API через admin/config
      const configData = {
        name: newBranding.appName,
        title: newBranding.appTitle || newBranding.appName,
      };

      const result = await shm_request('shm/v1/admin/config', {
        method: 'POST',
        body: JSON.stringify({
          key: 'company',
          value: configData
        }),
      });

      // Проверяем статус ответа
      if (result.status === 200) {
        set({ branding: newBranding });
        document.title = newBranding.appTitle || newBranding.appName;
      } else {
        throw new Error(`API returned status ${result.status}`);
      }
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetBranding: async () => {
    set({ loading: true });
    try {
      const defaultConfig = {
        name: DEFAULT_BRANDING.appName,
        title: DEFAULT_BRANDING.appTitle,
      };

      const result = await shm_request('shm/v1/admin/config', {
        method: 'POST',
        body: JSON.stringify({
          key: 'company',
          value: defaultConfig
        }),
      });

      // Проверяем статус ответа
      if (result.status === 200) {
        set({ branding: DEFAULT_BRANDING });
        document.title = DEFAULT_BRANDING.appTitle;
      } else {
        throw new Error(`API returned status ${result.status}`);
      }
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
