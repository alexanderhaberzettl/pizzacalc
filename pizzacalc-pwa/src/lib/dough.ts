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

/** Fresh yeast weighs roughly 3x the equivalent amount of instant dry yeast */
export const FRESH_YEAST_FACTOR = 3;

export type YeastType = 'instant' | 'fresh';

export const YEAST_TYPE_LABEL: Record<YeastType, string> = {
  instant: 'Yeast (instant dry)',
  fresh: 'Yeast (fresh)',
};

/** All calculations work in instant dry yeast; converts to the chosen type. */
export function yeastForType(instantDry: number, type: YeastType): number {
  return type === 'fresh' ? instantDry * FRESH_YEAST_FACTOR : instantDry;
}

/** Formats an instant dry yeast amount as the chosen yeast type */
export function formatYeast(instantDry: number, type: YeastType): string {
  return `${formatGrams(yeastForType(instantDry, type))} ${type === 'fresh' ? 'fresh' : 'instant dry'}`;
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
  yeastLabel: FermentationLabel;
  ballWeight: number;
  method: DoughMethod;
}

export const PRESETS: PizzaPreset[] = [
  { name: 'Neapolitan', description: '60% hydration, overnight at cool room temp, no oil/sugar',
    hydration: 0.60, saltPct: 2.8, includeOil: false, oilPct: 0,
    includeSugar: false, sugarPct: 0, yeastLabel: 'Overnight', ballWeight: 250, method: 'kneaded' },
  { name: 'New York', description: '65% hydration, oil + sugar, 1–2 day cold ferment in the fridge',
    hydration: 0.65, saltPct: 2.0, includeOil: true, oilPct: 2.0,
    includeSugar: true, sugarPct: 1.5, yeastLabel: '48 hours', ballWeight: 260, method: 'kneaded' },
  { name: 'Sicilian', description: '70% hydration, olive oil, pan pizza',
    hydration: 0.70, saltPct: 2.2, includeOil: true, oilPct: 3.0,
    includeSugar: false, sugarPct: 0, yeastLabel: '9 hours', ballWeight: 500, method: 'kneaded' },
  { name: 'Detroit', description: '70% hydration, olive oil, deep pan',
    hydration: 0.70, saltPct: 2.0, includeOil: true, oilPct: 2.0,
    includeSugar: false, sugarPct: 0, yeastLabel: '9 hours', ballWeight: 340, method: 'kneaded' },
  { name: 'Quick (3h)', description: 'Higher yeast, same-day dough',
    hydration: 0.65, saltPct: 2.0, includeOil: false, oilPct: 0,
    includeSugar: false, sugarPct: 0, yeastLabel: '3 hours', ballWeight: 280, method: 'kneaded' },
  { name: 'Babish No-Knead', description: '70% hydration, no kneading, overnight at room temp. Based on Basics with Babish / Jim Lahey method.',
    hydration: 0.70, saltPct: 3.2, includeOil: false, oilPct: 0,
    includeSugar: false, sugarPct: 0, yeastLabel: 'Overnight', ballWeight: 220, method: 'no-knead' },
];

// ─── Fermentation schedules ───────────────────────────────────────────────────

export type FermentationLabel = '48 hours' | 'Overnight' | '9 hours' | '3 hours';
export type DoughMethod = 'kneaded' | 'no-knead';

export interface FermentationSchedule {
  /** Where the bulk fermentation happens */
  bulkTemp: string;
  /** Recommended water temperature (hand kneading, ~21°C kitchen) */
  waterTemp: string;
  /** Bulk fermentation instruction, used in the method steps */
  bulk: string;
  /** Rest after balling, before baking */
  ballRest: string;
  /** Whether the dough spends time in the fridge */
  fridge: boolean;
}

