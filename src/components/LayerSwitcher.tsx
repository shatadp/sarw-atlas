import { METRICS, type Metric } from '../lib/metrics';
import { LAYER_GUIDE } from '../content/narrative';

type Props = { value: Metric['id']; onChange: (id: Metric['id']) => void };

export default function LayerSwitcher({ value, onChange }: Props) {
  return (
    <div className="layer-switcher">
      <div className="layer-tabs" role="tablist" aria-label="Map metric">
        {METRICS.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={value === m.id}
            className={`layer-tab ${value === m.id ? 'is-active' : ''}`}
            onClick={() => onChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="layer-guide">{LAYER_GUIDE[value]}</p>
    </div>
  );
}
