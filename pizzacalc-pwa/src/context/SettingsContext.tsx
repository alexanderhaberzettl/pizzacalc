import React, { createContext, useContext, useEffect, useState } from 'react';
import { YeastType } from '../lib/dough';

export interface Settings {
  ballWeight: number;             // grams per dough ball
  saltRatio: number;              // % of flour
  includeOliveOil: boolean;
  oliveOilRatio: number;          // % of flour
  includeSugar: boolean;
  sugarRatio: number;             // % of flour
  yeastOvernight: number;         // % of flour
  yeast48h: number;               // % of flour
  yeast9h: number;                // % of flour
  yeast3h: number;                // % of flour
  yeastType: YeastType;           // which yeast results are shown in
}

export const defaultSettings: Settings = {
  ballWeight: 335,
  saltRatio: 2.5,
  includeOliveOil: false,
  oliveOilRatio: 2.0,
  includeSugar: false,
  sugarRatio: 1.5,
  // Overnight = ~12h at a cool 18–20°C room temperature (no fridge).
  yeastOvernight: 0.08,
  // 48 hours = mostly in the fridge, where yeast is much slower.
  yeast48h: 0.15,
  // 9 hours at 20–22°C; 0.3% tended to over-proof in a warm kitchen.
  yeast9h: 0.20,
  // Bumped from 0.7% so a 3h same-day dough actually proofs in 3 hours.
  yeast3h: 1.20,
  yeastType: 'instant',
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  resetToDefault: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'pizzacalc.settings.v4';
const LEGACY_STORAGE_KEY = 'pizzacalc.settings.v3';

/** Defaults that changed in v4. Stored values still equal to the old default
 * were never customized, so they move to the new default. */
const V3_DEFAULTS: Partial<Settings> = { saltRatio: 2.0, yeast48h: 0.03, yeast9h: 0.30 };

function migrateV3(parsed: Partial<Settings>): Partial<Settings> {
  const migrated = { ...parsed };
  (Object.keys(V3_DEFAULTS) as (keyof Settings)[]).forEach(key => {
    if (migrated[key] === V3_DEFAULTS[key]) delete migrated[key];
  });
  return migrated;
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) return { ...defaultSettings, ...migrateV3(JSON.parse(legacy)) };
    return defaultSettings;
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
    case '48 hours': return settings.yeast48h;
    case '9 hours': return settings.yeast9h;
    case '3 hours': return settings.yeast3h;
    default: return settings.yeastOvernight;
  }
}
