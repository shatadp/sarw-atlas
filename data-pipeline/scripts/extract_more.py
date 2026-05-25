import pdfplumber, csv, re
from grid_extract import extract_grid
from states import resolve
pdf=pdfplumber.open('/mnt/user-data/uploads/higher_education_data_202.pdf')
def num(x):
    x=(x or '').replace(',','').strip()
    if x in ('','-'): return None
    try: return int(x)
    except:
        try: return float(x)
        except: return None
def clean(s):  # strip leaked page-header tokens
    return re.sub(r'\b(Table\s*1[23]\.?.*|2021-22|Based on Actual Response|Enrolment at.*)\b','',s or '',flags=re.I).strip()

# ===== Population (T38, p225) by state =====
pop=[]
for r in extract_grid(pdf.pages[224]):
    st=resolve(r[1])
    if st and len(r)>=5 and (num(r[5]) or num(r[4])) and 'india' not in (r[1] or '').lower():
        pop.append({'state':st,'pop_18_23_male':num(r[3]),'pop_18_23_female':num(r[4]),'pop_18_23_total':num(r[5])})
# image-verified fused rows (West Bengal + All India superimposed in text layer)
pop.append({'state':'West Bengal','pop_18_23_male':5305000,'pop_18_23_female':5032000,'pop_18_23_total':10337000})
pop.append({'state':'All India','pop_18_23_male':79885016,'pop_18_23_female':72559000,'pop_18_23_total':152452016})
with open('../extracted/table38_population_18_23.csv','w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=['state','pop_18_23_male','pop_18_23_female','pop_18_23_total']); w.writeheader(); w.writerows(pop)
ai_pop=next(r['pop_18_23_total'] for r in pop if r['state']=='All India')
print(f"T38 population: {len(pop)} rows | All India 18-23 = {ai_pop:,}")

# ===== UG disciplines (T12, p129-131) =====
def grab_disc(pages):
    rows=[]; cur_broad=''
    for p in pages:
        for r in extract_grid(pdf.pages[p]):
            if len(r)<6: continue
            broad=clean(r[1]); sub=clean(r[2]); tot=num(r[5])
            if tot is None: continue
            m=num(r[3]); fem=num(r[4])
            if broad: cur_broad=broad
            disc = sub if sub else broad
            if not disc: continue
            rows.append({'broad_discipline':cur_broad if sub else disc,
                         'discipline':disc,'level_group':'',
                         'male':m,'female':fem,'total':tot})
    return rows
ug=grab_disc([128,129,130])
for r in ug: r['level_group']='UG'
pg=grab_disc([131,132,133,134,135,136,137])
for r in pg: r['level_group']='PG_MPhil_PhD'
disc=ug+pg
with open('../extracted/discipline_enrolment.csv','w',newline='') as f:
    cols=['level_group','broad_discipline','discipline','male','female','total']
    w=csv.DictWriter(f,fieldnames=cols); w.writeheader()
    for r in disc: w.writerow({c:r.get(c,'') for c in cols})
ug_sum=sum(r['total'] for r in ug if r['total'])
print(f"T12 UG disciplines: {len(ug)} rows | sum of totals = {ug_sum:,}")
print(f"T13 PG/MPhil/PhD disciplines: {len(pg)} rows")
# show broad UG disciplines (those where discipline==broad, i.e. top-level)
print("\nBroad UG disciplines (top level):")
for r in ug:
    if r['broad_discipline']==r['discipline'] and r['total']:
        print(f"  {r['discipline']:34} {r['total']:>11,}")
