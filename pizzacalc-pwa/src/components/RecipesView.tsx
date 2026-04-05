import React from 'react';

const STEPS: string[] = [
  "Prepare the specified amount of water (30–35°C). Mix 3 tablespoons of it with the yeast in a small container and let it sit.",
  "Roughly mix the rest of the water with the flour. It doesn't need to be a homogeneous dough yet.",
  "After 20 minutes, sprinkle the salt over the dough and add the yeast mixture. Wipe the yeast container with a piece of dough.",
  "Knead the dough by hand or with a kitchen machine (at low speed) for five minutes until a homogeneous dough forms.",
  "Let the dough rest, well covered, for 30–60 minutes. After that time, stretch the dough: take the dough by the edge, pull it up, and before it tears, fold it onto the remaining piece. After 4–5 repetitions, the dough will no longer stretch.",
  "Repeat step 5 another 1–2 times.",
  "Let the dough rise in an airtight container in a cool place (18–20°C) for 12 hours. In a warmer place, it will rise correspondingly faster.",
  "Divide the dough into the number of pizzas you want.",
  "Form small balls and place them seam-side down in an oiled or floured container. It is important that it is airtight (Tupperware with a little oil works well).",
  "After another 2–3 hours of resting at room temperature, start baking. Alternatively, the dough can be refrigerated for up to two days or frozen. Always warm dough at room temperature for 2–3 hours before baking.",
  "Take a ball and shape your pizza with plenty of flour or semolina flour.",
];

export default function RecipesView() {
  return (
    <div className="view">
      <h1>Recipe</h1>
      <section className="card">
        <ol className="recipe-steps">
          {STEPS.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
