import React, { useState } from 'react';
import './Modal.css';
import './PizzaCalculator.css';

function PizzaCalculator() {
  const handleInfoClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };
  const [pizzaCount, setPizzaCount] = useState(1);
  const [doughBallSize, setDoughBallSize] = useState(333); // Default to regular size
  const [useOil, setUseOil] = useState(false);
  const [waterRatio, setWaterRatio] = useState(65); // Default 65%
  const [showModal, setShowModal] = useState(false);

  const calculateIngredients = () => {
    const totalDoughWeight = pizzaCount * doughBallSize;
    // Using baker's percentages to calculate ingredients
    // Total dough = flour + water + salt + (oil) + yeast
    // We need to solve for flour first, then calculate the rest
    
    const oilPercentage = useOil ? 0.02 : 0; // 2% if oil is used
    const waterPercentage = waterRatio / 100;
    const saltPercentage = 0.02; // 2%
    const yeastPercentage = 0.0008; // 0.08%
    
    // Formula: totalDough = flour * (1 + waterPercentage + saltPercentage + oilPercentage + yeastPercentage)
    const flour = totalDoughWeight / (1 + waterPercentage + saltPercentage + oilPercentage + yeastPercentage);
    
    return {
      flour: Math.round(flour),
      water: Math.round(flour * waterPercentage),
      salt: (flour * saltPercentage).toFixed(1),
      oil: useOil ? Math.round(flour * oilPercentage) : 0,
      yeast: (flour * yeastPercentage).toFixed(1)
    };
  };

  const ingredients = calculateIngredients();

  return (
    <>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Water to Flour Ratio Guide</h3>
            <p>If you have an electric oven use 65% to 70% water</p>
            <p>If you have a pizza oven use 60% to 65% water</p>
            <button className="modal-close" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
      <div className="pizza-calculator">
        <h1>Pizza Dough Calculator</h1>
        
        <div className="input-section">
          <div className="input-group">
            <label>Number of Pizzas: <span className="value-display">{pizzaCount}</span></label>
            <input
              type="range"
              min="1"
              max="15"
              value={pizzaCount}
              onChange={(e) => setPizzaCount(parseInt(e.target.value))}
            />
          </div>

          <div className="input-group dough-type-group">
            <label>Dough Type:</label>
            <div className="dough-type-buttons">
              <button
                className={`dough-type-button ${doughBallSize === 333 ? 'active' : ''}`}
                onClick={() => setDoughBallSize(333)}
              >
                Regular
                <span className="weight">333g</span>
              </button>
              <button
                className={`dough-type-button ${doughBallSize === 275 ? 'active' : ''}`}
                onClick={() => setDoughBallSize(275)}
              >
                Thin Crust
                <span className="weight">275g</span>
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>
              Water to Flour Ratio:
              <button className="info-icon" onClick={handleInfoClick}>ⓘ</button>
            </label>
            <input
              type="range"
              min="60"
              max="70"
              value={waterRatio}
              onChange={(e) => setWaterRatio(parseInt(e.target.value))}
            />
            <span>{waterRatio}%</span>
          </div>

          <div className="input-group">
            <label>Use Oil:</label>
            <input
              type="checkbox"
              checked={useOil}
              onChange={(e) => setUseOil(e.target.checked)}
            />
          </div>
        </div>

        <div className="recipe-section">
          <h2>Recipe</h2>
          <div className="ingredients-list">
            <div className="ingredient">
              <span>Flour:</span>
              <span>{ingredients.flour}g</span>
            </div>
            <div className="ingredient">
              <span>Water:</span>
              <span>{ingredients.water}g</span>
            </div>
            <div className="ingredient">
              <span>Salt:</span>
              <span>{ingredients.salt}g</span>
            </div>
            {useOil && (
              <div className="ingredient">
                <span>Oil:</span>
                <span>{ingredients.oil}g</span>
              </div>
            )}
            <div className="ingredient">
              <span>Yeast:</span>
              <span>{ingredients.yeast}g</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PizzaCalculator;
