export interface DoughResult {
  flour: number;
  water: number;
  salt: number;
  yeast: number;
  oil: number | null;
  sugar: number | null;
  totalWeight: number;
  ballWeight: number;
  numBalls: number;
  hydrationPct: number;
  yeastPct: number;
  saltPct: number;
  yeastLabel: string;
}

export interface DoughInput {
  ballWeight: number;
  numBalls: number;
  hydration: number;      // 0-1
  saltPct: number;        // % of flour
  yeastPct: number;       // % of flour
  oilPct: number | null;  // % of flour (null = disabled)
  sugarPct: number | null;
  yeastLabel: string;
}

/**
 * Solves the baker's-percentage system once so that the resulting dough
 * weighs exactly ballWeight * numBalls. Every ingredient is a percent of
 * flour weight.
 */
export function calculateDough(input: DoughInput): DoughResult {
  const numBalls = Math.max(1, Math.min(50, Math.floor(input.numBalls)));
  const ballWeight = Math.max(50, Math.min(1000, input.ballWeight));
  const total = ballWeight * numBalls;

  const denom =
    1 +
    input.hydration +
    input.saltPct / 100 +
    input.yeastPct / 100 +
    (input.oilPct ?? 0) / 100 +
    (input.sugarPct ?? 0) / 100;

  const flour = total / denom;
  const water = flour * input.hydration;
  const salt = flour * input.saltPct / 100;
  const yeast = flour * input.yeastPct / 100;
  const oil = input.oilPct == null ? null : flour * input.oilPct / 100;
  const sugar = input.sugarPct == null ? null : flour * input.sugarPct / 100;

  const sum = flour + water + salt + yeast + (oil ?? 0) + (sugar ?? 0);

  return {
    flour, water, salt, yeast, oil, sugar,
    totalWeight: sum,
    ballWeight, numBalls,
    hydrationPct: input.hydration * 100,
    yeastPct: input.yeastPct,
    saltPct: input.saltPct,
    yeastLabel: input.yeastLabel,
  };
}

/** Formats grams: 3 decimals under 1g, 1 decimal under 10g, integer above. */
export function formatGrams(value: number): string {
  if (value < 1) return `${value.toFixed(3)} g`;
  if (value < 10) return `${value.toFixed(1)} g`;
  return `${Math.round(value)} g`;
}

export interface PizzaPreset {
  name: string;
  description: string;
  hydration: number;
  saltPct: number;
  includeOil: boolean;
  oilPct: number;
  includeSugar: boolean;
  sugarPct: number;
  yeastLabel: 'Overnight' | '9 hours' | '3 hours';
  ballWeight: number;
}

export const PRESETS: PizzaPreset[] = [
  { name: 'Neapolitan', description: '60% hydration, long cold ferment, no oil/sugar',
    hydration: 0.60, saltPct: 2.8, includeOil: false, oilPct: 0,
    includeSugar: false, sugarPct: 0, yeastLabel: 'Overnight', ballWeight: 250 },
  { name: 'New York', description: '65% hydration, oil + sugar, cold ferment',
    hydration: 0.65, saltPct: 2.0, includeOil: true, oilPct: 2.0,
    includeSugar: true, sugarPct: 1.5, yeastLabel: 'Overnight', ballWeight: 260 },
  { name: 'Sicilian', description: '70% hydration, olive oil, pan pizza',
    hydration: 0.70, saltPct: 2.2, includeOil: true, oilPct: 3.0,
    includeSugar: false, sugarPct: 0, yeastLabel: '9 hours', ballWeight: 500 },
  { name: 'Detroit', description: '70% hydration, olive oil, deep pan',
    hydration: 0.70, saltPct: 2.0, includeOil: true, oilPct: 2.0,
    includeSugar: false, sugarPct: 0, yeastLabel: '9 hours', ballWeight: 340 },
  { name: 'Quick (3h)', description: 'Higher yeast, same-day dough',
    hydration: 0.65, saltPct: 2.0, includeOil: false, oilPct: 0,
    includeSugar: false, sugarPct: 0, yeastLabel: '3 hours', ballWeight: 280 },
];

