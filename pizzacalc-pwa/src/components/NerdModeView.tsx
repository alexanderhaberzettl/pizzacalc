import React, { useState } from 'react';
import {
  calculateNerdDough,
  formatGrams,
  FRESH_YEAST_FACTOR,
  buildNerdShareText,
  yeastPctForConditions,
  equivalentHoursAt20,
  waterTempFor,
  MixingMethod,
  getSourdoughEstimates,
  PreFermentType,
  NerdDoughResult,
} from '../lib/dough';

// ─── Local helper types ───────────────────────────────────────────────────────

type LeaveningType = 'yeast' | 'sourdough';

const HYDRATIONS = [0.60, 0.65, 0.70, 0.75];
const PRE_FERMENT_OPTIONS: PreFermentType[] = ['none', 'poolish', 'biga', 'tiga'];

// ─── Default local settings ───────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  ballWeight: 280,
  saltRatio: 2.5,
  includeOliveOil: false,
  oliveOilRatio: 2.0,
  includeSugar: false,
  sugarRatio: 1.5,
};

const DEFAULT_TEMPS = {
  roomHours: 14,       // bulk + ball rest at room temp
  roomTempC: 19,
  fridgeHours: 0,
  fridgeTempC: 5,
  yeastFactor: 1.0,    // personal correction for your yeast / kitchen
  targetDoughC: 23,
  kitchenTempC: 21,
  flourTempC: 21,
  mixing: 'hand' as MixingMethod,
};

