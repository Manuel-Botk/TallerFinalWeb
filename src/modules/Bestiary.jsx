import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/Card';

const API = 'https://www.dnd5eapi.co';
const PAGE_SIZE = 12;

const CR_FRACTIONS = { 0.125: '1/8', 0.25: '1/4', 0.5: '1/2' };
const formatCR = (cr) => CR_FRACTIONS[cr] ?? cr;

// armor_class puede ser un número o un arreglo [{ type, value }]
const getAC = (m) =>
  Array.isArray(m.armor_class) ? m.armor_class[0]?.value : m.armor_class;

const translateSize = { Tiny: 'Diminuto', Small: 'Pequeño', Medium: 'Mediano', Large: 'Grande', Huge: 'Enorme', Gargantuan: 'Colosal' };

export default function Bestiary() {
  const [monsters, setMonsters] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const cache = useRef({});

  // 1) Cargar la lista completa de monstruos
  useEffect(() => {
    fetch(`${API}/api/monsters`)
      .then((r) => {
        if (!r.ok) throw new Error('No se pudo cargar el bestiario');
        return r.json();
      })
      .then((data) => setMonsters(data.results))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingList(false));
  }, []);

  // 2) Filtrar y paginar
  const filtered = useMemo(
    () => monsters.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [monsters, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // 3) Cargar el detalle de los monstruos de la página actual
  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      if (pageItems.length === 0) {
        setDetails([]);
        return;
      }
      setLoadingDetails(true);
      try {
        const results = await Promise.all(
          pageItems.map(async (m) => {
            if (!cache.current[m.index]) {
              const r = await fetch(`${API}${m.url}`);
              if (!r.ok) throw new Error('Error al cargar un monstruo');
              cache.current[m.index] = await r.json();
            }
            return cache.current[m.index];
          })
        );
        if (!cancelled) setDetails(results);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoadingDetails(false);
      }
    }

    loadDetails();
    return () => { cancelled = true; };
  }, [pageItems]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (loadingList) return <p className="status">Cargando bestiario... 🐉</p>;
  if (error) return <p className="status error">⚠️ {error}</p>;

  return (
    <section>
      <h2 className="section-title">Bestiario</h2>

      <input
        className="search-input"
        type="search"
        placeholder="Buscar monstruo (ej: dragon, goblin)..."
        value={search}
        onChange={handleSearch}
      />

      <p className="results-count">{filtered.length} monstruos encontrados</p>

      {loadingDetails && <p className="status">Cargando estadísticas...</p>}

      <div className="card-grid">
        {details.map((m) => (
          <Card
            key={m.index}
            title={m.name}
            subtitle={`${translateSize[m.size] ?? m.size} · ${m.type}`}
            image={m.image ? `${API}${m.image}` : null}
            stats={[
              { label: '🛡️ Armadura (AC)', value: getAC(m) },
              { label: '❤️ Puntos de golpe (HP)', value: m.hit_points },
              { label: '💀 Desafío (CR)', value: formatCR(m.challenge_rating) },
            ]}
          >
            <div className="abilities">
              <span>FUE {m.strength}</span>
              <span>DES {m.dexterity}</span>
              <span>CON {m.constitution}</span>
              <span>INT {m.intelligence}</span>
              <span>SAB {m.wisdom}</span>
              <span>CAR {m.charisma}</span>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && <p className="status">No se encontraron monstruos.</p>}

      {filtered.length > 0 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Anterior</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Siguiente →</button>
        </div>
      )}
    </section>
  );
}