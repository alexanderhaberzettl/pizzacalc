import React, { useState, useEffect } from 'react';
import './App.css';
import CalculatorView from './components/CalculatorView';
import RecipesView from './components/RecipesView';
import SettingsView from './components/SettingsView';
import SplashScreen from './components/SplashScreen';
import Navigation from './components/Navigation';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [tab, setTab] = useState('calculator');

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <SettingsProvider>
      <div className="app">
        <main className="app-main">
          {tab === 'calculator' && <CalculatorView />}
          {tab === 'recipes' && <RecipesView />}
          {tab === 'settings' && <SettingsView />}
        </main>
        <Navigation active={tab} onChange={setTab} />
      </div>
    </SettingsProvider>
  );
}

export default App;
