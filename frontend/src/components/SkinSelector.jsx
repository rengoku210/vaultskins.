import { useMemo, useState } from 'react';

export default function SkinSelector({ skins, selected, onChange }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return skins
      .map((skin) => ({
        ...skin,
        score: skin.displayName.toLowerCase().includes(q) ? 2 : skin.weapon.toLowerCase().includes(q) ? 1 : 0
      }))
      .filter((skin) => skin.score > 0 || !q)
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);
  }, [skins, query]);

  const toggle = (skin) => {
    if (selected.some((item) => item.uuid === skin.uuid)) {
      onChange(selected.filter((item) => item.uuid !== skin.uuid));
    } else {
      onChange([...selected, skin]);
    }
  };

  return (
    <section>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search skins by name or weapon"
      />
      <div className="skin-grid">
        {filtered.map((skin) => (
          <button key={skin.uuid} className="skin-row" onClick={() => toggle(skin)}>
            <img src={skin.displayIcon || '/placeholder-thumb.png'} alt={skin.displayName} loading="lazy" />
            <span>{skin.displayName}</span>
          </button>
        ))}
      </div>
      <div className="chips">
        {selected.map((skin) => (
          <span className="chip" key={skin.uuid}>{skin.displayName}</span>
        ))}
      </div>
    </section>
  );
}