export function fermentationHint(label: string): string {
  switch (label) {
    case 'Overnight': return '12–24h cold bulk fermentation, then 2–3h at room temp. Best flavor.';
    case '48 hours': return '48h cold bulk fermentation. Extended cold retard for maximum flavor development.';
    case '9 hours': return 'Room temperature bulk ferment, then ball and rest 1–2h.';
    case '3 hours': return 'Same-day dough. Bulk 1.5–2h, then ball and rest ~1h.';
    default: return '';
  }
}

// ─── Pre-ferment / Nerd Mode ──────────────────────────────────────────────────

export type PreFermentType = 'none' | 'poolish' | 'biga' | 'tiga';

/** Hydration as a fraction (water / flour) for each pre-ferment type */
export const PRE_FERMENT_HYDRATIONS: Record<PreFermentType, number> = {
  none: 0,
  poolish: 1.00,   // 100% hydration
  biga: 0.55,      // 55% hydration
  tiga: 0.70,      // 70% hydration
};

/** Yeast as a percent of pre-ferment flour for each type */
export const PRE_FERMENT_YEAST: Record<PreFermentType, number> = {
  none: 0,
  poolish: 0.05,   // 0.05% yeast
  biga: 0.20,      // 0.20% yeast
  tiga: 0.10,      // 0.10% yeast
};

export interface NerdDoughInput extends DoughInput {
  preFermentType: PreFermentType;
  preFermentFlourPct: number;  // % of total flour used in pre-ferment (e.g. 20)
  isSourdough: boolean;
  starterPct: number;           // % of total flour weight as starter (100% hydration)
  wholeGrainPct: number;        // % of total flour that is whole grain
}

export interface PreFermentBreakdown {
  flour: number;
  water: number;
  yeast: number;
  hydrationPct: number;
  fermentTimeHint: string;
}

export interface NerdDoughResult extends DoughResult {
  preFerment: PreFermentBreakdown | null;
  finalMix: {
    flour: number;
    water: number;
    salt: number;
    yeast: number | null;      // null if sourdough
    oil: number | null;
    sugar: number | null;
    starter: number | null;    // null if yeast
    starterFlour: number | null;
    starterWater: number | null;
  };
  wholeGrainFlour: number;
  whiteFlour: number;
  wholeGrainPct: number;
}

export interface SourdoughEstimate {
  label: string;
  bulk: string;
  proof: string;
  note: string;
}

/**
 * Returns fermentation time estimates adjusted for starter percentage.
 * Baseline is 20%. Times scale inversely — more starter = faster ferment.
 * Scale factor = 20 / starterPct, clamped to [0.5, 2.2].
 */
