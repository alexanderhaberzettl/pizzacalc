import React from 'react';
import { PRESETS, PizzaPreset, fermentationHint } from '../lib/dough';
import { defaultSettings } from '../context/SettingsContext';

const STEPS: string[] = [
  "Prepare the specified amount of water (30–35°C). Mix 3 tablespoons of it with the yeast in a small container and let it sit.",
  "Roughly mix the rest of the water with the flour. It doesn't need to be a homogeneous dough yet.",
  "After 20 minutes, sprinkle the salt over the dough and add the yeast mixture. Wipe the yeast container with a piece of dough.",
  "Knead the dough by hand or with a kitchen machine (at low speed) for five minutes until a homogeneous dough forms.",
  "Let the dough rest, well covered, for 30–60 minutes. After that time, stretch the dough: take the dough by the edge, pull it up, and before it tears, fold it onto the remaining piece. After 4–5 repetitions, the dough will no longer stretch.",
  "Repeat step 5 another 1–2 times.",
  "Let the dough rise in an airtight container in a cool place (18–20°C) for 12 hours. In a warmer place, it will rise correspondingly faster.",
  "Divide the dough into the number of pizzas you want.",
  "Form small balls and place them seam-side down in an oiled or floured container. It is important that it is airtight (Tupperware with a little oil works well).",
  "After another 2–3 hours of resting at room temperature, start baking. Alternatively, the dough can be refrigerated for up to two days or frozen. Always warm dough at room temperature for 2–3 hours before baking.",
  "Take a ball and shape your pizza with plenty of flour or semolina flour.",
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
  return (
    <div className="view">
      <h1>Recipe</h1>

      <h2 style={{ marginBottom: 12 }}>How to make the dough</h2>
      <section className="card">
        <ol className="recipe-steps">
          {STEPS.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </section>

      <h2 style={{ marginBottom: 12, marginTop: 20 }}>Presets &amp; Settings</h2>
      <DefaultSettingsCard />
      {PRESETS.map(p => <PresetCard key={p.name} preset={p} />)}
    </div>
  );
}
