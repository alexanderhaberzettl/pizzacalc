import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var settings: Settings

    var body: some View {
        Form {
            Section(header: Text("Dough Ball Sizes")) {
                VStack(alignment: .leading) {
                    Text("Normal: \(Int(settings.normalPizzaDoughBallWeight)) g")
                    Slider(value: $settings.normalPizzaDoughBallWeight, in: 150...750, step: 5)
                }
                VStack(alignment: .leading) {
                    Text("Thin Crust: \(Int(settings.thinCrustDoughBallWeight)) g")
                    Slider(value: $settings.thinCrustDoughBallWeight, in: 150...750, step: 5)
                }
            }

            Section(header: Text("Salt")) {
                VStack(alignment: .leading) {
                    Text("\(settings.saltRatio, specifier: "%.1f")% of flour")
                    Slider(value: $settings.saltRatio, in: 1.0...3.5, step: 0.1)
                }
                Text("Typical range: 2.0–2.8% for most styles.")
                    .font(.footnote).foregroundColor(.gray)
            }

            Section(header: Text("Olive Oil")) {
                Toggle("Include olive oil", isOn: $settings.includeOliveOil)
                if settings.includeOliveOil {
                    VStack(alignment: .leading) {
                        Text("\(settings.oliveOilRatio, specifier: "%.1f")% of flour")
                        Slider(value: $settings.oliveOilRatio, in: 0.5...6.0, step: 0.1)
                    }
                }
            }

            Section(header: Text("Sugar / Malt")) {
                Toggle("Include sugar", isOn: $settings.includeSugar)
                if settings.includeSugar {
                    VStack(alignment: .leading) {
                        Text("\(settings.sugarRatio, specifier: "%.1f")% of flour")
                        Slider(value: $settings.sugarRatio, in: 0.5...5.0, step: 0.1)
                    }
                    Text("Common in NY-style doughs to aid browning.")
                        .font(.footnote).foregroundColor(.gray)
                }
            }

            Section(header: Text("Yeast (% of flour, instant dry)")) {
                VStack(alignment: .leading) {
                    Text("Overnight: \(settings.yeastOvernight, specifier: "%.3f")%")
                    Slider(value: $settings.yeastOvernight, in: 0.03...0.3, step: 0.01)
                }
                VStack(alignment: .leading) {
                    Text("9 hours: \(settings.yeast9h, specifier: "%.2f")%")
                    Slider(value: $settings.yeast9h, in: 0.1...0.8, step: 0.05)
                }
                VStack(alignment: .leading) {
                    Text("3 hours: \(settings.yeast3h, specifier: "%.2f")%")
                    Slider(value: $settings.yeast3h, in: 0.5...2.5, step: 0.1)
                }
                Text("For fresh yeast, multiply values by ~3.")
                    .font(.footnote).foregroundColor(.gray)
            }

            Button(action: settings.resetToDefault) {
                Text("Reset to Defaults")
                    .foregroundColor(.red)
            }
        }
        .navigationTitle("Advanced Settings")
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView().environmentObject(Settings())
    }
}
