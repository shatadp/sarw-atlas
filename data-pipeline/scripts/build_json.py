"""Phase 0 build step: convert validated CSVs -> static JSON for the frontend.
Emits public/data/states.json and public/data/disciplines.json.
Run from repo root:  python data-pipeline/scripts/build_json.py
"""
import csv, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXTRACTED = os.path.join(ROOT, 'data-pipeline', 'extracted')
OUT = os.path.join(ROOT, 'public', 'data')
os.makedirs(OUT, exist_ok=True)

# Canonical ISO 3166-2:IN state codes (the map-join key — see docs/03_DATA_SPEC.md §7)
CODE = {
 'Andhra Pradesh':'AP','Arunachal Pradesh':'AR','Assam':'AS','Bihar':'BR','Chandigarh':'CH',
 'Chhattisgarh':'CT','Dadra and Nagar Haveli and Daman and Diu':'DH','Delhi':'DL','Goa':'GA',
 'Gujarat':'GJ','Haryana':'HR','Himachal Pradesh':'HP','Jammu and Kashmir':'JK','Jharkhand':'JH',
 'Karnataka':'KA','Kerala':'KL','Ladakh':'LA','Lakshadweep':'LD','Madhya Pradesh':'MP',
 'Maharashtra':'MH','Manipur':'MN','Meghalaya':'ML','Mizoram':'MZ','Nagaland':'NL','Odisha':'OR',
 'Puducherry':'PY','Punjab':'PB','Rajasthan':'RJ','Sikkim':'SK','Tamil Nadu':'TN','Telangana':'TG',
 'Tripura':'TR','Uttar Pradesh':'UP','Uttarakhand':'UT','West Bengal':'WB',
 'Andaman and Nicobar Islands':'AN',
}

def load(f): return {r['state']: r for r in csv.DictReader(open(os.path.join(EXTRACTED, f)))}
def n(v):
    if v in (None,'','-'): return None
    v=str(v).replace(',','')
    try: return int(v)
    except:
        try: return float(v)
        except: return None

master=load('state_master.csv'); pop=load('table38_population_18_23.csv')
ger=load('table19_ger.csv'); lvl=load('table6_enrolment_by_level.csv')

states=[]; national=None
for name,m in master.items():
    rec={
        'code': CODE.get(name),
        'state': name,
        'population_18_23': n(pop.get(name,{}).get('pop_18_23_total')),
        'universities': n(m.get('universities_total')),
        'colleges': n(m.get('colleges_registered')),
        'colleges_per_lakh_18_23': n(m.get('colleges_per_lakh_18_23')),
        'avg_enrolment_per_college': n(m.get('avg_enrolment_per_college')),
        'enrolment_total': n(m.get('enrolment_total')),
        'enrolment_ug': n(m.get('enrolment_ug_total')),
        'enrolment_pg': n(m.get('enrolment_pg_total')),
        'enrolment_phd': n(m.get('enrolment_phd_total')),
        'enrolment_female': n(m.get('enrolment_female')),
        'ger': n(m.get('ger_all_total')),
        'ger_sc': n(ger.get(name,{}).get('ger_sc_total')),
        'ger_st': n(ger.get(name,{}).get('ger_st_total')),
    }
    if name=='All India': national=rec
    else: states.append(rec)

states.sort(key=lambda r:(r['code'] is None, r['code'] or ''))
with open(os.path.join(OUT,'states.json'),'w') as f:
    json.dump({'national':national,'states':states},f,indent=2)

# disciplines — NATIONAL only (see docs/03_DATA_SPEC.md §4)
disc_rows=list(csv.DictReader(open(os.path.join(EXTRACTED,'discipline_enrolment.csv'))))
ug=[r for r in disc_rows if r['level_group']=='UG']
broad={}
for r in ug:
    d=r['discipline']
    if d.endswith(' Total'): broad[d[:-6].strip()]=n(r['total'])
for r in ug:
    if r['broad_discipline']==r['discipline'] and r['discipline'] not in broad and n(r['total']) and not r['discipline'].endswith('Total'):
        broad[r['discipline']]=n(r['total'])
total=sum(v for v in broad.values() if v)
disciplines=[{'discipline':d,'ug_enrolment':v,'share_pct':round(100*v/total,2)} for d,v in sorted(broad.items(),key=lambda x:-(x[1] or 0)) if v]
with open(os.path.join(OUT,'disciplines.json'),'w') as f:
    json.dump({'scope':'national','level':'UG','total_ug_enrolment':total,'disciplines':disciplines},f,indent=2)

print(f"states.json: {len(states)} states + national")
print(f"disciplines.json: {len(disciplines)} disciplines, total UG={total:,}")
# validation gate
assert len(states)>=35, "missing states!"
assert national and national['colleges']==45473, "national colleges mismatch"
assert total==33127729, f"discipline total mismatch: {total}"
print("VALIDATION OK — all gates passed")
