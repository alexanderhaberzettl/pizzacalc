import SwiftUI

struct RecipesView: View {
    var body: some View {
        NavigationView { // Wrap your content in a NavigationView
            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    
                    Text("1. Prepare the specified amount of water (30-35°C). Mix 3 tablespoons of it with the yeast in a small container and let it sit.")
                    Text("2. Roughly mix the rest of the water with the flour. It doesn't need to be a homogeneous dough yet.")
                    Text("3. After 20 minutes, sprinkle the salt over the dough and add the yeast mixture. Wipe the yeast container with a piece of dough.")
                    Text("4. Knead the dough by hand or with a kitchen machine (at low speed) for five minutes until a homogeneous dough forms.")
                    Text("5. Let the dough rest, well covered, for 30-60 minutes. After that time, stretch the dough. To do this, take the dough by the edge, pull it up, and before it tears, fold it onto the remaining piece. After 4-5 repetitions, the dough will no longer stretch.")
                    Text("6. Repeat step 5 another 1-2 times.")
                    Text("7. Let the dough rise in an airtight container in a cool place (18-20°C) for 12 hours. In a warmer place, it will rise correspondingly faster.")
                    Text("8. Divide the dough into the number of pizzas you want.")
                    Text("9. Form small balls and place them seam-side down in an oiled or floured container. It is important that it is airtight (I recommend Tupperware with a little oil for storage).")
                    Text("10. After another 2-3 hours of resting at room temperature, you can start baking the pizza. Alternatively, the dough can be stored in the refrigerator for up to two days (I recommend Tupperware with a little oil for storage) or even frozen. But always remember that the dough should warm up at room temperature for 2-3 hours before baking.")
                    Text("11. Take a ball and shape your pizza with plenty of flour or semolina flour.")
                }
                .padding()
            }
            .navigationTitle("Recipe") // Set navigation title here
        }
    }
}

struct RecipesView_Previews: PreviewProvider {
    static var previews: some View {
        RecipesView()
    }
}