function formatHours(h: number): string {
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
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
  const [temps, setTemps] = useState({ ...DEFAULT_TEMPS });
  const updateTemps = (partial: Partial<typeof DEFAULT_TEMPS>) =>
    setTemps(prev => ({ ...prev, ...partial }));
  const resetSettings = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    setTemps({ ...DEFAULT_TEMPS });
  };

  // Per-calculation state
  const [amountOfPizzas, setAmountOfPizzas] = useState(2);
  const [hydration, setHydration] = useState(0.65);
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

  const conditions = {
    roomHours: temps.roomHours,
    roomTempC: temps.roomTempC,
    fridgeHours: temps.fridgeHours,
    fridgeTempC: temps.fridgeTempC,
  };
  const modelYeastPct = yeastPctForConditions(conditions) * temps.yeastFactor;
  const equivHours = equivalentHoursAt20(conditions);
  const fermentationSummary =
    `${formatHours(temps.roomHours)} at ${temps.roomTempC}°C` +
    (temps.fridgeHours > 0 ? ` + ${formatHours(temps.fridgeHours)} in fridge at ${temps.fridgeTempC}°C` : '');

  const waterTempC = waterTempFor({
    targetDoughC: temps.targetDoughC,
    roomC: temps.kitchenTempC,
    flourC: temps.flourTempC,
    mixing: temps.mixing,
    preFermentC: preFermentType !== 'none' ? temps.kitchenTempC : null,
  });
  const waterTempHint =
    waterTempC < 2 ? 'Below what water can do — chill the flour, use a colder room, or lower the target.'
    : waterTempC < 8 ? 'Use ice water.'
    : waterTempC > 40 ? 'Too hot for yeast — lower the target dough temperature or warm the room instead.'
    : null;
  const waterTempLabel = `${Math.round(Math.min(40, Math.max(2, waterTempC)))}°C`;

  const calculate = () => {
    setResult(calculateNerdDough({
      ballWeight: settings.ballWeight,
      numBalls: amountOfPizzas,
      hydration,
      saltPct: settings.saltRatio,
      yeastPct: isSourdough ? 0 : modelYeastPct,
      oilPct: settings.includeOliveOil ? settings.oliveOilRatio : null,
      sugarPct: settings.includeSugar ? settings.sugarRatio : null,
      yeastLabel: isSourdough ? 'Sourdough' : fermentationSummary,
      preFermentType,
      preFermentFlourPct,
      isSourdough,
      starterPct,
      wholeGrainPct,
    }));
  };

  const share = async () => {
    if (!result) return;
    const text = buildNerdShareText(result, [
      ...(isSourdough ? [] : [`Fermentation: ${result.yeastLabel}`]),
      `Water temperature: ${waterTempLabel} (target dough ${temps.targetDoughC}°C)`,
    ]);
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
          <label className="card-label">Fermentation &amp; Temperature</label>
          <SliderRow label="Time at room temp" value={temps.roomHours} min={1} max={48} step={0.5} suffix="h" decimals={1}
            onChange={v => updateTemps({ roomHours: v })} />
          <SliderRow label="Room temperature" value={temps.roomTempC} min={16} max={30} step={0.5} suffix="°C" decimals={1}
            onChange={v => updateTemps({ roomTempC: v })} />
          <SliderRow label="Time in fridge" value={temps.fridgeHours} min={0} max={96} step={2} suffix="h"
            onChange={v => updateTemps({ fridgeHours: v })} />
          {temps.fridgeHours > 0 && (
            <SliderRow label="Fridge temperature" value={temps.fridgeTempC} min={2} max={8} step={0.5} suffix="°C" decimals={1}
              onChange={v => updateTemps({ fridgeTempC: v })} />
          )}
          <SliderRow label="Yeast adjustment" value={temps.yeastFactor} min={0.5} max={2} step={0.05} suffix="×" decimals={2}
            onChange={v => updateTemps({ yeastFactor: v })} />
          <div className="row row-bold" style={{ marginTop: 8 }}>
            <span>Yeast (instant dry)</span>
            <span>{modelYeastPct.toFixed(3)}% of flour</span>
          </div>
          <p className="hint">
            Room time includes bulk and ball rest. Equivalent to {equivHours.toFixed(1)}h at 20°C — yeast activity
            roughly doubles every 8°C and nearly stops in the fridge. Model values are a starting point: if your dough
            regularly over- or under-proofs, change the yeast adjustment.
          </p>
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

      {/* Water temperature */}
      <section className="card">
        <label className="card-label">Water Temperature</label>
        <SliderRow label="Target dough temp" value={temps.targetDoughC} min={18} max={28} step={0.5} suffix="°C" decimals={1}
          onChange={v => updateTemps({ targetDoughC: v })} />
        <SliderRow label="Kitchen temp" value={temps.kitchenTempC} min={14} max={32} step={0.5} suffix="°C" decimals={1}
          onChange={v => updateTemps({ kitchenTempC: v })} />
        <SliderRow label="Flour temp" value={temps.flourTempC} min={4} max={32} step={0.5} suffix="°C" decimals={1}
          onChange={v => updateTemps({ flourTempC: v })} />
        <div className="segmented" style={{ marginTop: 8 }}>
          {(['hand', 'machine'] as MixingMethod[]).map(m => (
            <button
              key={m}
              className={temps.mixing === m ? 'seg active' : 'seg'}
              onClick={() => updateTemps({ mixing: m })}
            >{m === 'hand' ? 'By hand' : 'Machine'}</button>
          ))}
        </div>
        <div className="row row-bold" style={{ marginTop: 8 }}>
          <span>Water</span>
          <span>{waterTempLabel}</span>
        </div>
        {waterTempHint && <p className="hint">{waterTempHint}</p>}
        <p className="hint">
          Water = {preFermentType !== 'none' ? 4 : 3} × target − kitchen − flour − kneading heat
          {preFermentType !== 'none' ? ' − pre-ferment (≈ kitchen temp)' : ''}. Typical target: 22–24°C for long
          ferments, 25–27°C for same-day dough.
        </p>
      </section>

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
              <Row label="Yeast (instant dry)" value={formatGrams(result.preFerment.yeast)} />
              <Row label="Yeast (fresh)" value={formatGrams(result.preFerment.yeast * FRESH_YEAST_FACTOR)} />
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
            {result.finalMix.yeast != null && !result.preFermentCoversYeast && (
              <>
                <Row label="Yeast (instant dry)" value={formatGrams(result.finalMix.yeast)} />
                <Row label="Yeast (fresh)" value={formatGrams(result.finalMix.yeast * FRESH_YEAST_FACTOR)} />
              </>
            )}
            {result.preFermentCoversYeast && (
              <p className="hint">The pre-ferment already contains at least as much yeast as this fermentation needs, so the final mix gets none. Consider a smaller pre-ferment or a shorter fermentation.</p>
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

          {/* Temperatures card */}
          <section className="card">
            <h2>Temperatures</h2>
            <Row label="Water" value={waterTempLabel} />
            <Row label="Target dough temp" value={`${temps.targetDoughC}°C`} />
            {!isSourdough && <Row label="Fermentation" value={result.yeastLabel} />}
          </section>

          {/* Total batch card */}
          <section className="card">
            <h2>Total Batch</h2>
            <Row label="Flour" value={formatGrams(result.flour)} />
            <Row label="Water" value={formatGrams(result.water)} />
            <Row label="Salt" value={formatGrams(result.salt)} />
            {!isSourdough && <Row label="Yeast (instant dry)" value={formatGrams(result.yeast)} />}
            {!isSourdough && <Row label="Yeast (fresh)" value={formatGrams(result.yeast * FRESH_YEAST_FACTOR)} />}
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
            {!isSourdough && <Row label="Yeast (instant dry)" value={formatGrams(result.yeast / result.numBalls)} />}
            {!isSourdough && <Row label="Yeast (fresh)" value={formatGrams((result.yeast / result.numBalls) * FRESH_YEAST_FACTOR)} />}
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
            {!isSourdough && <Row label="Yeast (instant dry)" value={`${result.yeastPct.toFixed(3)}%`} />}
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
