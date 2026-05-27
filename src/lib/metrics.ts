// Metric definitions — single source of truth for what the choropleth can colour by.
// A Metric ties together: how to read the number off a StateRecord, how to format
// it, what kind of scale (sequential for counts, diverging for ratios), and the
// stepped colour breaks the map + legend share.
//
// To add a metric: append a new entry to METRICS. Nothing else needs to know.

import type { StateRecord } from '../data';

export type Step = readonly [number, string];

export type Metric = {
  id: 'population' | 'density' | 'ger' | 'enrolment';
  label: string;            // shown in the layer switcher
  legendTitle: string;      // shown above the legend swatches
  unit: string;             // shown in the tooltip after the number
  scale: 'sequential' | 'diverging';
  accessor: (s: StateRecord) => number | null;
  format: (n: number) => string;
  steps: readonly Step[];   // ascending floors; first floor is treated as the "below" bucket
  rank: 'desc' | 'asc';     // desc = bigger is "more"; asc only used for legibility, never colour
  pivot?: number;           // diverging only: the centre value (for callouts/context)
};

const fmtInt = (n: number) => n.toLocaleString('en-IN');
const fmtAbbr = (n: number) =>
  n >= 1e7 ? `${(n / 1e7).toFixed(2)} Cr` :
  n >= 1e5 ? `${(n / 1e5).toFixed(2)} L` :
  n >= 1e3 ? `${(n / 1e3).toFixed(1)} k` :
  `${n}`;

// Sequential blue ramp (ColorBrewer Blues-7), used for counts.
const SEQ_BLUE = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#3182bd','#08519c'] as const;

// Diverging palette around the national value (ColorBrewer RdBu-7).
// Red = below national, grey ≈ at-national, blue = above national. The map uses
// 6 step boundaries (= 7 buckets), so the palette has 7 colours.
const DIV_RDBU = ['#b2182b','#ef8a62','#fddbc7','#f0f0f0','#d1e5f0','#67a9cf','#2166ac'] as const;

export const METRICS: readonly Metric[] = [
  {
    id: 'population',
    label: '18-23 population',
    legendTitle: '18-23 population',
    unit: '',
    scale: 'sequential',
    accessor: (s) => s.population_18_23,
    format: fmtAbbr,
    steps: [
      [0,           SEQ_BLUE[0]],
      [200_000,     SEQ_BLUE[1]],
      [1_000_000,   SEQ_BLUE[2]],
      [3_000_000,   SEQ_BLUE[3]],
      [6_000_000,   SEQ_BLUE[4]],
      [10_000_000,  SEQ_BLUE[5]],
      [20_000_000,  SEQ_BLUE[6]],
    ],
    rank: 'desc',
  },
  {
    id: 'density',
    label: 'College density',
    legendTitle: 'Colleges / lakh 18-23',
    unit: '/ lakh',
    scale: 'sequential',
    accessor: (s) => s.colleges_per_lakh_18_23,
    format: (n) => `${n}`,
    steps: [
      [0,  SEQ_BLUE[0]],
      [10, SEQ_BLUE[1]],
      [20, SEQ_BLUE[2]],
      [30, SEQ_BLUE[3]],
      [40, SEQ_BLUE[4]],
      [50, SEQ_BLUE[5]],
      [60, SEQ_BLUE[6]],
    ],
    rank: 'desc',
  },
  {
    id: 'ger',
    label: 'GER (participation)',
    legendTitle: 'Gross Enrolment Ratio (%) — diverging at national 28.4',
    unit: '%',
    scale: 'diverging',
    accessor: (s) => s.ger,
    format: (n) => `${n.toFixed(1)}%`,
    pivot: 28.4,
    steps: [
      [0,    DIV_RDBU[0]],
      [15,   DIV_RDBU[1]],
      [22,   DIV_RDBU[2]],
      [28.4, DIV_RDBU[3]],
      [35,   DIV_RDBU[4]],
      [45,   DIV_RDBU[5]],
      [60,   DIV_RDBU[6]],
    ],
    rank: 'desc',
  },
  {
    id: 'enrolment',
    label: 'Total enrolment',
    legendTitle: 'Total higher-ed enrolment',
    unit: '',
    scale: 'sequential',
    accessor: (s) => s.enrolment_total,
    format: fmtAbbr,
    steps: [
      [0,         SEQ_BLUE[0]],
      [100_000,   SEQ_BLUE[1]],
      [500_000,   SEQ_BLUE[2]],
      [1_000_000, SEQ_BLUE[3]],
      [2_000_000, SEQ_BLUE[4]],
      [4_000_000, SEQ_BLUE[5]],
      [6_000_000, SEQ_BLUE[6]],
    ],
    rank: 'desc',
  },
];

export const getMetric = (id: Metric['id']) =>
  METRICS.find((m) => m.id === id) ?? METRICS[0];

export { fmtInt, fmtAbbr };
