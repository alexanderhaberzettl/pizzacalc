import React from 'react';
import { useSettings } from '../context/SettingsContext';

export default function SettingsView() {
  const { settings, updateSettings, resetToDefault } = useSettings();

  return (
    <div className="view">
      <h1>Advanced Settings</h1>

      <section className="card">
        <h2>Dough Ball Sizes</h2>
        <SliderRow
          label="Normal"
          value={settings.normalPizzaDoughBallWeight}
          min={150} max={750} step={5} suffix="g"
          onChange={v => updateSettings({ normalPizzaDoughBallWeight: v })}
        />
        <SliderRow
          label="Thin Crust"
          value={settings.thinCrustDoughBallWeight}
          min={150} max={750} step={5} suffix="g"
          onChange={v => updateSettings({ thinCrustDoughBallWeight: v })}
        />
      </section>

      <section className="card">
        <h2>Salt</h2>
        <SliderRow
          label="Salt"
          value={settings.saltRatio}
          min={1.0} max={3.5} step={0.1} suffix="% of flour" decimals={1}
          onChange={v => updateSettings({ saltRatio: v })}
        />
        <p className="hint">Typical range: 2.0–2.8% for most styles.</p>
      </section>

      <section className="card">
        <h2>Olive Oil</h2>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.includeOliveOil}
            onChange={e => updateSettings({ includeOliveOil: e.target.checked })}
          />
          <span>Include olive oil</span>
        </label>
        {settings.includeOliveOil && (
          <SliderRow
            label="Oil"
            value={settings.oliveOilRatio}
            min={0.5} max={6.0} step={0.1} suffix="% of flour" decimals={1}
            onChange={v => updateSettings({ oliveOilRatio: v })}
          />
        )}
      </section>

      <section className="card">
        <h2>Sugar / Malt</h2>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.includeSugar}
            onChange={e => updateSettings({ includeSugar: e.target.checked })}
          />
          <span>Include sugar</span>
        </label>
        {settings.includeSugar && (
          <>
            <SliderRow
              label="Sugar"
              value={settings.sugarRatio}
              min={0.5} max={5.0} step={0.1} suffix="% of flour" decimals={1}
              onChange={v => updateSettings({ sugarRatio: v })}
            />
            <p className="hint">Common in NY-style doughs to aid browning.</p>
          </>
        )}
      </section>

      <section className="card">
        <h2>Yeast (% of flour, instant dry)</h2>
        <SliderRow
          label="Overnight"
          value={settings.yeastOvernight}
          min={0.03} max={0.30} step={0.01} suffix="%" decimals={3}
          onChange={v => updateSettings({ yeastOvernight: v })}
        />
        <SliderRow
          label="9 hours"
          value={settings.yeast9h}
          min={0.10} max={0.80} step={0.05} suffix="%" decimals={2}
          onChange={v => updateSettings({ yeast9h: v })}
        />
        <SliderRow
          label="3 hours"
          value={settings.yeast3h}
          min={0.50} max={2.50} step={0.10} suffix="%" decimals={2}
          onChange={v => updateSettings({ yeast3h: v })}
        />
        <p className="hint">For fresh yeast, multiply values by ~3.</p>
      </section>

      <button className="calc-btn danger" onClick={resetToDefault}>
        Reset to Defaults
      </button>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number; max: number; step: number;
  suffix: string;
  decimals?: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, suffix, decimals = 0, onChange }: SliderRowProps) {
  return (
    <div className="slider-row">
      <div className="slider-label">
        <span>{label}</span>
        <span className="slider-value">{value.toFixed(decimals)} {suffix}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
