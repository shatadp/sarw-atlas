import pdfplumber
from collections import defaultdict

def extract_grid(page, col_snap=3.0, base_bin=2.0):
    """Columns from vertical ruling lines; rows bucketed by text baseline.
    Name-continuation fragments (wrapped multi-line state names with no numbers)
    are merged into the NEAREST number-bearing row, ordered by baseline."""
    vlines=sorted(set(round(l['x0'],1) for l in page.lines if abs(l['x0']-l['x1'])<1))
    vb=[]
    for v in vlines:
        if not vb or v-vb[-1]>col_snap: vb.append(v)
    ncol=len(vb)-1
    if ncol<1: return []
    buckets=defaultdict(list)
    for w in page.extract_words(use_text_flow=False):
        buckets[round(w['top']/base_bin)].append(w)
    rows=[]  # (top, cells)
    for key in sorted(buckets):
        rw=buckets[key]; cells=['']*ncol
        top=min(w['top'] for w in rw)
        for w in sorted(rw,key=lambda x:x['x0']):
            cx=(w['x0']+w['x1'])/2
            col=next((i for i in range(ncol) if vb[i]<=cx<vb[i+1]),None)
            if col is not None: cells[col]=(cells[col]+' '+w['text']).strip()
        if any(c for c in cells): rows.append([top,cells])
    def has_nums(c): return any(x.replace(',','').replace('.','').isdigit() for x in c[2:])
    # indices of number-bearing rows
    anchors=[i for i,(t,c) in enumerate(rows) if has_nums(c)]
    consumed=set()
    for i,(t,c) in enumerate(rows):
        if has_nums(c) or c[0].strip().isdigit() or not c[1]: continue
        # number-less name fragment -> nearest anchor by baseline
        if not anchors: continue
        j=min(anchors,key=lambda a:abs(rows[a][0]-t))
        if rows[j][0]>t:  # fragment is above anchor -> prepend
            rows[j][1][1]=(c[1]+' '+rows[j][1][1]).strip()
        else:             # fragment below -> append
            rows[j][1][1]=(rows[j][1][1]+' '+c[1]).strip()
        consumed.add(i)
    return [c for i,(t,c) in enumerate(rows) if i not in consumed and (has_nums(c) or c[0].strip().isdigit())]
