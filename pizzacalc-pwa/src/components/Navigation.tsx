import React from 'react';

export type Tab = 'calculator' | 'recipes';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const ICON_PROPS = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function CalcIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="12" x2="8.01" y2="12" />
      <line x1="12" y1="12" x2="12.01" y2="12" />
      <line x1="16" y1="12" x2="16.01" y2="12" />
      <line x1="8" y1="16" x2="8.01" y2="16" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
      <line x1="16" y1="16" x2="16.01" y2="16" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}


const TABS: { id: Tab; label: string; Icon: React.FC }[] = [
  { id: 'calculator', label: 'Calculator', Icon: CalcIcon },
  { id: 'recipes', label: 'Recipe', Icon: BookIcon },
];

export default function Navigation({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      <div className="nav-brand">
        <img src="/pizzacalc/splashscreen.png" alt="" className="nav-brand-icon" />
        <span className="nav-brand-name">Pizzacalc</span>
      </div>
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={active === id ? 'nav-item active' : 'nav-item'}
          onClick={() => onChange(id)}
        >
          <span className="nav-icon"><Icon /></span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
