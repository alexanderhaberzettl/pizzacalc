import SwiftUI

struct ContentView: View {
    @State private var showSplash = true // State variable to control showing the splash screen
    
    var body: some View {
        Group {
            if showSplash {
                SplashView()
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { // Adjust duration as needed
                            withAnimation {
                                showSplash = false // Hide splash screen after duration
                            }
                        }
                    }
            } else {
                TabView {
                    NavigationView {
                        VStack {
                            Spacer(minLength: 0) // Push content to the top
                            CalculatorView()
                                .navigationTitle("Calculator")
                                .edgesIgnoringSafeArea(.top) // Ensure content starts from the top
                        }
                        .navigationBarHidden(true) // Hide navigation bar for this VStack
                    }
                    .tabItem {
                        Label("Calculator", systemImage: "square.and.pencil")
                    }
                    .edgesIgnoringSafeArea(.top) // Ensure content starts from the top
                
                    NavigationView {
                        VStack {
                            Spacer(minLength: 0) // Push content to the top
                            RecipesView()
                                .navigationTitle("Recipe")
                                .edgesIgnoringSafeArea(.top) // Ensure content starts from the top
                        }
                        .navigationBarHidden(true) // Hide navigation bar for this VStack
                    }
                    .tabItem {
                        Label("Recipe", systemImage: "book")
                    }
                    .edgesIgnoringSafeArea(.top) // Ensure content starts from the top
                }
                .accentColor(.blue) // Set accent color for tab items if needed
                .edgesIgnoringSafeArea(.top) // Ensure content starts from the top
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
