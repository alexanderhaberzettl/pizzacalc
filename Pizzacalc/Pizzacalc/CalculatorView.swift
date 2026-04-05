import SwiftUI

/// A single, authoritative pizza-dough calculation. All ingredient percentages
/// are expressed as baker's percentages (percent of flour weight).
struct DoughResult {
    let flour: Double
    let water: Double
    let salt: Double
    let yeast: Double
    let oil: Double?      // nil when disabled
    let sugar: Double?    // nil when disabled
    let totalWeight: Double
    let ballWeight: Double
    let numBalls: Int
    let hydrationPct: Double   // 0-100
    let yeastPct: Double       // 0-100
    let saltPct: Double        // 0-100
}

enum DoughCalculator {
    /// Derives ingredient weights so the final dough sums to
    /// ballWeight * numBalls. Solves the baker's-% system once.
    static func calculate(
        ballWeight: Double,
        numBalls: Int,
        hydration: Double,        // 0-1 (e.g. 0.65)
        saltPct: Double,          // percent of flour, e.g. 2.0
        yeastPct: Double,         // percent of flour
        oilPct: Double?,          // percent of flour, nil if disabled
        sugarPct: Double?         // percent of flour, nil if disabled
    ) -> DoughResult {
        let total = ballWeight * Double(max(numBalls, 1))
        // total = flour * (1 + water% + salt% + yeast% + oil% + sugar%)
        let denom = 1.0
            + hydration
            + saltPct / 100.0
            + yeastPct / 100.0
            + (oilPct ?? 0) / 100.0
            + (sugarPct ?? 0) / 100.0
        let flour = total / denom
        let water = flour * hydration
        let salt = flour * saltPct / 100.0
        let yeast = flour * yeastPct / 100.0
        let oil = oilPct.map { flour * $0 / 100.0 }
        let sugar = sugarPct.map { flour * $0 / 100.0 }

        let sum = flour + water + salt + yeast + (oil ?? 0) + (sugar ?? 0)

        return DoughResult(
            flour: flour, water: water, salt: salt, yeast: yeast,
            oil: oil, sugar: sugar, totalWeight: sum,
            ballWeight: ballWeight, numBalls: numBalls,
            hydrationPct: hydration * 100,
            yeastPct: yeastPct,
            saltPct: saltPct
        )
    }
}

/// Formats grams with sensible precision: milligrams under 1g, one decimal
/// under 10g, whole grams otherwise.
func formatGrams(_ value: Double) -> String {
    if value < 1 { return String(format: "%.0f mg", value * 1000) }
    if value < 10 { return String(format: "%.1f g", value) }
    return "\(Int(value.rounded())) g"
}

struct CalculatorView: View {
    @State private var pizzaType = "Normal"
    @State private var amountOfPizzas = 1
    @State private var waterRatio = 0.65
    @State private var selectedYeastSetting = "Overnight"
    @State private var result: DoughResult?
    @State private var showingShareSheet = false
    @State private var shareText = ""
    @State private var showingPresets = false

    @EnvironmentObject var settings: Settings