export const FERMENTATION_SCHEDULES: Record<FermentationLabel, FermentationSchedule> = {
  '48 hours': {
    bulkTemp: '1–2h at room temp, then fridge (4–6°C)',
    waterTemp: '12–16°C (cold tap water)',
    bulk: 'Let the dough rest covered for 1–2 hours at room temperature, then put it in the fridge (4–6°C) for 1–2 days.',
    ballRest: '3–4 hours',
    fridge: true,
  },
  'Overnight': {
    bulkTemp: '18–20°C (cool room)',
    waterTemp: '16–20°C (cool)',
    bulk: 'Let the dough rise covered in a cool place (18–20°C) for about 12 hours. In a warmer place it will rise correspondingly faster.',
    ballRest: '2–3 hours',
    fridge: false,
  },
  '9 hours': {
    bulkTemp: '20–22°C (room temp)',
    waterTemp: '22–25°C (lukewarm)',
    bulk: 'Let the dough rise covered at room temperature (20–22°C) for about 6–7 hours.',
    ballRest: '1.5–2 hours',
    fridge: false,
  },
  '3 hours': {
    bulkTemp: '24–26°C (warm)',
    waterTemp: '30–35°C (warm)',
    bulk: 'Let the dough rise covered in a warm place (24–26°C) for about 1.5 hours.',
    ballRest: 'about 1 hour',
    fridge: false,
  },
};

export function fermentationHint(label: string): string {
  switch (label) {
    case 'Overnight': return 'About 12h bulk at a cool 18–20°C, then balls rest 2–3h at room temp. Best flavor without the fridge.';
    case '48 hours': return '1–2h at room temp, then 1–2 days in the fridge (4–6°C). Balls rest 3–4h at room temp before baking.';
    case '9 hours': return 'Bulk ~6–7h at 20–22°C, then ball and rest 1.5–2h.';
    case '3 hours': return 'Same-day dough. Bulk ~1.5h at 24–26°C, then ball and rest ~1h.';
    default: return '';
  }
}

/** Step-by-step method for a fermentation schedule and dough method. */
export function buildMethodSteps(label: FermentationLabel, method: DoughMethod): string[] {
  const sch = FERMENTATION_SCHEDULES[label];
  const finalRest = `Let the balls rest covered at room temperature for ${sch.ballRest}, until relaxed and slightly puffy, then bake.`;
  const storage = sch.fridge
    ? []
    : ['Alternatively, the balls can be refrigerated for up to two days or frozen. Always let cold dough warm up at room temperature for 2–3 hours before baking.'];

  if (method === 'no-knead') {
    return [
      `Prepare the water at ${sch.waterTemp}.`,
      'Whisk flour, salt and yeast in a large bowl. Add the water and stir with a spoon until no dry flour remains. The dough will be shaggy and sticky — do not knead.',
      sch.bulk + ' The long rest develops the gluten instead of kneading; the dough should more than double and be covered in bubbles.',
      'Turn the dough out onto a well-floured surface and divide it into the number of pizzas you want.',
      'Gently fold each piece into a ball (tuck the edges underneath) and place them seam-side down in a floured or oiled, airtight container.',
      finalRest,
      ...storage,
      'Take a ball and shape your pizza with plenty of flour or semolina flour.',
    ];
  }

  const short = label === '3 hours';
  return [
    `Prepare the water at ${sch.waterTemp}. Mix 3 tablespoons of it with the yeast in a small container. (Needed for fresh yeast; instant dry yeast can also go straight into the flour.)`,
    'Roughly mix the rest of the water with the flour (and sugar, if using). It doesn\'t need to be a homogeneous dough yet.',
    'After 20 minutes, add the yeast mixture to the dough. Wipe the yeast container with a piece of dough.',
    'Sprinkle the salt over the dough, making sure it does not touch the yeast directly.',
    'Knead the dough by hand or with a kitchen machine (at low speed) for five minutes until a homogeneous dough forms. If using olive oil, add it during the last minute.',
    short
      ? 'Let the dough rest, well covered, for 15 minutes. Then stretch and fold it once: take the dough by the edge, pull it up, and before it tears, fold it onto the remaining piece. Repeat 4–5 times around the dough.'
      : 'Let the dough rest, well covered, for 30 minutes. After that time, stretch the dough: take the dough by the edge, pull it up, and before it tears, fold it onto the remaining piece. After 4–5 repetitions, the dough will no longer stretch.',
    ...(short ? [] : ['Repeat the previous step another 1–2 times, with 30 minutes rest in between.']),
    sch.bulk,
    sch.fridge
      ? 'Take the dough out of the fridge and divide it into the number of pizzas you want.'
      : 'Divide the dough into the number of pizzas you want.',
    'Form small balls and place them seam-side down in an oiled or floured container. It is important that it is airtight (Tupperware with a little oil works well).',
    finalRest,
    ...storage,
    'Take a ball and shape your pizza with plenty of flour or semolina flour.',
  ];
}

