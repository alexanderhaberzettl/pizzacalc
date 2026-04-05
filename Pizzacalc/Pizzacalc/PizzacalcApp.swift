import SwiftUI

@main
struct PizzaCalApp: App { // Ensure this matches your project name
    @StateObject private var settings = Settings()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(settings)
        }
    }
}
