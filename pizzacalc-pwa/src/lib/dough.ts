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
