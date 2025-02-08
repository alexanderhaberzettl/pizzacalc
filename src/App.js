import React, { useState } from 'react';
import PizzaCalculator from './components/PizzaCalculator';
import Recipe from './components/Recipe';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="App">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          Calculator
        </button>
        <button 
          className={`tab ${activeTab === 'recipe' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipe')}
        >
          Recipe
        </button>
      </div>
      {activeTab === 'calculator' ? <PizzaCalculator /> : <Recipe />}
    </div>
  );
}

export default App;
