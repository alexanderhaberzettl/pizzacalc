import SwiftUI

struct SplashView: View {
    var body: some View {
        VStack {
            Spacer()
            Image("splashscreen") // Replace "your_logo_name" with the actual name of your logo asset
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 400, height: 400) // Adjust size as needed
                .padding()
            Spacer()
        }
        .background(Color(red: 247/255, green: 229/255, blue: 203/255)) // Optionally set background color
        .edgesIgnoringSafeArea(.all) // Extend to edges
    }
}

