// The data-access layer — the ONLY place that knows where data comes from.
// V1: reads baked JSON from /public/data/ and /public/geo/. Later: swap to a
// backend API without touching any rendering code (see docs/02_ARCHITECTURE.md §1).

export type StateRecord = {
  code: string | null;
  state: string;
  population_18_23: number | null;
  universities: number | null;
  colleges: number | null;
  colleges_per_lakh_18_23: number | null;
  avg_enrolment_per_college: number | null;
  enrolment_total: number | null;
  enrolment_ug: number | null;
  enrolment_pg: number | null;
  enrolment_phd: number | null;
  enrolment_female: number | null;
  ger: number | null;
  ger_sc: number | null;
  ger_st: number | null;
};

export type StatesPayload = {
  national: StateRecord | null;
  states: StateRecord[];
};

export type DisciplineRecord = {
  discipline: string;
  ug_enrolment: number;
  share_pct: number;
};

export type DisciplinesPayload = {
  scope: 'national';
  level: 'UG';
  total_ug_enrolment: number;
  disciplines: DisciplineRecord[];
};

export type StateGeoProps = { code: string; name: string; st_nm_source: string };
export type StatesGeoJSON = GeoJSON.FeatureCollection<GeoJSON.Geometry, StateGeoProps>;

const url = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`${path}: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const loadStates = () => fetchJson<StatesPayload>('data/states.json');
export const loadDisciplines = () => fetchJson<DisciplinesPayload>('data/disciplines.json');
export const loadStatesGeo = () => fetchJson<StatesGeoJSON>('geo/india-states.geojson');
