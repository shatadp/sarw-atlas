import { useMemo, useState } from 'react';
import type { StatesPayload, DisciplinesPayload, StatesGeoJSON } from '../data';
import IndiaMap from '../components/IndiaMap';
import LayerSwitcher from '../components/LayerSwitcher';
import StateDetail from '../components/StateDetail';
import Rankings from '../components/Rankings';
import DisciplineChart from '../components/DisciplineChart';
import { getMetric, type Metric } from '../lib/metrics';
import { HEADER, INTRO, FOOTER } from '../content/narrative';

type Props = {
  states: StatesPayload;
  disciplines: DisciplinesPayload;
  geo: StatesGeoJSON;
};

export default function Dashboard({ states, disciplines, geo }: Props) {
  const [metricId, setMetricId] = useState<Metric['id']>('population');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const metric = getMetric(metricId);
  const selectedState = useMemo(
    () => (selectedCode ? states.states.find((s) => s.code === selectedCode) ?? null : null),
    [selectedCode, states.states],
  );

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div>
            <div className="tag">{HEADER.tag}</div>
            <h1>{HEADER.title}</h1>
            <div className="subtitle">{HEADER.subtitle}</div>
          </div>
          <div className="dataset">{HEADER.dataset}</div>
        </div>
      </header>

      <main className="dash">
        <p className="intro">{INTRO}</p>

        <LayerSwitcher value={metricId} onChange={setMetricId} />

        <div className="map-grid">
          <IndiaMap
            states={states.states}
            geo={geo}
            metric={metric}
            selectedCode={selectedCode}
            onSelect={setSelectedCode}
          />
          <div className="side">
            <StateDetail
              state={selectedState}
              national={states.national}
              onClose={() => setSelectedCode(null)}
            />
            <Rankings
              states={states.states}
              metric={metric}
              selectedCode={selectedCode}
              onSelect={setSelectedCode}
            />
          </div>
        </div>

        <DisciplineChart
          disciplines={disciplines.disciplines}
          totalUg={disciplines.total_ug_enrolment}
        />

        <footer className="footer">{FOOTER}</footer>
      </main>
    </>
  );
}
