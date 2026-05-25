import pdfplumber, csv, re, json
from grid_extract import extract_grid
from states import resolve
PDF='/mnt/user-data/uploads/higher_education_data_202.pdf'
pdf=pdfplumber.open(PDF)

CANON={'a & n islands':'Andaman and Nicobar Islands',
 'the dadra and nagar haveli and daman and diu':'Dadra and Nagar Haveli and Daman and Diu'}
def canon(n):
    r=resolve(n); return r if r else re.sub(r'\s+',' ',n).strip()
STATES={'andhra pradesh','arunachal pradesh','assam','bihar','chandigarh','chhattisgarh','delhi','goa',
 'gujarat','haryana','himachal pradesh','jammu and kashmir','jharkhand','karnataka','kerala','ladakh',
 'lakshadweep','madhya pradesh','maharashtra','manipur','meghalaya','mizoram','nagaland','odisha',
 'puducherry','punjab','rajasthan','sikkim','tamil nadu','telangana','tripura','uttar pradesh',
 'uttarakhand','west bengal','andaman and nicobar islands','a & n islands','all india',
 'the dadra and nagar haveli and daman and diu','dadra and nagar haveli and daman and diu'}
def num(x):
    x=(x or '').replace(',','').strip()
    if x in('','-'):return None
    try:return float(x) if '.' in x else int(x)
    except:return None
def is_state(c): return resolve(c[1]) is not None
def fused(c):  # detect the West-Bengal/All-India superimposed corruption
    nm=(c[1] or '').lower()
    return ('west' in nm and 'india' in nm) or any(len((x or '').replace(',',''))>9 for x in c[2:])
def grab(pidx,ncols):
    return [r for r in extract_grid(pdf.pages[pidx]) if len(r)>=ncols and is_state(r) and not fused(r)]

out={}
# T1 universities by type
H1=['central_univ','central_open_univ','inst_national_importance','state_public_univ','inst_under_state_legislature_act','state_open_univ','state_private_univ','state_private_open_univ','deemed_univ_govt','deemed_univ_govt_aided','deemed_univ_private','grand_total']
t1=[{**{'state':canon(r[1])},**{h:num(r[2+j]) for j,h in enumerate(H1)}} for r in grab(66,14)]
out['table1_universities_by_type']=(['state']+H1,t1)
# T4 density
t4=[{'state':canon(r[1]),'colleges_registered':num(r[2]),'colleges_per_lakh_pop_18_23':num(r[3]),'avg_enrolment_per_college':num(r[4])} for r in grab(71,5)]
out['table4_college_density']=(['state','colleges_registered','colleges_per_lakh_pop_18_23','avg_enrolment_per_college'],t4)
# T19 GER
H19=['ger_all_m','ger_all_f','ger_all_total','ger_sc_m','ger_sc_f','ger_sc_total','ger_st_m','ger_st_f','ger_st_total']
t19=[{**{'state':canon(r[1])},**{h:num(r[2+j]) for j,h in enumerate(H19)}} for r in grab(155,11)]
out['table19_ger']=(['state']+H19,t19)
# T6 enrolment by level (3 pages) + image-verified patches for fused WB & All India
lv=['phd','mphil','pg','ug','pg_diploma','diploma','certificate','integrated','grand_total']
H6=[f'{l}_{x}' for l in lv for x in ('m','f','total')]
def grab6(pidx,levels):
    d={}
    for r in grab(pidx,11):
        st=canon(r[1]); v={}
        for k,l in enumerate(levels):
            b=2+k*3; v[f'{l}_m']=num(r[b]); v[f'{l}_f']=num(r[b+1]); v[f'{l}_total']=num(r[b+2])
        d[st]=v
    return d
d=grab6(78,['phd','mphil','pg']); 
for s,v in grab6(79,['ug','pg_diploma','diploma']).items(): d.setdefault(s,{}).update(v)
for s,v in grab6(80,['certificate','integrated','grand_total']).items(): d.setdefault(s,{}).update(v)
# image-verified rows (read from rendered pages 79-81)
PATCH={'West Bengal':[8683,5103,13786, 688,614,1302, 126244,177120,303364, 1106488,1080500,2186988, 3130,2013,5143, 117513,72433,189946, 3291,2115,5406, 9590,6626,16216, 1375627,1346524,2722151],
 'All India':[113932,98636,212568, 3393,6127,9520, 2325040,2892713,5217753, 17854294,16284939,34139233, 130028,104755,234783, 1860546,1055899,2916445, 40558,36742,77300, 248598,211981,460579, 22576389,20691792,43268181]}
for st,vals in PATCH.items():
    d[st]={H6[i]:vals[i] for i in range(len(H6))}
t6=[{**{'state':s},**d[s]} for s in sorted(d,key=lambda s:(s=='All India',s))]
out['table6_enrolment_by_level']=(['state']+H6,t6)

import os; os.makedirs('../extracted',exist_ok=True)
for name,(cols,data) in out.items():
    with open(f'../extracted/{name}.csv','w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=cols); w.writeheader()
        for r in data: w.writerow({c:r.get(c,'') for c in cols})
    print(f'{name}: {len(data)} rows x {len(cols)} cols')

def ai(t,c):
    for r in out[t][1]:
        if r['state']=='All India': return r.get(c)
print('\nVALIDATION vs published:')
for lbl,got,exp in [('Universities total',ai('table1_universities_by_type','grand_total'),1168),
                    ('Colleges registered',ai('table4_college_density','colleges_registered'),45473),
                    ('GER all total',ai('table19_ger','ger_all_total'),28.4),
                    ('Enrolment grand total',ai('table6_enrolment_by_level','grand_total_total'),43268181)]:
    print(f"  [{'OK' if got==exp else 'CHECK'}] {lbl}: {got} (exp {exp})")
# spot-check a sum: T1 individual type cols should sum to grand_total for a state
r=[x for x in out['table1_universities_by_type'][1] if x['state']=='Maharashtra'][0]
s=sum(v for k,v in r.items() if k not in('state','grand_total') and v)
print(f"  [{'OK' if s==r['grand_total'] else 'CHECK'}] Maharashtra univ types sum={s} vs grand_total={r['grand_total']}")
