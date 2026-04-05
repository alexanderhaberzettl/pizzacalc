import SwiftUI
import Combine

/// User-adjustable settings. Values are persisted to UserDefaults so the
/// app remembers preferences across launches.
class Settings: ObservableObject {
    // Defaults (also used by "Reset to default")
    static let defaultNormalBallWeight: Double = 335.0
    static let defaultThinCrustBallWeight: Double = 280.0
    static let defaultSaltRatio: Double = 2.0
    static let defaultOliveOilRatio: Double = 2.0
    static let defaultSugarRatio: Double = 1.5
    // Yeast ratios as PERCENT of flour weight (baker's %)
    // 3h bumped from 0.7% -> 1.2% so the dough actually proofs in 3 hours.
    static let defaultYeastOvernight: Double = 0.08
    static let defaultYeast9h: Double = 0.30
    static let defaultYeast3h: Double = 1.20

    @Published var normalPizzaDoughBallWeight: Double { didSet { save() } }
    @Published var thinCrustDoughBallWeight: Double { didSet { save() } }
    @Published var saltRatio: Double { didSet { save() } }
    @Published var includeOliveOil: Bool { didSet { save() } }
    @Published var oliveOilRatio: Double { didSet { save() } }
    @Published var includeSugar: Bool { didSet { save() } }
    @Published var sugarRatio: Double { didSet { save() } }
    @Published var yeastOvernight: Double { didSet { save() } }
    @Published var yeast9h: Double { didSet { save() } }
    @Published var yeast3h: Double { didSet { save() } }

    private let defaults = UserDefaults.standard
    private var isLoaded = false

    init() {
        let d = UserDefaults.standard
        normalPizzaDoughBallWeight = d.object(forKey: "normalBallWeight") as? Double ?? Settings.defaultNormalBallWeight
        thinCrustDoughBallWeight = d.object(forKey: "thinCrustBallWeight") as? Double ?? Settings.defaultThinCrustBallWeight
        saltRatio = d.object(forKey: "saltRatio") as? Double ?? Settings.defaultSaltRatio
        includeOliveOil = d.object(forKey: "includeOliveOil") as? Bool ?? false
        oliveOilRatio = d.object(forKey: "oliveOilRatio") as? Double ?? Settings.defaultOliveOilRatio
        includeSugar = d.object(forKey: "includeSugar") as? Bool ?? false
        sugarRatio = d.object(forKey: "sugarRatio") as? Double ?? Settings.defaultSugarRatio
        yeastOvernight = d.object(forKey: "yeastOvernight") as? Double ?? Settings.defaultYeastOvernight
        yeast9h = d.object(forKey: "yeast9h") as? Double ?? Settings.defaultYeast9h
        yeast3h = d.object(forKey: "yeast3h") as? Double ?? Settings.defaultYeast3h
        isLoaded = true
    }

    private func save() {
        guard isLoaded else { return }
        defaults.set(normalPizzaDoughBallWeight, forKey: "normalBallWeight")
        defaults.set(thinCrustDoughBallWeight, forKey: "thinCrustBallWeight")
        defaults.set(saltRatio, forKey: "saltRatio")
        defaults.set(includeOliveOil, forKey: "includeOliveOil")
        defaults.set(oliveOilRatio, forKey: "oliveOilRatio")
        defaults.set(includeSugar, forKey: "includeSugar")
        defaults.set(sugarRatio, forKey: "sugarRatio")
        defaults.set(yeastOvernight, forKey: "yeastOvernight")
        defaults.set(yeast9h, forKey: "yeast9h")
        defaults.set(yeast3h, forKey: "yeast3h")
    }

    func resetToDefault() {
        normalPizzaDoughBallWeight = Settings.defaultNormalBallWeight
        thinCrustDoughBallWeight = Settings.defaultThinCrustBallWeight
        saltRatio = Settings.defaultSaltRatio
        includeOliveOil = false
        oliveOilRatio = Settings.defaultOliveOilRatio
        includeSugar = false
        sugarRatio = Settings.defaultSugarRatio
        yeastOvernight = Settings.defaultYeastOvernight
        yeast9h = Settings.defaultYeast9h
        yeast3h = Settings.defaultYeast3h
    }

    /// Returns the configured yeast percent (of flour) for a given fermentation label.
    func yeastPercent(for setting: String) -> Double {
        switch setting {
        case "Overnight": return yeastOvernight
        case "9 hours": return yeast9h
        case "3 hours": return yeast3h
        default: return yeastOvernight
        }
    }
}

/// Named presets the user can apply with one tap.
struct PizzaPreset: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let hydration: Double      // e.g. 0.60
    let saltPct: Double        // % of flour, e.g. 2.8
    let includeOil: Bool
    let oilPct: Double         // % of flour
    let includeSugar: Bool
    let sugarPct: Double
    let yeastLabel: String     // "Overnight", "9 hours", "3 hours"
    let ballWeight: Double

    static let all: [PizzaPreset] = [
        PizzaPreset(
            name: "Neapolitan",
            description: "60% hydration, long cold ferment, no oil/sugar",
            hydration: 0.60, saltPct: 2.8,
            includeOil: false, oilPct: 0,
            includeSugar: false, sugarPct: 0,
            yeastLabel: "Overnight", ballWeight: 250
        ),
        PizzaPreset(
            name: "New York",
            description: "65% hydration, oil + sugar, cold ferment",
            hydration: 0.65, saltPct: 2.0,
            includeOil: true, oilPct: 2.0,
            includeSugar: true, sugarPct: 1.5,
            yeastLabel: "Overnight", ballWeight: 260
        ),
        PizzaPreset(
            name: "Sicilian",
            description: "70% hydration, olive oil, pan pizza",
            hydration: 0.70, saltPct: 2.2,
            includeOil: true, oilPct: 3.0,
            includeSugar: false, sugarPct: 0,
            yeastLabel: "9 hours", ballWeight: 500
        ),
        PizzaPreset(
            name: "Detroit",
            description: "70% hydration, olive oil, deep pan",
            hydration: 0.70, saltPct: 2.0,
            includeOil: true, oilPct: 2.0,
            includeSugar: false, sugarPct: 0,
            yeastLabel: "9 hours", ballWeight: 340
        ),
        PizzaPreset(
            name: "Quick (3h)",
            description: "Higher yeast, same-day dough",
            hydration: 0.65, saltPct: 2.0,
            includeOil: false, oilPct: 0,
            includeSugar: false, sugarPct: 0,
            yeastLabel: "3 hours", ballWeight: 280
        )
    ]
}
