import { describe, it, expect } from '@jest/globals';
import {
  calculateNerdDough,
  yeastPctForConditions,
  yeastActivity,
  waterTempFor,
  buildMethodSteps,
  buildShareText,
  calculateDough,
  NerdDoughInput,
} from './dough';

const nerdInput = (overrides: Partial<NerdDoughInput> = {}): NerdDoughInput => ({
  ballWeight: 250,
  numBalls: 4,
  hydration: 0.65,
  saltPct: 2.5,
  yeastPct: 0.03,
  oilPct: null,
  sugarPct: null,
  yeastLabel: 'test',
  preFermentType: 'none',
  preFermentFlourPct: 20,
  isSourdough: false,
  starterPct: 20,
  wholeGrainPct: 0,
  ...overrides,
});

describe('yeast model', () => {
  it('doubles activity every 8°C above 10°C', () => {
    expect(yeastActivity(20)).toBeCloseTo(1);
    expect(yeastActivity(28)).toBeCloseTo(2);
  });

  it('gives plausible amounts for common schedules', () => {
    const at = (roomHours: number, roomTempC: number, fridgeHours = 0) =>
      yeastPctForConditions({ roomHours, roomTempC, fridgeHours, fridgeTempC: 5 });
    expect(at(3, 25)).toBeGreaterThan(0.6);
    expect(at(3, 25)).toBeLessThan(1.5);
    expect(at(9, 21)).toBeGreaterThan(0.1);
    expect(at(9, 21)).toBeLessThan(0.3);
    expect(at(5, 20, 44)).toBeGreaterThan(0.08);
    expect(at(5, 20, 44)).toBeLessThan(0.3);
  });

  it('needs less yeast when warmer or longer', () => {
    const base = { roomHours: 12, roomTempC: 20, fridgeHours: 0, fridgeTempC: 5 };
    expect(yeastPctForConditions({ ...base, roomTempC: 24 })).toBeLessThan(yeastPctForConditions(base));
    expect(yeastPctForConditions({ ...base, roomHours: 18 })).toBeLessThan(yeastPctForConditions(base));
  });
});

describe('water temperature', () => {
  it('uses the 3-factor formula without a pre-ferment', () => {
    expect(waterTempFor({ targetDoughC: 24, roomC: 21, flourC: 21, mixing: 'hand' })).toBe(26);
  });

  it('uses the 4-factor formula with a pre-ferment', () => {
    expect(waterTempFor({ targetDoughC: 24, roomC: 21, flourC: 21, mixing: 'machine', preFermentC: 21 })).toBe(23);
  });
});

describe('pre-ferment yeast', () => {
  it('never puts negative yeast in the final mix', () => {
    const r = calculateNerdDough(nerdInput({ preFermentType: 'biga', preFermentFlourPct: 40 }));
    expect(r.finalMix.yeast).toBe(0);
    expect(r.preFermentCoversYeast).toBe(true);
    expect(r.yeast).toBeCloseTo(r.preFerment!.yeast);
  });

  it('splits yeast normally when the dough needs more than the pre-ferment', () => {
    const r = calculateNerdDough(nerdInput({ yeastPct: 0.2, preFermentType: 'poolish' }));
    expect(r.preFermentCoversYeast).toBe(false);
    expect(r.finalMix.yeast! + r.preFerment!.yeast).toBeCloseTo(r.yeast);
  });
});

describe('method steps', () => {
  it('does not tell no-knead bakers to knead', () => {
    const steps = buildMethodSteps('Overnight', 'no-knead').join(' ');
    expect(steps).not.toMatch(/Knead the dough/);
  });

  it('mentions the fridge for the 48 hour schedule', () => {
    expect(buildMethodSteps('48 hours', 'kneaded').join(' ')).toMatch(/fridge/);
  });
});

describe('yeast type', () => {
  const r = calculateDough({
    ballWeight: 250, numBalls: 4, hydration: 0.65, saltPct: 2.5, yeastPct: 0.1,
    oilPct: null, sugarPct: null, yeastLabel: 'Overnight',
  });

  it('shares only the chosen yeast type', () => {
    const fresh = buildShareText(r, 'fresh');
    expect(fresh).toMatch(/Yeast: [\d.]+ g fresh/);
    expect(fresh).not.toMatch(/instant dry/);
    expect(buildShareText(r, 'instant')).not.toMatch(/fresh/);
  });
});