export function getSourdoughEstimates(starterPct: number): SourdoughEstimate[] {
  const scale = Math.min(2.2, Math.max(0.5, 20 / starterPct));

  // Scale a [lo, hi] hour range and format as "X–Yh"
  const scaleHours = (lo: number, hi: number): string => {
    const slo = Math.round(lo * scale * 2) / 2; // round to 0.5h
    const shi = Math.round(hi * scale * 2) / 2;
    const fmt = (h: number) => h < 1 ? `${Math.round(h * 60)}min` : Number.isInteger(h * 2) && !Number.isInteger(h) ? `${h}h` : `${Math.round(h)}h`;
    return `${fmt(slo)}–${fmt(shi)}`;
  };

  // Initial bulk before fridge (for cold retard)
  const coldBulkLo = Math.round(Math.max(0.75, 2 * scale) * 4) / 4;
  const coldBulkHi = Math.round(Math.max(1.5, 3.5 * scale) * 4) / 4;
  const coldBulkStr = `${coldBulkLo < 1 ? Math.round(coldBulkLo * 60) + 'min' : coldBulkLo + 'h'}–${coldBulkHi}h`;

  return [
    {
      label: 'Cool & slow',
      bulk: `${scaleHours(12, 16)} bulk at 18–20°C`,
      proof: `${scaleHours(2, 4)} proof at room temp`,
      note: 'Best flavor. Good if your kitchen is cool overnight.',
    },
    {
      label: 'Room temp',
      bulk: `${scaleHours(4, 8)} bulk at 22–24°C`,
      proof: `${scaleHours(1, 2)} proof at room temp`,
      note: 'Typical warm kitchen. Watch the dough, not the clock.',
    },
    {
      label: 'Warm & fast',
      bulk: `${scaleHours(2, 4)} bulk at 26–28°C`,
      proof: `${scaleHours(0.75, 1.5)} proof`,
      note: 'Easy to over-proof — stay close.',
    },
    {
      label: 'Cold retard',
      bulk: `${coldBulkStr} bulk at room temp, then 12–48h in fridge`,
      proof: '2–3h at room temp after fridge',
      note: 'Most flexible. Shape before fridge or after — both work.',
    },
  ];
}

function preFermentTimeHint(type: PreFermentType): string {
  switch (type) {
    case 'poolish': return 'Ferment at room temp 8–16h, until bubbly and domed.';
    case 'biga': return 'Ferment at room temp 12–24h. Stiff dough, should smell sweet/yeasty.';
    case 'tiga': return 'Ferment at room temp 10–20h. Hybrid between poolish and biga.';
    default: return '';
  }
}

export function calculateNerdDough(input: NerdDoughInput): NerdDoughResult {
  // Base calculation using existing function
  const base = calculateDough(input);

  // Pre-ferment breakdown
  let preFerment: PreFermentBreakdown | null = null;
  let pfFlour = 0;
  let pfWater = 0;
  let pfYeast = 0;

  if (input.preFermentType !== 'none') {
    const hydration = PRE_FERMENT_HYDRATIONS[input.preFermentType];
    const yeastPct = PRE_FERMENT_YEAST[input.preFermentType];
    pfFlour = base.flour * input.preFermentFlourPct / 100;
    pfWater = pfFlour * hydration;
    pfYeast = pfFlour * yeastPct / 100;
    preFerment = {
      flour: pfFlour,
      water: pfWater,
      yeast: pfYeast,
      hydrationPct: hydration * 100,
      fermentTimeHint: preFermentTimeHint(input.preFermentType),
    };
  }

  // Sourdough starter
  let starter: number | null = null;
  let starterFlour: number | null = null;
  let starterWater: number | null = null;
  let starterFlourAmount = 0;
  let starterWaterAmount = 0;

  if (input.isSourdough) {
    starter = base.flour * input.starterPct / 100;
    // 100% hydration starter: half flour, half water
    starterFlour = starter / 2;
    starterWater = starter / 2;
    starterFlourAmount = starterFlour;
    starterWaterAmount = starterWater;
  }

  // Final mix = base minus pre-ferment minus starter contribution
  const finalMix = {
    flour: base.flour - pfFlour - starterFlourAmount,
    water: base.water - pfWater - starterWaterAmount,
    salt: base.salt,
    yeast: input.isSourdough ? null : (base.yeast - pfYeast),
    oil: base.oil,
    sugar: base.sugar,
    starter: input.isSourdough ? starter : null,
    starterFlour: input.isSourdough ? starterFlour : null,
    starterWater: input.isSourdough ? starterWater : null,
  };

  const wholeGrainFlour = base.flour * input.wholeGrainPct / 100;
  const whiteFlour = base.flour - wholeGrainFlour;

  return {
    ...base,
    preFerment,
    finalMix,
    wholeGrainFlour,
    whiteFlour,
    wholeGrainPct: input.wholeGrainPct,
  };
}

