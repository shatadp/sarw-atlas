// Build public/geo/india-states.geojson from the udit-001 districts file.
// Pipeline: download (cached) -> dissolve districts by st_nm -> simplify ->
// stamp canonical ISO 3166-2:IN codes -> validate every code joins both ways
// against public/data/states.json.
//
// Run: node data-pipeline/geo/build_states_geojson.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapshaper from 'mapshaper';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SRC_URL = 'https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/india.geojson';
const CACHE = path.join(ROOT, 'data-pipeline', 'geo', 'cache', 'india-districts.geojson');
const OUT = path.join(ROOT, 'public', 'geo', 'india-states.geojson');
const STATES_JSON = path.join(ROOT, 'public', 'data', 'states.json');

// Canonical ISO 3166-2:IN codes — must match data-pipeline/scripts/build_json.py CODE
const CODE = {
  'Andhra Pradesh':'AP','Arunachal Pradesh':'AR','Assam':'AS','Bihar':'BR','Chandigarh':'CH',
  'Chhattisgarh':'CT','Dadra and Nagar Haveli and Daman and Diu':'DH','Delhi':'DL','Goa':'GA',
  'Gujarat':'GJ','Haryana':'HR','Himachal Pradesh':'HP','Jammu and Kashmir':'JK','Jharkhand':'JH',
  'Karnataka':'KA','Kerala':'KL','Ladakh':'LA','Lakshadweep':'LD','Madhya Pradesh':'MP',
  'Maharashtra':'MH','Manipur':'MN','Meghalaya':'ML','Mizoram':'MZ','Nagaland':'NL','Odisha':'OR',
  'Puducherry':'PY','Punjab':'PB','Rajasthan':'RJ','Sikkim':'SK','Tamil Nadu':'TN','Telangana':'TG',
  'Tripura':'TR','Uttar Pradesh':'UP','Uttarakhand':'UT','West Bengal':'WB',
  'Andaman and Nicobar Islands':'AN',
};

// Name resolver: map any source-spelling variant -> the canonical name above.
// Keep this conservative; only add aliases we've actually seen in source data.
const NAME_ALIASES = {
  'Tamilnadu': 'Tamil Nadu',
  'Orissa': 'Odisha',
  'Pondicherry': 'Puducherry',
  'Uttranchal': 'Uttarakhand',
  'Uttrakhand': 'Uttarakhand',
  'Chhatisgarh': 'Chhattisgarh',
  'Jammu & Kashmir': 'Jammu and Kashmir',
  'Andaman & Nicobar': 'Andaman and Nicobar Islands',
  'Andaman & Nicobar Island': 'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'Daman and Diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'NCT of Delhi': 'Delhi',
  'Telengana': 'Telangana',
};
const canonical = (raw) => NAME_ALIASES[raw] ?? raw;

async function download(url, dest) {
  if (fs.existsSync(dest)) { console.log(`cache hit: ${path.relative(ROOT, dest)}`); return; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  console.log(`downloading ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  await download(SRC_URL, CACHE);

  // Step 1: dissolve districts -> states by st_nm; simplify; emit GeoJSON.
  // visvalingam weighted 7% is a good readable/light balance for choropleths.
  const input = { 'in.geojson': fs.readFileSync(CACHE) };
  const result = await mapshaper.applyCommands(
    [
      '-i in.geojson',
      '-dissolve st_nm copy-fields=st_nm',
      '-simplify visvalingam weighted 7% keep-shapes',
      '-clean',
      '-o out.geojson format=geojson precision=0.0001',
    ].join(' '),
    input,
  );

  const dissolved = JSON.parse(result['out.geojson'].toString('utf-8'));
  console.log(`dissolved features: ${dissolved.features.length}`);

  // Step 2: stamp canonical name + code on every feature; track unmapped.
  const unmapped = [];
  for (const f of dissolved.features) {
    const raw = f.properties.st_nm;
    const name = canonical(raw);
    const code = CODE[name] ?? null;
    if (!code) unmapped.push(raw);
    f.properties = { code, name, st_nm_source: raw };
  }
  if (unmapped.length) {
    console.error('UNMAPPED state names in GeoJSON:', unmapped);
    process.exit(1);
  }

  // Step 3: validate both directions against states.json
  const states = JSON.parse(fs.readFileSync(STATES_JSON, 'utf-8')).states;
  const dataCodes = new Set(states.map(s => s.code));
  const geoCodes = new Set(dissolved.features.map(f => f.properties.code));

  const missingInGeo = [...dataCodes].filter(c => !geoCodes.has(c));
  const missingInData = [...geoCodes].filter(c => !dataCodes.has(c));

  console.log(`states.json codes: ${dataCodes.size}`);
  console.log(`geojson codes:     ${geoCodes.size}`);
  if (missingInGeo.length) console.error('missing in GeoJSON:', missingInGeo);
  if (missingInData.length) console.error('missing in states.json:', missingInData);

  // Step 4: write output
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(dissolved));
  const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`wrote ${path.relative(ROOT, OUT)} (${kb} kB)`);

  if (missingInGeo.length || missingInData.length) {
    console.error('VALIDATION FAILED');
    process.exit(1);
  }
  console.log('VALIDATION OK — all 36 states join cleanly');
}

main().catch((e) => { console.error(e); process.exit(1); });
