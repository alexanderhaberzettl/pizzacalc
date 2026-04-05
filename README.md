# 🍕 Pizzacalc

A pizza dough calculator that gets the math right. Built as both a native **iOS app** (SwiftUI) and a **Progressive Web App** (React + TypeScript) sharing the same calculation logic.

**Live demo:** [alexanderhaberzettl.github.io/pizzacalc](https://alexanderhaberzettl.github.io/pizzacalc/)

---

## What it does

Pizzacalc solves the baker's-percentage system so your final dough weighs **exactly** what you asked for — no matter which style, how many pizzas, or which extras you toggle on.

Give it a ball weight and a number of pizzas; it gives you flour, water, salt, yeast, and (optionally) oil and sugar to the gram.

## Features

- **Style presets** — Neapolitan, New York, Sicilian, Detroit, and same-day Quick dough
- **Correct baker's percentages** — every ingredient is calculated as a fraction of flour weight, then back-solved so the total sums to your target
- **Three fermentation profiles** — overnight (12–24h), 9h room-temp, or 3h same-day, each with its own yeast ratio
- **Hydration options** — 60%, 65%, 70%, 75%
- **Optional oil & sugar** — toggleable with adjustable percentages
- **Per-ball + total batch** results, plus the raw baker's percentages
- **Smart unit formatting** — milligrams for tiny amounts, one decimal for small amounts, whole grams otherwise
- **Copy/share recipe** — native share sheet on iOS, Web Share API + clipboard fallback in the browser
- **Persistent settings** — `UserDefaults` on iOS, `localStorage` in the PWA
- **Dark mode** — follows system preference

## Screenshots

<!-- Add screenshots here once captured -->

---

## The math

Every ingredient is expressed as a **baker's percentage** — a percent of the flour weight. To hit a target total dough weight, we solve:

```
total = flour × (1 + water% + salt% + yeast% + oil% + sugar%)
```

for `flour`, then derive the rest. The [common bug](https://github.com/alexanderhaberzettl/pizzacalc/blob/main/pizzacalc-pwa/src/lib/dough.ts) is to include oil in the denominator as a percent of flour but then calculate oil as a percent of the **total** — which makes your final dough heavier than intended. Pizzacalc gets this right.

Default ratios (all % of flour):

| Ingredient | Default | Range |
|---|---|---|
| Salt | 2.0% | 1.0–3.5% |
| Olive oil (optional) | 2.0% | 0.5–6.0% |
| Sugar (optional) | 1.5% | 0.5–5.0% |
| Yeast — overnight (12–24h) | 0.08% | 0.03–0.30% |
| Yeast — 9 hours | 0.30% | 0.10–0.80% |
| Yeast — 3 hours | 1.20% | 0.50–2.50% |

Yeast values are for **instant dry yeast**. For fresh yeast, multiply by ~3.

---

## Running locally

### PWA

```bash
cd pizzacalc-pwa
npm install
npm start          # dev server on http://localhost:3000
npm run build      # production build into ./build
```

### iOS

Open `Pizzacalc/Pizzacalc.xcodeproj` in Xcode and build for your device or simulator. Requires Xcode 15+ and iOS 16+.

---

## Project structure

```
Pizzacalc/                    # Native iOS app (SwiftUI)
├── Pizzacalc/
│   ├── CalculatorView.swift      # Main calculator + DoughCalculator
│   ├── Settings.swift            # Persisted settings + PizzaPreset
│   ├── SettingsView.swift        # Advanced settings UI
│   ├── RecipesView.swift         # Step-by-step dough guide
│   └── ContentView.swift         # Tab navigation
└── Pizzacalc.xcodeproj

pizzacalc-pwa/                # Progressive Web App
├── src/
│   ├── lib/dough.ts              # Shared calculation logic + presets
│   ├── context/SettingsContext.tsx   # localStorage-backed settings
│   └── components/
│       ├── CalculatorView.tsx
│       ├── SettingsView.tsx
│       ├── RecipesView.tsx
│       └── Navigation.tsx
└── public/
```

Both apps share the same calculation model and preset definitions, so results are identical regardless of which you use.

---

## Recipe

The PWA and iOS app both ship with an 11-step dough recipe covering bulk fermentation, folding, balling, and shaping — optimized for an 18–20°C cool place over 12 hours.

---

## License

MIT
