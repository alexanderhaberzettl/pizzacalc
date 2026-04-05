import React, { useState } from 'react';
import { useSettings, yeastPctFor } from '../context/SettingsContext';
import {
  calculateDough,
  formatGrams,
  fermentationHint,
  buildShareText,
  PRESETS,
  DoughResult,
  PizzaPreset,
} from '../lib/dough';

const PIZZA_TYPES = ['Normal', 'Thin Crust'] as const;
const HYDRATIONS = [0.60, 0.65, 0.70, 0.75];
const YEAST_OPTIONS = ['Overnight', '9 hours', '3 hours'] as const;

export default function CalculatorView() {
  const { settings, updateSettings } = useSettings();
  const [pizzaType, setPizzaType] = useState<'Normal' | 'Thin Crust'>('Normal');
  const [amountOfPizzas, setAmountOfPizzas] = useState(1);
  const [hydration, setHydration] = useState(0.65);
  const [yeastLabel, setYeastLabel] = useState<typeof YEAST_OPTIONS[number]>('Overnight');
  const [result, setResult] = useState<DoughResult | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const ballWeight = pizzaType === 'Normal'
      ? settings.normalPizzaDoughBallWeight
      : settings.thinCrustDoughBallWeight;

    setResult(calculateDough({
      ballWeight,
      numBalls: amountOfPizzas,
      hydration,
      saltPct: settings.saltRatio,
      yeastPct: yeastPctFor(settings, yeastLabel),
      oilPct: settings.includeOliveOil ? settings.oliveOilRatio : null,
      sugarPct: settings.includeSugar ? settings.sugarRatio : null,
    }));
  };

  const applyPreset = (p: PizzaPreset) => {
    updateSettings({
      normalPizzaDoughBallWeight: p.ballWeight,
      saltRatio: p.saltPct,
      includeOliveOil: p.includeOil,
      oliveOilRatio: p.oilPct,
      includeSugar: p.includeSugar,
      sugarRatio: p.sugarPct,
    });
    setPizzaType('Normal');
    setHydration(p.hydration);
    setYeastLabel(p.yeastLabel);
    setShowPresets(false);
  };

  const share = async () => {
    if (!result) return;
    const text = buildShareText(result);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pizzacalc Recipe', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled or permission denied */
    }
  };

  return (
    <div className="view">
      <h1>Calculator</h1>

      <section className="card">
        <button className="preset-btn" onClick={() => setShowPresets(true)}>
          ✨ Apply a style preset
        </button>
      </section>

      <section className="card">
        <label className="card-label">Pizza Type</label>
        <div className="segmented">
          {PIZZA_TYPES.map(t => (
            <button
              key={t}
              className={pizzaType === t ? 'seg active' : 'seg'}
              onClick={() => setPizzaType(t)}
            >{t}</button>
          ))}
        </div>
      </section>

      <section className="card">
        <label className="card-label">Fermentation</label>
        <div className="segmented">
          {YEAST_OPTIONS.map(t => (
            <button
              key={t}
              className={yeastLabel === t ? 'seg active' : 'seg'}
              onClick={() => setYeastLabel(t)}
            >{t}</button>
          ))}
        </div>
        <p className="hint">{fermentationHint(yeastLabel)}</p>
      </section>

      <section className="card">
        <label className="card-label">Amount of Pizzas</label>
        <div className="stepper">
          <button
            onClick={() => setAmountOfPizzas(n => Math.max(1, n - 1))}
            aria-label="Decrease"
          >−</button>
          <span>{amountOfPizzas}</span>
          <button
            onClick={() => setAmountOfPizzas(n => Math.min(50, n + 1))}
            aria-label="Increase"
          >+</button>
        </div>
      </section>

      <section className="card">
        <label className="card-label">Hydration</label>
        <div className="segmented">
          {HYDRATIONS.map(h => (
            <button
              key={h}
              className={hydration === h ? 'seg active' : 'seg'}
              onClick={() => setHydration(h)}
            >{Math.round(h * 100)}%</button>
          ))}
        </div>
        <p className="hint">Lower hydration is easier to handle. Higher hydration gives a more open, Neapolitan-style crumb.</p>
      </section>

      <button className="calc-btn" onClick={calculate}>Calculate</button>

      {result && (
        <>
          <section className="card">
            <h2>Per Ball ({Math.round(result.ballWeight)}g × {result.numBalls})</h2>
            <Row label="Flour" value={formatGrams(result.flour / result.numBalls)} />
            <Row label="Water" value={formatGrams(result.water / result.numBalls)} />
            <Row label="Salt" value={formatGrams(result.salt / result.numBalls)} />
            <Row label="Yeast" value={formatGrams(result.yeast / result.numBalls)} />
            {result.oil != null && <Row label="Olive Oil" value={formatGrams(result.oil / result.numBalls)} />}
            {result.sugar != null && <Row label="Sugar" value={formatGrams(result.sugar / result.numBalls)} />}
          </section>

          <section className="card">
            <h2>Total Batch</h2>
            <Row label="Flour" value={formatGrams(result.flour)} />
            <Row label="Water" value={formatGrams(result.water)} />
            <Row label="Salt" value={formatGrams(result.salt)} />
            <Row label="Yeast" value={formatGrams(result.yeast)} />
            {result.oil != null && <Row label="Olive Oil" value={formatGrams(result.oil)} />}
            {result.sugar != null && <Row label="Sugar" value={formatGrams(result.sugar)} />}
            <Row label="Total" value={formatGrams(result.totalWeight)} bold />
          </section>

          <section className="card">
            <h2>Baker's Percentages</h2>
            <Row label="Hydration" value={`${Math.round(result.hydrationPct)}%`} />
            <Row label="Salt" value={`${result.saltPct.toFixed(2)}%`} />
            <Row label="Yeast" value={`${result.yeastPct.toFixed(3)}%`} />
          </section>

          <button className="calc-btn secondary" onClick={share}>
            {copied ? '✓ Copied to clipboard' : '📋 Copy / Share Recipe'}
          </button>
        </>
      )}

      {showPresets && (
        <div className="modal-backdrop" onClick={() => setShowPresets(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Style Presets</h2>
              <button onClick={() => setShowPresets(false)}>Close</button>
            </div>
            {PRESETS.map(p => (
              <button key={p.name} className="preset-row" onClick={() => applyPreset(p)}>
                <div className="preset-name">{p.name}</div>
                <div className="preset-desc">{p.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={bold ? 'row row-bold' : 'row'}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
