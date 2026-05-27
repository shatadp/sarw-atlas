import type { DisciplineRecord } from '../data';
import { DESIGN_CALLOUT, DISCIPLINE_NOTE } from '../content/narrative';

type Props = { disciplines: DisciplineRecord[]; totalUg: number };

export default function DisciplineChart({ disciplines, totalUg }: Props) {
  // Top 15 by share, plus Design pinned in even if it falls out (it will, at 0.14%).
  const top = disciplines.slice(0, 15);
  const designIn = top.some((d) => d.discipline === 'Design');
  const design = disciplines.find((d) => d.discipline === 'Design');
  const rows = designIn || !design ? top : [...top, design];

  const max = Math.max(...rows.map((r) => r.share_pct));

  return (
    <section className="disciplines">
      <header className="disc-head">
        <span className="scope-tag">NATIONAL</span>
        <h2>UG discipline mix</h2>
        <div className="disc-sub">
          Total UG enrolment: {totalUg.toLocaleString('en-IN')} · {disciplines.length} disciplines tracked
        </div>
      </header>

      <div className="discipline-note">{DISCIPLINE_NOTE}</div>

      <div className="bars">
        {rows.map((d) => {
          const isDesign = d.discipline === 'Design';
          return (
            <div key={d.discipline} className={`bar-row ${isDesign ? 'is-design' : ''}`}>
              <span className="bar-label">{d.discipline}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.max(0.4, (100 * d.share_pct) / max)}%` }} />
              </div>
              <span className="bar-val">{d.share_pct}%</span>
            </div>
          );
        })}
      </div>

      <div className="design-callout"><strong>↑ Design.</strong> {DESIGN_CALLOUT}</div>
    </section>
  );
}
