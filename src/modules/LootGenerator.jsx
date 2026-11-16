import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { generateCoins, getItemCounts, pick } from '../utils/loot';

const API = 'https://www.dnd5eapi.co';

// Opciones de CR: 0, 1/8, 1/4, 1/2, 1 ... 30
const CR_OPTIONS = [
  { value: 0, label: '0' },
  { value: 0.125, label: '1/8' },
  { value: 0.25, label: '1/4' },
  { value: 0.5, label: '1/2' },
  ...Array.from({ length: 30 }, (_, i) => ({ value: i + 1, label: String(i + 1) })),
];

const COIN_INFO = [
  { key: 'cp', name: 'Cobre', icon: ':(' },
  { key: 'sp', name: 'Plata', icon: ':/' },
  { key: 'gp', name: 'Oro', icon: ':)' },
  { key: 'pp', name: 'Platino', icon: ':D' },
];

export default function LootGenerator() {
  const [cr, setCr] = useState(1);
  const [equipmentList, setEquipmentList] = useState([]);
  const [magicList, setMagicList] = useState([]);
  const [loot, setLoot] = useState(null);
  const [loadingLists, setLoadingLists] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Cargar las listas una sola vez
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/equipment`).then((r) => r.json()),
      fetch(`${API}/api/magic-items`).then((r) => r.json()),
    ])
      .then(([eq, magic]) => {
        setEquipmentList(eq.results);
        setMagicList(magic.results);
      })
      .catch(() => setError('No se pudieron cargar los objetos de la API'))
      .finally(() => setLoadingLists(false));
  }, []);

  const fetchDetail = async (item) => {
    const r = await fetch(`${API}${item.url}`);
    if (!r.ok) throw new Error('Error al cargar un objeto');
    return r.json();
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const coins = generateCoins(cr);
      const counts = getItemCounts(cr);

      const [equipment, magic] = await Promise.all([
        Promise.all(pick(equipmentList, counts.equipment).map(fetchDetail)),
        Promise.all(pick(magicList, counts.magic).map(fetchDetail)),
      ]);

      setLoot({ cr, coins, equipment, magic });
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loadingLists) return <p className="status">Preparando el tesoro...</p>;

  return (
    <section>
      <h2 className="section-title">Generador de Botín</h2>

      <div className="loot-controls">
        <label htmlFor="cr-select">Nivel de desafío (CR) del monstruo derrotado</label>
        <select
          id="cr-select"
          value={cr}
          onChange={(e) => setCr(Number(e.target.value))}
        >
          {CR_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>CR {o.label}</option>
          ))}
        </select>
        <button className="primary-btn" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generando...' : 'Generar botín'}
        </button>
      </div>

      {error && <p className="status error">⚠️ {error}</p>}

      {loot && (
        <div className="loot-result">
          <h3 className="loot-subtitle">Monedas</h3>
          <div className="coins">
            {COIN_INFO.filter((c) => loot.coins[c.key] > 0).map((c) => (
              <div key={c.key} className="coin">
                <span className="coin-icon">{c.icon}</span>
                <span className="coin-amount">{loot.coins[c.key]}</span>
                <span className="coin-name">{c.name} ({c.key})</span>
              </div>
            ))}
          </div>

          <h3 className="loot-subtitle">Equipo</h3>
          <div className="card-grid">
            {loot.equipment.map((item) => (
              <Card
                key={item.index}
                title={item.name}
                subtitle={item.equipment_category?.name}
                stats={[
                  {
                    label: 'Costo',
                    value: item.cost ? `${item.cost.quantity} ${item.cost.unit}` : '—',
                  },
                  { label: 'Peso', value: item.weight ? `${item.weight} lb` : '—' },
                ]}
              />
            ))}
          </div>

          {loot.magic.length > 0 && (
            <>
              <h3 className="loot-subtitle"> Objetos mágicos</h3>
              <div className="card-grid">
                {loot.magic.map((item) => (
                  <Card
                    key={item.index}
                    title={item.name}
                    subtitle={item.equipment_category?.name}
                    stats={[{ label: 'Rareza', value: item.rarity?.name ?? '—' }]}
                  >
                    <p className="item-desc">{item.desc?.[0]}</p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}