import React from 'react';
import './Recipe.css';

function Recipe() {
  return (
    <div className="recipe-instructions">
      <h2>Pizza Dough Recipe Instructions</h2>
      <ol>
        <li>Prepare the amount of water (30-35°C) as specified above. Mix 3 tablespoons of it with the yeast in a small container and let it rest.</li>
        <li>Roughly mix the remaining water with the flour. It doesn't need to be a homogeneous dough yet.</li>
        <li>After 20 minutes, sprinkle the salt over the dough and add the yeast mixture. Wipe the yeast container with a piece of dough.</li>
        <li>Knead the dough by hand or with a stand mixer (low speed) for five minutes until a homogeneous dough forms.</li>
        <li>Cover the dough well and let it rest for 30-60 minutes. After this time, stretch the dough. To do this, take the dough at the edge, pull it up, and before it tears, fold it onto the remaining piece. After 4-5 repetitions, the dough will no longer stretch.</li>
        <li>Repeat step 5 another 1-2 times.</li>
        <li>Let the dough rise for 12 hours in an airtight container in a cool place (18-20°C). In a warmer place, it will rise correspondingly faster.</li>
        <li>Divide the dough into your chosen number of pizzas.</li>
        <li>Form small balls and place them with the seam side down in an oiled or floured container. It's important that it's airtight (recommended to use Tupperware with some oil for storage).</li>
        <li>After another 2-3 hours of rising at room temperature, you can start baking the pizza. Alternatively, the dough can be stored in the refrigerator for up to two days (recommended to use Tupperware with some oil for storage) or even frozen. But always remember that the dough should warm up at room temperature for 2-3 hours before baking.</li>
        <li>Take a ball and shape your pizza using plenty of flour or semolina flour.</li>
      </ol>
    </div>
  );
}

export default Recipe;
