import type { StateRecord } from '../data';
import { fmtAbbr, fmtInt } from '../lib/metrics';

type Props = {
  state: StateRecord | null;
  national: StateRecord | null;
  onClose: () => void;
};

export default function StateDetail({ state, national, onClose }: Props) {
  if (!state) {
    return (
      <aside className="detail empty">
        <h3>Click a state</h3>
        <p>Population, colleges, density, GER, and enrolment by level appear here.</p>
      </aside>
    );
  }

  const femalePct = state.enrolment_total && state.enrolment_female != null
    ? (100 * state.enrolment_female / state.enrolment_total).toFixed(1) + '%'
    : '—';

  const gerVsNat = state.ger != null && national?.ger != null
    ? `${(state.ger - national.ger).toFixed(1)} vs national`
    : '';

  return (
    <aside className="detail">
      <button className="detail-close" onClick={onClose} aria-label="Close">×</button>
      <h3>
        {state.state} <span className="detail-code">{state.code}</span>
      </h3>
      <div className="metric-grid">
        <Stat label="18-23 population" value={state.population_18_23 == null ? '—' : fmtAbbr(state.population_18_23)} />
        <Stat label="Universities" value={state.universities == null ? '—' : fmtInt(state.universities)} />
        <Stat label="Colleges" value={state.colleges == null ? '—' : fmtInt(state.colleges)} />
        <Stat label="Colleges / lakh 18-23" value={state.colleges_per_lakh_18_23 == null ? '—' : `${state.colleges_per_lakh_18_23}`} />
        <Stat label="Avg enrolment / college" value={state.avg_enrolment_per_college == null ? '—' : fmtInt(state.avg_enrolment_per_college)} />
        <Stat label="GER" value={state.ger == null ? '—' : `${state.ger}%`} sub={gerVsNat} />
      </div>

      <h4>Enrolment by level</h4>
      <EnrolmentBars
        ug={state.enrolment_ug ?? 0}
        pg={state.enrolment_pg ?? 0}
        phd={state.enrolment_phd ?? 0}
        total={state.enrolment_total ?? 0}
      />
      <div className="detail-row">
        <span>Total enrolled</span>
        <strong>{state.enrolment_total == null ? '—' : fmtInt(state.enrolment_total)}</strong>
      </div>
      <div className="detail-row">
        <span>Female share</span>
        <strong>{femalePct}</strong>
      </div>
      {state.ger_sc != null && (
        <div className="detail-row">
          <span>GER (SC)</span><strong>{state.ger_sc}%</strong>
        </div>
      )}
      {state.ger_st != null && (
        <div className="detail-row">
          <span>GER (ST)</span><strong>{state.ger_st}%</strong>
        </div>
      )}
    </aside>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function EnrolmentBars({ ug, pg, phd, total }: { ug: number; pg: number; phd: number; total: number }) {
  if (total <= 0) return <div className="detail-row"><span>No enrolment data</span></div>;
  const ugP = (100 * ug / total).toFixed(1);
  const pgP = (100 * pg / total).toFixed(1);
  const phdP = (100 * phd / total).toFixed(2);
  return (
    <>
      <div className="stack-bar">
        <span className="seg seg-ug" style={{ width: `${ugP}%` }} title={`UG ${ugP}%`} />
        <span className="seg seg-pg" style={{ width: `${pgP}%` }} title={`PG ${pgP}%`} />
        <span className="seg seg-phd" style={{ width: `${phdP}%` }} title={`PhD ${phdP}%`} />
      </div>
      <div className="stack-legend">
        <span><i className="dot seg-ug" /> UG {ugP}%</span>
        <span><i className="dot seg-pg" /> PG {pgP}%</span>
        <span><i className="dot seg-phd" /> PhD {phdP}%</span>
      </div>
    </>
  );
}
