import React from 'react';

export type Tab = 'calculator' | 'recipes' | 'settings';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'calculator', label: 'Calculator', icon: '🧮' },
  { id: 'recipes', label: 'Recipe', icon: '📖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Navigation({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={active === tab.id ? 'nav-item active' : 'nav-item'}
          onClick={() => onChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
