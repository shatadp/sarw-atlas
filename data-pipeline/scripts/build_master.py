import csv
def load(f):
    return {r['state']:r for r in csv.DictReader(open(f'../extracted/{f}'))}
t1=load('table1_universities_by_type.csv'); t4=load('table4_college_density.csv')
t6=load('table6_enrolment_by_level.csv');   t19=load('table19_ger.csv')
states=sorted(set(t4)|set(t6), key=lambda s:(s=='All India',s))
def g(d,s,k):
    v=d.get(s,{}).get(k,''); 
    return v if v not in (None,'') else ''
rows=[]
for s in states:
    rows.append({
      'state':s,
      'universities_total':g(t1,s,'grand_total'),
      'colleges_registered':g(t4,s,'colleges_registered'),
      'colleges_per_lakh_18_23':g(t4,s,'colleges_per_lakh_pop_18_23'),
      'avg_enrolment_per_college':g(t4,s,'avg_enrolment_per_college'),
      'enrolment_total':g(t6,s,'grand_total_total'),
      'enrolment_ug_total':g(t6,s,'ug_total'),
      'enrolment_pg_total':g(t6,s,'pg_total'),
      'enrolment_phd_total':g(t6,s,'phd_total'),
      'enrolment_female':g(t6,s,'grand_total_f'),
      'ger_all_total':g(t19,s,'ger_all_total'),
    })
cols=list(rows[0].keys())
with open('../extracted/state_master.csv','w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=cols); w.writeheader(); w.writerows(rows)
print('state_master.csv:',len(rows),'rows x',len(cols),'cols')
# show top 8 states by enrolment for a sanity peek
data=[r for r in rows if r['state']!='All India' and r['enrolment_total']]
data.sort(key=lambda r:int(r['enrolment_total']),reverse=True)
print('\nTop 8 states by total enrolment:')
for r in data[:8]:
    print(f"  {r['state']:18} enrol={int(r['enrolment_total']):>10,}  colleges/lakh={r['colleges_per_lakh_18_23']:>4}  GER={r['ger_all_total']}")
