# Pizzacalc

A pizza dough calculator that gets the math right — available as a **Progressive Web App** you can install on any device.

**Live:** [alexanderhaberzettl.github.io/pizzacalc](https://alexanderhaberzettl.github.io/pizzacalc/)

---

## What it does

Pizzacalc solves the baker's-percentage system so your final dough weighs **exactly** what you asked for — no matter which style, how many pizzas, or which extras you toggle on.

Give it a ball weight and a number of pizzas; it gives you flour, water, salt, yeast, and (optionally) oil and sugar to the gram.

## Features

- **Style presets** — Neapolitan, New York, Sicilian, Detroit, and same-day Quick dough
- **Correct baker's percentages** — every ingredient is a fraction of flour weight, back-solved so the total sums to your target
- **Four fermentation profiles** — 48h cold retard, overnight (12–24h), 9h room-temp, or 3h same-day
- **Hydration options** — 60%, 65%, 70%, 75%
- **Optional oil & sugar** — toggleable with adjustable percentages
- **Per-ball + total batch** results, plus the raw baker's percentages
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
| Salt | 2.0% | 1.0–3.5% |
| Olive oil (optional) | 2.0% | 0.5–6.0% |
| Sugar (optional) | 1.5% | 0.5–5.0% |
| Yeast — 48 hours | 0.03% | 0.01–0.10% |
| Yeast — overnight (12–24h) | 0.08% | 0.03–0.30% |
| Yeast — 9 hours | 0.30% | 0.10–0.80% |
| Yeast — 3 hours | 1.20% | 0.50–2.50% |

Yeast values are for **instant dry yeast**. For fresh yeast, multiply by ~3.

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
│       └── Navigation.tsx
└── public/
```

---

## License

MIT
