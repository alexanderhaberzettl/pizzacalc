import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Settings {
  ballWeight: number;             // grams per dough ball
  saltRatio: number;              // % of flour
  includeOliveOil: boolean;
  oliveOilRatio: number;          // % of flour
  includeSugar: boolean;
  sugarRatio: number;             // % of flour
  yeastOvernight: number;         // % of flour
  yeast9h: number;                // % of flour
  yeast3h: number;                // % of flour
}

export const defaultSettings: Settings = {
  ballWeight: 335,
  saltRatio: 2.0,
  includeOliveOil: false,
  oliveOilRatio: 2.0,
  includeSugar: false,
  sugarRatio: 1.5,
  yeastOvernight: 0.08,
  yeast9h: 0.30,
  // Bumped from 0.7% so a 3h same-day dough actually proofs in 3 hours.
  yeast3h: 1.20,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  resetToDefault: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'pizzacalc.settings.v3';

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [settings]);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const resetToDefault = () => setSettings(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetToDefault }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}

export function yeastPctFor(settings: Settings, label: string): number {
  switch (label) {
    case 'Overnight': return settings.yeastOvernight;
    case '9 hours': return settings.yeast9h;
    case '3 hours': return settings.yeast3h;
    default: return settings.yeastOvernight;
  }
}