    private let pizzaTypes = ["Normal", "Thin Crust"]
    private let waterRatios = [0.60, 0.65, 0.70, 0.75]
    private let yeastSettings = ["Overnight", "9 hours", "3 hours"]

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Presets")) {
                    Button {
                        showingPresets = true
                    } label: {
                        HStack {
                            Image(systemName: "wand.and.stars")
                            Text("Apply a style preset")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                                .font(.footnote)
                        }
                    }
                }

                Section(header: Text("Pizza Type")) {
                    Picker("Pizza Type", selection: $pizzaType) {
                        ForEach(pizzaTypes, id: \.self) { Text($0) }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }

                Section(header: Text("Fermentation")) {
                    Picker("Yeast Setting", selection: $selectedYeastSetting) {
                        ForEach(yeastSettings, id: \.self) { Text($0) }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    Text(fermentationHint(for: selectedYeastSetting))
                        .font(.footnote)
                        .foregroundColor(.gray)
                }

                Section(header: Text("Amount of Pizzas")) {
                    Stepper(value: $amountOfPizzas, in: 1...50) {
                        Text("\(amountOfPizzas)")
                    }
                }

                Section(header: Text("Water Ratio")) {
                    Picker("Water Ratio", selection: $waterRatio) {
                        ForEach(waterRatios, id: \.self) {
                            Text(String(format: "%.0f%%", $0 * 100))
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    Text("Lower hydration is easier to handle. Higher hydration gives a more open, Neapolitan-style crumb.")
                        .font(.footnote)
                        .foregroundColor(.gray)
                }

                Button(action: calculate) {
                    Text("Calculate")
                        .frame(maxWidth: .infinity)
                        .font(.headline)
                }

                if let r = result {
                    Section(header: Text("Per Ball (\(Int(r.ballWeight.rounded()))g × \(r.numBalls))")) {
                        resultRow("Flour", formatGrams(r.flour / Double(r.numBalls)))
                        resultRow("Water", formatGrams(r.water / Double(r.numBalls)))
                        resultRow("Salt", formatGrams(r.salt / Double(r.numBalls)))
                        resultRow("Yeast", formatGrams(r.yeast / Double(r.numBalls)))
                        if let oil = r.oil { resultRow("Olive Oil", formatGrams(oil / Double(r.numBalls))) }
                        if let sugar = r.sugar { resultRow("Sugar", formatGrams(sugar / Double(r.numBalls))) }
                    }

                    Section(header: Text("Total Batch")) {
                        resultRow("Flour", formatGrams(r.flour))
                        resultRow("Water", formatGrams(r.water))
                        resultRow("Salt", formatGrams(r.salt))
                        resultRow("Yeast", formatGrams(r.yeast))
                        if let oil = r.oil { resultRow("Olive Oil", formatGrams(oil)) }
                        if let sugar = r.sugar { resultRow("Sugar", formatGrams(sugar)) }
                        HStack {
                            Text("Total").fontWeight(.bold)
                            Spacer()
                            Text(formatGrams(r.totalWeight)).fontWeight(.bold)
                        }
                    }

                    Section(header: Text("Baker's Percentages")) {
                        resultRow("Hydration", String(format: "%.0f%%", r.hydrationPct))
                        resultRow("Salt", String(format: "%.2f%%", r.saltPct))
                        resultRow("Yeast", String(format: "%.3f%%", r.yeastPct))
                    }

                    Button {
                        shareText = buildShareText(r)
                        showingShareSheet = true
                    } label: {
                        HStack {
                            Image(systemName: "square.and.arrow.up")
                            Text("Copy / Share Recipe")
                        }
                    }
                }
            }
            .navigationTitle("Calculator")
            .navigationBarItems(trailing: NavigationLink(destination: SettingsView()) {
                Image(systemName: "gear")
            })
            .sheet(isPresented: $showingShareSheet) {
                ShareSheet(items: [shareText])
            }
            .sheet(isPresented: $showingPresets) {
                PresetPickerView { preset in
                    apply(preset: preset)
                    showingPresets = false
                }
            }
        }
    }

    @ViewBuilder
    private func resultRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
            Spacer()
            Text(value).foregroundColor(.secondary)
        }
    }

    private func calculate() {
        let ballWeight = pizzaType == "Normal"
            ? settings.normalPizzaDoughBallWeight
            : settings.thinCrustDoughBallWeight

        // Clamp to sane ranges defensively.
        let clampedBall = max(50, min(1000, ballWeight))
        let clampedCount = max(1, min(50, amountOfPizzas))

        result = DoughCalculator.calculate(
            ballWeight: clampedBall,
            numBalls: clampedCount,
            hydration: waterRatio,
            saltPct: settings.saltRatio,
            yeastPct: settings.yeastPercent(for: selectedYeastSetting),
            oilPct: settings.includeOliveOil ? settings.oliveOilRatio : nil,
            sugarPct: settings.includeSugar ? settings.sugarRatio : nil
        )
    }

    private func apply(preset: PizzaPreset) {
        pizzaType = "Normal"
        settings.normalPizzaDoughBallWeight = preset.ballWeight
        settings.saltRatio = preset.saltPct
        settings.includeOliveOil = preset.includeOil
        settings.oliveOilRatio = preset.oilPct
        settings.includeSugar = preset.includeSugar
        settings.sugarRatio = preset.sugarPct
        waterRatio = preset.hydration
        selectedYeastSetting = preset.yeastLabel
        calculate()
    }

    private func fermentationHint(for label: String) -> String {
        switch label {
        case "Overnight": return "12–24h cold bulk fermentation, then 2–3h at room temp. Best flavor."
        case "9 hours": return "Room temperature bulk ferment, then ball and rest 1–2h."
        case "3 hours": return "Same-day dough. Bulk 1.5–2h, then ball and rest ~1h."
        default: return ""
        }
    }

    private func buildShareText(_ r: DoughResult) -> String {
        var lines: [String] = []
        lines.append("🍕 Pizzacalc — \(r.numBalls) × \(Int(r.ballWeight.rounded()))g")
        lines.append("Hydration \(Int(r.hydrationPct))% · Salt \(String(format: "%.1f", r.saltPct))% · Yeast \(String(format: "%.3f", r.yeastPct))%")
        lines.append("")
        lines.append("Flour: \(formatGrams(r.flour))")
        lines.append("Water: \(formatGrams(r.water))")
        lines.append("Salt:  \(formatGrams(r.salt))")
        lines.append("Yeast: \(formatGrams(r.yeast))")
        if let oil = r.oil { lines.append("Oil:   \(formatGrams(oil))") }
        if let sugar = r.sugar { lines.append("Sugar: \(formatGrams(sugar))") }
        lines.append("Total: \(formatGrams(r.totalWeight))")
        return lines.joined(separator: "\n")
    }
}

struct PresetPickerView: View {
    let onSelect: (PizzaPreset) -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            List(PizzaPreset.all) { preset in
                Button {
                    onSelect(preset)
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(preset.name).font(.headline)
                        Text(preset.description)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Style Presets")
            .navigationBarItems(trailing: Button("Cancel") { dismiss() })
        }
    }
}

/// UIKit share sheet bridge.
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    func updateUIViewController(_ vc: UIActivityViewController, context: Context) {}
}

struct CalculatorView_Previews: PreviewProvider {
    static var previews: some View {
        CalculatorView().environmentObject(Settings())
    }
}
