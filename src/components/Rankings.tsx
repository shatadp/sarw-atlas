import type { StateRecord } from '../data';
import type { Metric } from '../lib/metrics';

type Props = {
  states: StateRecord[];
  metric: Metric;
  selectedCode: string | null;
  onSelect: (code: string) => void;
};

export default function Rankings({ states, metric, selectedCode, onSelect }: Props) {
  const ranked = [...states]
    .map((s) => ({ s, v: metric.accessor(s) }))
    .filter((r) => r.v != null)
    .sort((a, b) => (b.v as number) - (a.v as number));

  const top = ranked.slice(0, 5);
  const bottom = ranked.slice(-5).reverse();

  return (
    <aside className="rankings">
      <h3>Ranked: {metric.label}</h3>
      <div className="rank-section">
        <div className="rank-head">Top 5</div>
        {top.map((r) => (
          <Row key={r.s.code!} r={r} metric={metric} selected={r.s.code === selectedCode} onSelect={onSelect} />
        ))}
      </div>
      <div className="rank-section">
        <div className="rank-head">Bottom 5</div>
        {bottom.map((r) => (
          <Row key={r.s.code!} r={r} metric={metric} selected={r.s.code === selectedCode} onSelect={onSelect} />
        ))}
      </div>
    </aside>
  );
}

function Row({ r, metric, selected, onSelect }: {
  r: { s: StateRecord; v: number | null };
  metric: Metric;
  selected: boolean;
  onSelect: (code: string) => void;
}) {
  return (
    <button
      className={`rank-row ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(r.s.code!)}
    >
      <span className="rank-name">{r.s.state}</span>
      <span className="rank-value">
        {metric.format(r.v as number)}{metric.unit ? ' ' + metric.unit : ''}
      </span>
    </button>
  );
}
