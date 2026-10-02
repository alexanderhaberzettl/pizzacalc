# Pizzacalc

A pizza dough calculator that gets the math right — available as a **Progressive Web App** you can install on any device.

**Live:** [alexanderhaberzettl.github.io/pizzacalc](https://alexanderhaberzettl.github.io/pizzacalc/)

---

## What it does

Pizzacalc solves the baker's-percentage system so your final dough weighs **exactly** what you asked for — no matter which style, how many pizzas, or which extras you toggle on.

Give it a ball weight and a number of pizzas; it gives you flour, water, salt, yeast, and (optionally) oil and sugar to the gram.

## Features

- **Style presets** — Neapolitan, New York, Sicilian, Detroit, same-day Quick dough, and a no-knead dough
- **Correct baker's percentages** — every ingredient is a fraction of flour weight, back-solved so the total sums to your target
- **Four fermentation profiles** — 48h in the fridge, overnight at a cool room temp (~12h at 18–20°C), 9h room-temp, or 3h same-day
- **Temperature guidance** — water, bulk and ball-rest temperatures for every profile
- **Step-by-step method** — follows the chosen fermentation profile, kneaded or no-knead
- **Hydration options** — 60%, 65%, 70%, 75%
- **Optional oil & sugar** — toggleable with adjustable percentages
- **Per-ball + total batch** results, plus the raw baker's percentages
- **Instant dry or fresh yeast** — pick your yeast type; results are shown for that yeast
- **Nerd Mode** — pre-ferments (poolish, biga, tiga), sourdough, whole grain, yeast calculated from time and temperature (room + fridge), and a water temperature calculator
- **Copy/share recipe** — Web Share API with clipboard fallback, includes fermentation notes
- **Persistent settings** — saved in `localStorage`
- **Dark mode** — follows system preference
- **Installable PWA** — works offline, installs to home screen on iOS and Android

---

## The math

Every ingredient is expressed as a **baker's percentage** — a percent of the flour weight. To hit a target total dough weight, we solve:

```
total = flour × (1 + water% + salt% + yeast% + oil% + sugar%)
```

for `flour`, then derive the rest. The common bug is to calculate oil as a percent of the **total** rather than of flour — making the dough heavier than intended. Pizzacalc gets this right.

Default ratios (all % of flour):

| Ingredient | Default | Range |
|---|---|---|
| Salt | 2.5% | 1.0–3.5% |
| Olive oil (optional) | 2.0% | 0.5–6.0% |
| Sugar (optional) | 1.5% | 0.5–5.0% |
| Yeast — 48 hours (fridge) | 0.15% | 0.05–0.50% |
| Yeast — overnight (~12h at 18–20°C) | 0.08% | 0.03–0.30% |
| Yeast — 9 hours | 0.20% | 0.10–0.80% |
| Yeast — 3 hours | 1.20% | 0.50–2.50% |

Yeast values are for **instant dry yeast**. For fresh yeast, multiply by ~3 (the app converts automatically when you pick fresh yeast).

### Nerd Mode: yeast from time and temperature

Yeast activity roughly doubles every 8°C and drops off sharply below 10°C. Fermentation time is converted to equivalent hours at 20°C, and the yeast amount follows a power-law fit to common yeast tables:

```
yeast% ≈ 23.9 × t^-2.12     (t = equivalent hours at 20°C)
```

These are starting points — a yeast adjustment slider lets you correct for your own yeast and kitchen.

### Water temperature

The classic desired-dough-temperature formula:

```
water = 3 × target − kitchen − flour − kneading heat   (4 × target − … − pre-ferment, with a pre-ferment)
```

---

## Running locally

```bash
cd pizzacalc-pwa
npm install
npm start          # dev server on http://localhost:3000
npm run build      # production build into ./build
```

---

## Project structure

```
pizzacalc-pwa/
├── src/
│   ├── lib/dough.ts                  # Calculation logic + presets
│   ├── context/SettingsContext.tsx   # localStorage-backed settings
│   └── components/
│       ├── CalculatorView.tsx
│       ├── RecipesView.tsx
│       ├── NerdModeView.tsx
│       └── Navigation.tsx
└── public/
```

---

## Changelog

### 1.3.1

- Choose the yeast type (instant dry or fresh); results, baker's percentages and the share text show only the chosen yeast. Previously both were listed one below the other, which looked like both go into the dough.

### 1.3.0

**New**
- Temperature guidance: water, bulk fermentation and ball-rest temperatures in the results and in the recipe tab
- Step-by-step method in the results, matching the chosen fermentation profile
- Recipe tab: choose fermentation profile and method (kneaded / no-knead)
- Nerd Mode: yeast is calculated from time and temperature (room temp + optional fridge phase) with a personal yeast adjustment
- Nerd Mode: water temperature calculator (target dough temp, kitchen and flour temp, by hand or machine, pre-ferment aware)
- Yeast results always say which yeast is meant and show the fresh yeast equivalent; also in the share text

**Fixes**
- Nerd Mode: final mix could show negative yeast when the pre-ferment already had enough yeast
- Method steps now match the fermentation profile (the 3h dough no longer says "12 hours", the no-knead preset no longer says "knead")
- Fermentation hints are consistent: overnight = cool room temperature, 48 hours = fridge
- Water temperature is no longer always 30–35°C — cool water for long fermentations

**Recipe adjustments**
- 48h yeast 0.03% → 0.15% (fridge fermentation needs more yeast)
- 9h yeast 0.30% → 0.20% (tended to over-proof at 22–24°C)
- Default salt 2.0% → 2.5%, poolish yeast 0.05% → 0.10%
- New York preset now uses the 48h fridge ferment
- Settings you never changed are moved to the new defaults automatically; your own values are kept

**Infrastructure**
- Fixed GitHub Pages deployment (dependency install failed in CI)

---

## License

MIT