// ─── Temperature model (Nerd Mode) ────────────────────────────────────────────

/**
 * Relative yeast activity compared to 20°C. Activity doubles roughly every
 * 8°C; below 10°C it drops off faster (halving every 4°C), which matches how
 * slowly dough ferments in a fridge.
 */
export function yeastActivity(tempC: number): number {
  if (tempC >= 10) return Math.pow(2, (tempC - 20) / 8);
  return Math.pow(2, (10 - 20) / 8) * Math.pow(2, (tempC - 10) / 4);
}

export interface FermentationConditions {
  roomHours: number;   // total hours at room temp (bulk + ball rest)
  roomTempC: number;
  fridgeHours: number;
  fridgeTempC: number;
}

/** Fermentation time expressed as equivalent hours at 20°C. */
export function equivalentHoursAt20(c: FermentationConditions): number {
  return c.roomHours * yeastActivity(c.roomTempC) + c.fridgeHours * yeastActivity(c.fridgeTempC);
}

/**
 * Instant dry yeast (% of flour) for the given time and temperature.
 * Power-law fit (Y = 23.9 · t^-2.12, t in equivalent hours at 20°C) against
 * common yeast tables: ~0.9% for 3h at 25°C, ~0.19% for 9h at 21°C, ~0.13%
 * for 2 days in the fridge. A starting point — adjust to your own yeast.
 */
export function yeastPctForConditions(c: FermentationConditions): number {
  const t = Math.max(1, equivalentHoursAt20(c));
  const pct = 23.9 * Math.pow(t, -2.12);
  return Math.min(3, Math.max(0.005, pct));
}

export type MixingMethod = 'hand' | 'machine';

/** Approximate temperature rise from kneading (°C). */
export const FRICTION_C: Record<MixingMethod, number> = { hand: 4, machine: 10 };

/**
 * Classic desired-dough-temperature formula:
 *   water = n × target − room − flour − friction (− pre-ferment)
 * where n is the number of temperature factors (3, or 4 with a pre-ferment).
 */
export function waterTempFor(opts: {
  targetDoughC: number;
  roomC: number;
  flourC: number;
  mixing: MixingMethod;
  preFermentC?: number | null;
}): number {
  const hasPf = opts.preFermentC != null;
  const n = hasPf ? 4 : 3;
  return n * opts.targetDoughC - opts.roomC - opts.flourC - FRICTION_C[opts.mixing] - (hasPf ? opts.preFermentC! : 0);
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
  poolish: 0.10,   // 0.10% yeast
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
  /** True when the pre-ferment alone has at least as much yeast as needed */
  preFermentCoversYeast: boolean;
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

  // The pre-ferment can already hold more yeast than the whole dough needs
  // (e.g. a biga for a long, cold ferment). Never go negative: the final mix
  // then gets no extra yeast and the batch total is the pre-ferment's yeast.
  const preFermentCoversYeast = !input.isSourdough && pfYeast >= base.yeast && pfYeast > 0;
  const totalYeast = input.isSourdough ? base.yeast : Math.max(base.yeast, pfYeast);

  // Final mix = base minus pre-ferment minus starter contribution
  const finalMix = {
    flour: base.flour - pfFlour - starterFlourAmount,
    water: base.water - pfWater - starterWaterAmount,
    salt: base.salt,
    yeast: input.isSourdough ? null : totalYeast - pfYeast,
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
    yeast: totalYeast,
    yeastPct: base.flour > 0 ? totalYeast / base.flour * 100 : base.yeastPct,
    totalWeight: base.totalWeight - base.yeast + totalYeast,
    preFermentCoversYeast,
    preFerment,
    finalMix,
    wholeGrainFlour,
    whiteFlour,
    wholeGrainPct: input.wholeGrainPct,
  };
}