export function buildNerdShareText(r: NerdDoughResult): string {
  const lines = [
    `Pizzacalc Nerd Mode — ${r.numBalls} × ${Math.round(r.ballWeight)}g`,
    `Hydration ${Math.round(r.hydrationPct)}% · Salt ${r.saltPct.toFixed(1)}%`,
    '',
  ];

  if (r.preFerment) {
    const pfType = r.preFerment.hydrationPct === 100 ? 'Poolish'
      : r.preFerment.hydrationPct === 55 ? 'Biga'
      : r.preFerment.hydrationPct === 70 ? 'Tiga' : 'Pre-ferment';
    lines.push(`── ${pfType} ──`);
    lines.push(`Flour: ${formatGrams(r.preFerment.flour)}`);
    lines.push(`Water: ${formatGrams(r.preFerment.water)}`);
    lines.push(`Yeast: ${formatGrams(r.preFerment.yeast)}`);
    lines.push(r.preFerment.fermentTimeHint);
    lines.push('');
  }

  if (r.finalMix.starter != null) {
    lines.push(`── Starter ──`);
    lines.push(`Starter: ${formatGrams(r.finalMix.starter)}`);
    lines.push('');
  }

  lines.push('── Final Mix ──');
  lines.push(`Flour: ${formatGrams(r.finalMix.flour)}`);
  lines.push(`Water: ${formatGrams(r.finalMix.water)}`);
  lines.push(`Salt:  ${formatGrams(r.finalMix.salt)}`);
  if (r.finalMix.yeast != null) lines.push(`Yeast: ${formatGrams(r.finalMix.yeast)}`);
  if (r.finalMix.oil != null) lines.push(`Oil:   ${formatGrams(r.finalMix.oil)}`);
  if (r.finalMix.sugar != null) lines.push(`Sugar: ${formatGrams(r.finalMix.sugar)}`);

  lines.push('');
  lines.push('── Total Batch ──');
  lines.push(`Flour: ${formatGrams(r.flour)}`);
  lines.push(`Water: ${formatGrams(r.water)}`);
  lines.push(`Salt:  ${formatGrams(r.salt)}`);
  if (r.finalMix.yeast != null) lines.push(`Yeast: ${formatGrams(r.yeast)}`);
  if (r.oil != null) lines.push(`Oil:   ${formatGrams(r.oil)}`);
  if (r.sugar != null) lines.push(`Sugar: ${formatGrams(r.sugar)}`);
  lines.push(`Total: ${formatGrams(r.totalWeight)}`);

  if (r.wholeGrainPct > 0) {
    lines.push('');
    lines.push(`Whole grain: ${formatGrams(r.wholeGrainFlour)} (${Math.round(r.wholeGrainPct)}%)`);
    lines.push(`White flour: ${formatGrams(r.whiteFlour)}`);
  }

  return lines.join('\n');
}

export function buildShareText(r: DoughResult): string {
  const lines = [
    `Pizzacalc — ${r.numBalls} × ${Math.round(r.ballWeight)}g`,
    `Hydration ${Math.round(r.hydrationPct)}% · Salt ${r.saltPct.toFixed(1)}% · Yeast ${r.yeastPct.toFixed(3)}%`,
    `Fermentation: ${r.yeastLabel} — ${fermentationHint(r.yeastLabel)}`,
    '',
    `Flour: ${formatGrams(r.flour)}`,
    `Water: ${formatGrams(r.water)}`,
    `Salt:  ${formatGrams(r.salt)}`,
    `Yeast: ${formatGrams(r.yeast)}`,
  ];
  if (r.oil != null) lines.push(`Oil:   ${formatGrams(r.oil)}`);
  if (r.sugar != null) lines.push(`Sugar: ${formatGrams(r.sugar)}`);
  lines.push(`Total: ${formatGrams(r.totalWeight)}`);
  return lines.join('\n');
}
