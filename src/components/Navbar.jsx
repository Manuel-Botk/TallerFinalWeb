const TABS = [
  { id: 'bestiary', label: '🐉 Bestiario' },
  { id: 'loot', label: '💰 Botín' },
  { id: 'dice', label: '🎲 Dados' },
];

export default function Navbar({ active, onChange }) {
  return (
    <nav className="navbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={tab.id === active ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}