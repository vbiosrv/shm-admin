import { create } from 'zustand';

export interface BrandingSettings {
  appName: string;
  appTitle: string;
  logoUrl: string;
  primaryColor: string;
  loginTitle: string;
  loginSubtitle: string;
}

interface BrandingState {
  branding: BrandingSettings;
  loading: boolean;
  loaded: boolean;
  fetchBranding: () => Promise<void>;
  updateBranding: (settings: Partial<BrandingSettings>) => Promise<void>;
  resetBranding: () => Promise<void>;
}

const DEFAULT_BRANDING: BrandingSettings = {
  appName: 'SHM Admin',
  appTitle: 'SHM Admin',
  logoUrl: '',
  primaryColor: '#22d3ee',
  loginTitle: 'SHM Admin',
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
      const response = await fetch('/api/branding');
      if (response.ok) {
        const data = await response.json();
        set({ branding: { ...DEFAULT_BRANDING, ...data }, loaded: true });
      }
    } catch (error) {
    } finally {
      set({ loading: false });
    }
  },

  updateBranding: async (settings) => {
    set({ loading: true });
    try {
      const newBranding = { ...get().branding, ...settings };
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranding),
      });
      
      if (response.ok) {
        const { data } = await response.json();
        set({ branding: data });
        document.title = data.appTitle || data.appName;
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
      const response = await fetch('/api/branding', { method: 'DELETE' });
      if (response.ok) {
        set({ branding: DEFAULT_BRANDING });
        document.title = DEFAULT_BRANDING.appTitle;
      }
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
