import React, { useState } from 'react';
import {
  calculateNerdDough,
  formatGrams,
  fermentationHint,
  buildNerdShareText,
  getSourdoughEstimates,
  PreFermentType,
  NerdDoughResult,
} from '../lib/dough';

// ─── Local helper types ───────────────────────────────────────────────────────

type YeastLabel = '48 hours' | 'Overnight' | '9 hours' | '3 hours';
type LeaveningType = 'yeast' | 'sourdough';

const YEAST_OPTIONS: YeastLabel[] = ['48 hours', 'Overnight', '9 hours', '3 hours'];
const HYDRATIONS = [0.60, 0.65, 0.70, 0.75];
const PRE_FERMENT_OPTIONS: PreFermentType[] = ['none', 'poolish', 'biga', 'tiga'];

// ─── Default local settings ───────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  ballWeight: 280,
  saltRatio: 2.0,
  includeOliveOil: false,
  oliveOilRatio: 2.0,
  includeSugar: false,
  sugarRatio: 1.5,
  yeastOvernight: 0.08,
  yeast48h: 0.03,
  yeast9h: 0.30,
  yeast3h: 1.20,
};

function yeastPctFor(
  settings: typeof DEFAULT_SETTINGS,
  label: YeastLabel
): number {
  switch (label) {
    case 'Overnight': return settings.yeastOvernight;
    case '48 hours': return settings.yeast48h;
    case '9 hours': return settings.yeast9h;
    case '3 hours': return settings.yeast3h;
  }
}

