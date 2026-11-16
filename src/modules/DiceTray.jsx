import { useEffect, useRef, useState } from 'react';
import { DICE, rollDie, getRollType } from '../utils/dice';

const ROLL_DURATION = 600; // ms de animación
const MAX_HISTORY = 10;

export default function DiceTray() {
  const [selected, setSelected] = useState(20);
  const [result, setResult] = useState(null); // { sides, value, type }
  const [display, setDisplay] = useState(null); // número mostrado durante la animación
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState([]);
  const timers = useRef([]);

  // Limpiar timers al desmontar el componente
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => {
        clearInterval(t);
        clearTimeout(t);
      });
    };
  }, []);

  const handleRoll = () => {
    if (rolling) return;
    setRolling(true);
    setResult(null);

    // Números aleatorios cambiando rápido (efecto de dado rodando)
    const interval = setInterval(() => setDisplay(rollDie(selected)), 60);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      const value = rollDie(selected);
      const final = { sides: selected, value, type: getRollType(selected, value) };
      setDisplay(null);
      setResult(final);
      setHistory((prev) => [final, ...prev].slice(0, MAX_HISTORY));
      setRolling(false);
    }, ROLL_DURATION);

    timers.current = [interval, timeout];
  };

  const shownValue = rolling ? display : result?.value;
  const resultClass = rolling ? 'rolling' : result ? result.type : '';

  return (
    <section>
      <h2 className="section-title">Bandeja de Dados</h2>

      <div className="dice-selector">
        {DICE.map((d) => (
          <button
            key={d}
            className={d === selected ? 'die-btn active' : 'die-btn'}
            onClick={() => setSelected(d)}
            disabled={rolling}
          >
            d{d}
          </button>
        ))}
      </div>

      <div className={`dice-result ${resultClass}`}>
        {shownValue != null ? (
          <span className="dice-number" key={rolling ? 'rolling' : result?.value + '-' + history.length}>
            {shownValue}
          </span>
        ) : (
          <span className="dice-placeholder">d{selected}</span>
        )}
      </div>

      {result?.type === 'crit' && <p className="roll-message crit-text">⭐ ¡20 natural! ⭐</p>}
      {result?.type === 'fail' && <p className="roll-message fail-text">💀 ¡Pifia! (1 natural)</p>}

      <button className="primary-btn roll-btn" onClick={handleRoll} disabled={rolling}>
        {rolling ? 'Lanzando...' : `🎲 Lanzar d${selected}`}
      </button>

      {history.length > 0 && (
        <div className="history">
          <div className="history-header">
            <h3 className="loot-subtitle">Historial</h3>
            <button className="clear-btn" onClick={() => setHistory([])}>Limpiar</button>
          </div>
          <ul className="history-list">
            {history.map((h, i) => (
              <li key={i} className={`history-item ${h.type}`}>
                <span>d{h.sides}</span>
                <strong>{h.value}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}