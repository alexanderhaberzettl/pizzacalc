import React, { useState } from 'react';
import {
  PRESETS,
  PizzaPreset,
  fermentationHint,
  buildMethodSteps,
  FERMENTATION_SCHEDULES,
  FermentationLabel,
  DoughMethod,
} from '../lib/dough';
import { defaultSettings } from '../context/SettingsContext';

const FERMENTATION_OPTIONS: FermentationLabel[] = ['48 hours', 'Overnight', '9 hours', '3 hours'];
const METHOD_OPTIONS: { value: DoughMethod; label: string }[] = [
  { value: 'kneaded', label: 'Kneaded' },
  { value: 'no-knead', label: 'No-knead' },
];

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-pill">
      <span className="stat-pill-label">{label}</span>
      <span className="stat-pill-value">{value}</span>
    </div>
  );
}

function PresetCard({ preset }: { preset: PizzaPreset }) {
  return (
    <section className="card recipe-preset-card">
      <div className="recipe-preset-header">
        <div>
          <div className="recipe-preset-name">{preset.name}</div>
          <div className="recipe-preset-desc">{preset.description}</div>
        </div>
      </div>
      <div className="stat-pills">
        <StatPill label="Hydration" value={`${Math.round(preset.hydration * 100)}%`} />
        <StatPill label="Ball weight" value={`${preset.ballWeight}g`} />
        <StatPill label="Salt" value={`${preset.saltPct}%`} />
        <StatPill label="Fermentation" value={preset.yeastLabel} />
        <StatPill label="Ferment temp" value={FERMENTATION_SCHEDULES[preset.yeastLabel].bulkTemp} />
        {preset.method === 'no-knead' && <StatPill label="Method" value="No-knead" />}
        {preset.includeOil && <StatPill label="Olive oil" value={`${preset.oilPct}%`} />}
        {preset.includeSugar && <StatPill label="Sugar" value={`${preset.sugarPct}%`} />}
      </div>
      <p className="hint" style={{ marginTop: 8 }}>{fermentationHint(preset.yeastLabel)}</p>
    </section>
  );
}

function DefaultSettingsCard() {
  const d = defaultSettings;
  return (
    <section className="card recipe-preset-card">
      <div className="recipe-preset-header">
        <div>
          <div className="recipe-preset-name">Default Settings</div>
          <div className="recipe-preset-desc">Baseline values used when no preset is applied</div>
        </div>
      </div>
      <div className="stat-pills">
        <StatPill label="Ball weight" value={`${d.ballWeight}g`} />
        <StatPill label="Salt" value={`${d.saltRatio}%`} />
        <StatPill label="48h yeast" value={`${d.yeast48h}%`} />
        <StatPill label="Overnight yeast" value={`${d.yeastOvernight}%`} />
        <StatPill label="9h yeast" value={`${d.yeast9h}%`} />
        <StatPill label="3h yeast" value={`${d.yeast3h}%`} />
        {d.includeOliveOil && <StatPill label="Olive oil" value={`${d.oliveOilRatio}%`} />}
        {d.includeSugar && <StatPill label="Sugar" value={`${d.sugarRatio}%`} />}
      </div>
    </section>
  );
}

export default function RecipesView() {
  const [fermentation, setFermentation] = useState<FermentationLabel>('Overnight');
  const [method, setMethod] = useState<DoughMethod>('kneaded');
  const schedule = FERMENTATION_SCHEDULES[fermentation];
  const shortNoKnead = method === 'no-knead' && (fermentation === '3 hours' || fermentation === '9 hours');

  return (
    <div className="view">
      <h1>Recipe</h1>

      <h2 style={{ marginBottom: 12 }}>How to make the dough</h2>
      <section className="card">
        <label className="card-label">Fermentation</label>
        <div className="segmented">
          {FERMENTATION_OPTIONS.map(t => (
            <button
              key={t}
              className={fermentation === t ? 'seg active' : 'seg'}
              onClick={() => setFermentation(t)}
            >{t}</button>
          ))}
        </div>
        <label className="card-label" style={{ marginTop: 12 }}>Method</label>
        <div className="segmented">
          {METHOD_OPTIONS.map(m => (
            <button
              key={m.value}
              className={method === m.value ? 'seg active' : 'seg'}
              onClick={() => setMethod(m.value)}
            >{m.label}</button>
          ))}
        </div>
        <div className="stat-pills" style={{ marginTop: 12 }}>
          <StatPill label="Water" value={schedule.waterTemp} />
          <StatPill label="Bulk" value={schedule.bulkTemp} />
          <StatPill label="Ball rest" value={schedule.ballRest} />
        </div>
        {shortNoKnead && (
          <p className="hint" style={{ marginTop: 8 }}>
            No-knead dough needs a long fermentation to develop gluten — overnight or longer works best.
          </p>
        )}
      </section>
      <section className="card">
        <ol className="recipe-steps">
          {buildMethodSteps(fermentation, method).map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </section>

      <h2 style={{ marginBottom: 12, marginTop: 20 }}>Presets &amp; Settings</h2>
      <DefaultSettingsCard />
      {PRESETS.map(p => <PresetCard key={p.name} preset={p} />)}
    </div>
  );
}