export function buildNerdShareText(
  r: NerdDoughResult,
  temperatureLines: string[] = [],
  yeastType: YeastType = 'instant',
): string {
  const lines = [
    `Pizzacalc Nerd Mode — ${r.numBalls} × ${Math.round(r.ballWeight)}g`,
    `Hydration ${Math.round(r.hydrationPct)}% · Salt ${r.saltPct.toFixed(1)}%`,
    ...temperatureLines,
    '',
  ];

  if (r.preFerment) {
    const pfType = r.preFerment.hydrationPct === 100 ? 'Poolish'
      : r.preFerment.hydrationPct === 55 ? 'Biga'
      : r.preFerment.hydrationPct === 70 ? 'Tiga' : 'Pre-ferment';
    lines.push(`── ${pfType} ──`);
    lines.push(`Flour: ${formatGrams(r.preFerment.flour)}`);
    lines.push(`Water: ${formatGrams(r.preFerment.water)}`);
    lines.push(`Yeast: ${formatYeast(r.preFerment.yeast, yeastType)}`);
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
  if (r.finalMix.yeast != null) {
    lines.push(r.preFermentCoversYeast
      ? 'Yeast: none — the pre-ferment already has enough'
      : `Yeast: ${formatYeast(r.finalMix.yeast, yeastType)}`);
  }
  if (r.finalMix.oil != null) lines.push(`Oil:   ${formatGrams(r.finalMix.oil)}`);
  if (r.finalMix.sugar != null) lines.push(`Sugar: ${formatGrams(r.finalMix.sugar)}`);

  lines.push('');
  lines.push('── Total Batch ──');
  lines.push(`Flour: ${formatGrams(r.flour)}`);
  lines.push(`Water: ${formatGrams(r.water)}`);
  lines.push(`Salt:  ${formatGrams(r.salt)}`);
  if (r.finalMix.yeast != null) lines.push(`Yeast: ${formatYeast(r.yeast, yeastType)}`);
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

export function buildShareText(r: DoughResult, yeastType: YeastType = 'instant'): string {
  const lines = [
    `Pizzacalc — ${r.numBalls} × ${Math.round(r.ballWeight)}g`,
    `Hydration ${Math.round(r.hydrationPct)}% · Salt ${r.saltPct.toFixed(1)}% · Yeast ${yeastForType(r.yeastPct, yeastType).toFixed(3)}% ${yeastType === 'fresh' ? 'fresh' : 'instant dry'}`,
    `Fermentation: ${r.yeastLabel} — ${fermentationHint(r.yeastLabel)}`,
    ...(r.yeastLabel in FERMENTATION_SCHEDULES
      ? [`Water temperature: ${FERMENTATION_SCHEDULES[r.yeastLabel as FermentationLabel].waterTemp}`]
      : []),
    '',
    `Flour: ${formatGrams(r.flour)}`,
    `Water: ${formatGrams(r.water)}`,
    `Salt:  ${formatGrams(r.salt)}`,
    `Yeast: ${formatYeast(r.yeast, yeastType)}`,
  ];
  if (r.oil != null) lines.push(`Oil:   ${formatGrams(r.oil)}`);
  if (r.sugar != null) lines.push(`Sugar: ${formatGrams(r.sugar)}`);
  lines.push(`Total: ${formatGrams(r.totalWeight)}`);
  return lines.join('\n');
}
