import re
CANONICAL=['Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh',
 'Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana',
 'Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep',
 'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry',
 'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
 'West Bengal','All India']
VARIANTS={'chhatisgarh':'Chhattisgarh','uttrakhand':'Uttarakhand','a n islands':'Andaman and Nicobar Islands',
 'a and n islands':'Andaman and Nicobar Islands',
 'the dadra and nagar haveli and daman and diu':'Dadra and Nagar Haveli and Daman and Diu',
 'the dadra and nagar haveli and daman and':'Dadra and Nagar Haveli and Daman and Diu',
 'dadra and nagar haveli and daman and':'Dadra and Nagar Haveli and Daman and Diu'}
def norm(s): return re.sub(r'[^a-z0-9 ]',' ',re.sub(r'\s+',' ',(s or '').lower())).strip()
_NC={norm(c):c for c in CANONICAL}
def resolve(raw):
    n=norm(raw)
    if n in _NC: return _NC[n]
    if n in VARIANTS: return VARIANTS[n]
    # longest-prefix match against canonical & variants (strips trailing pollution)
    cands=[]
    for key,canon in list(_NC.items())+list(VARIANTS.items()):
        if n.startswith(key) or key.startswith(n) and len(n)>=8:
            cands.append((len(key),canon))
        elif key in n and len(key)>=8:
            cands.append((len(key),canon))
    if cands: return max(cands)[1]
    return None