// ─── Sub-components (local copies, not imported from CalculatorView) ──────────

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={bold ? 'row row-bold' : 'row'}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, suffix, decimals = 0, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  suffix: string; decimals?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="slider-row">
      <div className="slider-label">
        <span>{label}</span>
        <span className="slider-value">{value.toFixed(decimals)} {suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

function Collapsible({
  title, open, onToggle, children,
}: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <section className="card collapsible">
      <button className="collapsible-header" onClick={onToggle} aria-expanded={open}>
        <h2>{title}</h2>
        <span className={open ? 'chevron open' : 'chevron'} aria-hidden="true" />
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NerdModeView() {
  // Local settings state (NOT from SettingsContext)
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const updateSettings = (partial: Partial<typeof DEFAULT_SETTINGS>) =>
    setSettings(prev => ({ ...prev, ...partial }));
  const resetSettings = () => setSettings({ ...DEFAULT_SETTINGS });

  // Per-calculation state
  const [amountOfPizzas, setAmountOfPizzas] = useState(2);
  const [hydration, setHydration] = useState(0.65);
  const [yeastLabel, setYeastLabel] = useState<YeastLabel>('Overnight');
  const [leaveningType, setLeaveningType] = useState<LeaveningType>('yeast');
  const [preFermentType, setPreFermentType] = useState<PreFermentType>('none');
  const [preFermentFlourPct, setPreFermentFlourPct] = useState(20);
  const [starterPct, setStarterPct] = useState(20);
  const [wholeGrainPct, setWholeGrainPct] = useState(0);

  // Result & UI state
  const [result, setResult] = useState<NerdDoughResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [perBallOpen, setPerBallOpen] = useState(false);
  const [bakersOpen, setBakersOpen] = useState(false);

  const isSourdough = leaveningType === 'sourdough';

  const calculate = () => {
    setResult(calculateNerdDough({
      ballWeight: settings.ballWeight,
      numBalls: amountOfPizzas,
      hydration,
      saltPct: settings.saltRatio,
      yeastPct: isSourdough ? 0 : yeastPctFor(settings, yeastLabel),
      oilPct: settings.includeOliveOil ? settings.oliveOilRatio : null,
      sugarPct: settings.includeSugar ? settings.sugarRatio : null,
      yeastLabel: isSourdough ? 'Overnight' : yeastLabel,
      preFermentType,
      preFermentFlourPct,
      isSourdough,
      starterPct,
      wholeGrainPct,
    }));
  };

  const share = async () => {
    if (!result) return;
    const text = buildNerdShareText(result);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pizzacalc Nerd Mode Recipe', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled or permission denied */
    }
  };

  const wholeGrainLabel =
    wholeGrainPct === 0 ? '100% white flour'
    : wholeGrainPct === 100 ? '100% whole grain'
    : `${100 - wholeGrainPct}% white / ${wholeGrainPct}% whole grain`;

  const pfLabel = (t: PreFermentType) => {
    if (t === 'none') return 'None';
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  const pfResultTitle = () => {
    if (!result || result.preFerment === null) return '';
    return `${pfLabel(preFermentType)} (${preFermentFlourPct}% of flour)`;
  };

  return (
    <div className="view">
      <h1>Nerd Mode</h1>

      <div className="disclaimer-card">
        Use at your own risk. This is for nerds only. No guarantees.
      </div>

      {/* Leavening type */}
      <section className="card">
        <label className="card-label">Leavening</label>
        <div className="segmented">
          {(['yeast', 'sourdough'] as LeaveningType[]).map(t => (
            <button
              key={t}
              className={leaveningType === t ? 'seg active' : 'seg'}
              onClick={() => setLeaveningType(t)}
            >
              {t === 'yeast' ? 'Yeast' : 'Sourdough'}
            </button>
          ))}
        </div>
      </section>

      {/* Pre-ferment card */}
      <section className="card">
        <label className="card-label">Pre-ferment</label>
        <div className="segmented">
          {PRE_FERMENT_OPTIONS.map(t => (
            <button
              key={t}
              className={preFermentType === t ? 'seg active' : 'seg'}
              onClick={() => setPreFermentType(t)}
            >
              {pfLabel(t)}
            </button>
          ))}
        </div>
        {preFermentType !== 'none' && (
          <div style={{ marginTop: 16 }}>
            <SliderRow
              label="Pre-ferment flour"
              value={preFermentFlourPct}
              min={15} max={40} step={1} suffix="%"
              onChange={setPreFermentFlourPct}
            />
          </div>
        )}
      </section>

      {/* Sourdough starter */}
      {isSourdough && (
        <section className="card">
          <label className="card-label">Starter</label>
          <SliderRow
            label="Starter (% of flour)"
            value={starterPct}
            min={10} max={35} step={1} suffix="%"
            onChange={setStarterPct}
          />
          <p className="hint">Assumes 100% hydration starter.</p>
        </section>
      )}

      {/* Fermentation */}
      {!isSourdough ? (
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
      ) : (
        <section className="card">
          <label className="card-label">Fermentation</label>
          <p className="sourdough-disclaimer">
            Fermentation times for sourdough depend heavily on your starter's activity, temperature, and the season. The estimates below assume a healthy, active starter.
          </p>
          <div className="sourdough-estimates">
            {getSourdoughEstimates(starterPct).map(e => (
              <div key={e.label} className="sourdough-estimate-row">
                <div className="sourdough-estimate-label">{e.label}</div>
                <div className="sourdough-estimate-times">
                  <span>{e.bulk}</span>
                  <span>{e.proof}</span>
                </div>
                <div className="sourdough-estimate-note">{e.note}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Amount of pizzas */}
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

      {/* Hydration */}
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
      </section>

      {/* Whole grain */}
      <section className="card">
        <label className="card-label">Whole Grain</label>
        <SliderRow
          label="Whole Grain %"
          value={wholeGrainPct}
          min={0} max={100} step={5} suffix="%"
          onChange={setWholeGrainPct}
        />
        <p className="hint">{wholeGrainLabel}</p>
      </section>

      {/* Recipe settings — always visible */}
      <section className="card">
        <div className="nerd-section-title">Recipe Settings</div>

        <div className="settings-section">
          <span className="settings-section-label">Dough Ball Weight</span>
          <SliderRow label="Per ball" value={settings.ballWeight} min={150} max={750} step={5} suffix="g"
            onChange={v => updateSettings({ ballWeight: v })} />
        </div>

        <div className="settings-section">
          <span className="settings-section-label">Salt</span>
          <SliderRow label="Salt" value={settings.saltRatio} min={1.0} max={3.5} step={0.1} suffix="% flour" decimals={1}
            onChange={v => updateSettings({ saltRatio: v })} />
        </div>

        <div className="settings-section">
          <span className="settings-section-label">Olive Oil</span>
          <label className="toggle">
            <input type="checkbox" checked={settings.includeOliveOil}
              onChange={e => updateSettings({ includeOliveOil: e.target.checked })} />
            <span>Include olive oil</span>
          </label>
          {settings.includeOliveOil && (
            <SliderRow label="Oil" value={settings.oliveOilRatio} min={0.5} max={6.0} step={0.1} suffix="% flour" decimals={1}
              onChange={v => updateSettings({ oliveOilRatio: v })} />
          )}
        </div>

        <div className="settings-section">
          <span className="settings-section-label">Sugar / Malt</span>
          <label className="toggle">
            <input type="checkbox" checked={settings.includeSugar}
              onChange={e => updateSettings({ includeSugar: e.target.checked })} />
            <span>Include sugar</span>
          </label>
          {settings.includeSugar && (
            <SliderRow label="Sugar" value={settings.sugarRatio} min={0.5} max={5.0} step={0.1} suffix="% flour" decimals={1}
              onChange={v => updateSettings({ sugarRatio: v })} />
          )}
        </div>

        {!isSourdough && (
          <div className="settings-section">
            <span className="settings-section-label">Yeast — % of flour, instant dry</span>
            <SliderRow label="48 hours" value={settings.yeast48h} min={0.01} max={0.10} step={0.005} suffix="%" decimals={3}
              onChange={v => updateSettings({ yeast48h: v })} />
            <SliderRow label="Overnight" value={settings.yeastOvernight} min={0.03} max={0.30} step={0.01} suffix="%" decimals={3}
              onChange={v => updateSettings({ yeastOvernight: v })} />
            <SliderRow label="9 hours" value={settings.yeast9h} min={0.10} max={0.80} step={0.05} suffix="%" decimals={2}
              onChange={v => updateSettings({ yeast9h: v })} />
            <SliderRow label="3 hours" value={settings.yeast3h} min={0.50} max={2.50} step={0.10} suffix="%" decimals={2}
              onChange={v => updateSettings({ yeast3h: v })} />
            <p className="hint" style={{ marginTop: 4 }}>For fresh yeast, multiply values by ~3.</p>
          </div>
        )}

        <button className="calc-btn danger" onClick={resetSettings} style={{ marginTop: 8 }}>
          Reset to Defaults
        </button>
      </section>

      <button className="calc-btn" onClick={calculate}>Calculate</button>

      {result && (
        <>
          {/* Pre-ferment result card */}
          {result.preFerment && (
            <section className="card">
              <h2>{pfResultTitle()}</h2>
              <Row label="Flour" value={formatGrams(result.preFerment.flour)} />
              <Row label="Water" value={formatGrams(result.preFerment.water)} />
              <Row label="Yeast" value={formatGrams(result.preFerment.yeast)} />
              <p className="hint">{result.preFerment.fermentTimeHint}</p>
            </section>
          )}

          {/* Starter card (sourdough) */}
          {result.finalMix.starter != null && result.finalMix.starterFlour != null && result.finalMix.starterWater != null && (
            <section className="card">
              <h2>Starter</h2>
              <Row label="Starter" value={formatGrams(result.finalMix.starter)} />
              <p className="hint">
                Contains {formatGrams(result.finalMix.starterFlour)} flour + {formatGrams(result.finalMix.starterWater)} water
              </p>
            </section>
          )}

          {/* Final mix card */}
          <section className="card">
            <h2>Final Mix</h2>
            <Row label="Flour" value={formatGrams(result.finalMix.flour)} />
            <Row label="Water" value={formatGrams(result.finalMix.water)} />
            <Row label="Salt" value={formatGrams(result.finalMix.salt)} />
            {result.finalMix.yeast != null && (
              <Row label="Yeast" value={formatGrams(result.finalMix.yeast)} />
            )}
            {result.finalMix.oil != null && (
              <Row label="Olive Oil" value={formatGrams(result.finalMix.oil)} />
            )}
            {result.finalMix.sugar != null && (
              <Row label="Sugar" value={formatGrams(result.finalMix.sugar)} />
            )}
            {result.finalMix.starter != null && (
              <Row label="Starter" value={formatGrams(result.finalMix.starter)} />
            )}
          </section>

          {/* Total batch card */}
          <section className="card">
            <h2>Total Batch</h2>
            <Row label="Flour" value={formatGrams(result.flour)} />
            <Row label="Water" value={formatGrams(result.water)} />
            <Row label="Salt" value={formatGrams(result.salt)} />
            {!isSourdough && <Row label="Yeast" value={formatGrams(result.yeast)} />}
            {result.finalMix.starter != null && (
              <Row label="Starter" value={formatGrams(result.finalMix.starter)} />
            )}
            {result.oil != null && <Row label="Olive Oil" value={formatGrams(result.oil)} />}
            {result.sugar != null && <Row label="Sugar" value={formatGrams(result.sugar)} />}
            <Row label="Total" value={formatGrams(result.totalWeight)} bold />
          </section>

          {/* Per ball collapsible */}
          <Collapsible
            title={`Per Ball (${Math.round(result.ballWeight)}g × ${result.numBalls})`}
            open={perBallOpen}
            onToggle={() => setPerBallOpen(o => !o)}
          >
            <Row label="Flour" value={formatGrams(result.flour / result.numBalls)} />
            <Row label="Water" value={formatGrams(result.water / result.numBalls)} />
            <Row label="Salt" value={formatGrams(result.salt / result.numBalls)} />
            {!isSourdough && <Row label="Yeast" value={formatGrams(result.yeast / result.numBalls)} />}
            {result.oil != null && <Row label="Olive Oil" value={formatGrams(result.oil / result.numBalls)} />}
            {result.sugar != null && <Row label="Sugar" value={formatGrams(result.sugar / result.numBalls)} />}
          </Collapsible>

          {/* Baker's % collapsible */}
          <Collapsible
            title="Baker's Percentages"
            open={bakersOpen}
            onToggle={() => setBakersOpen(o => !o)}
          >
            <Row label="Hydration" value={`${Math.round(result.hydrationPct)}%`} />
            <Row label="Salt" value={`${result.saltPct.toFixed(2)}%`} />
            {!isSourdough && <Row label="Yeast" value={`${result.yeastPct.toFixed(3)}%`} />}
            {result.preFerment && (
              <Row label={`${pfLabel(preFermentType)} flour`} value={`${preFermentFlourPct}%`} />
            )}
            {isSourdough && (
              <Row label="Starter" value={`${starterPct}%`} />
            )}
            {result.wholeGrainPct > 0 && (
              <Row label="Whole grain" value={`${Math.round(result.wholeGrainPct)}%`} />
            )}
          </Collapsible>

          {/* Flour breakdown (only if whole grain > 0) */}
          {result.wholeGrainPct > 0 && (
            <section className="card">
              <h2>Flour Breakdown</h2>
              <Row label="White flour" value={formatGrams(result.whiteFlour)} />
              <Row label="Whole grain" value={formatGrams(result.wholeGrainFlour)} />
              <Row label="Total flour" value={formatGrams(result.flour)} bold />
            </section>
          )}

          <button className="calc-btn secondary" onClick={share}>
            {copied ? 'Copied to clipboard' : 'Copy / Share Recipe'}
          </button>
        </>
      )}
    </div>
  );
}
