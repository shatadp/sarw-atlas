import { useEffect, useState } from 'react';
import {
  loadStates, loadDisciplines, loadStatesGeo,
  type StatesPayload, type DisciplinesPayload, type StatesGeoJSON,
} from './data';
import Dashboard from './views/Dashboard';

export default function App() {
  const [states, setStates] = useState<StatesPayload | null>(null);
  const [disciplines, setDisciplines] = useState<DisciplinesPayload | null>(null);
  const [geo, setGeo] = useState<StatesGeoJSON | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadStates(), loadDisciplines(), loadStatesGeo()])
      .then(([s, d, g]) => { setStates(s); setDisciplines(d); setGeo(g); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (error) return <div className="status status-err">Failed to load data: {error}</div>;
  if (!states || !disciplines || !geo) return <div className="status">Loading SARW Atlas…</div>;

  return <Dashboard states={states} disciplines={disciplines} geo={geo} />;
}
