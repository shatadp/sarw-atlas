"""Download external enrichment datasets for the SARW situational-awareness project.
Run on your own machine (this sandbox cannot reach gov.in domains).
    python download_external.py
Drops files into ./external/. URLs are landing pages where a direct link isn't stable;
open those and grab the latest report/microdata, then place in ./external/.
"""
import os, urllib.request
os.makedirs('external', exist_ok=True)

# Stable-ish direct/document endpoints (verify against the live site before a run):
DIRECT = {
    # AISHE editions (Ministry of Education statistics)
    'aishe_2021_22_report.pdf':
        'https://cdnbbsr.s3waas.gov.in/s392049debbe566ca5782a3045cf300a3c/uploads/2024/02/20240719952688509.pdf',
}
# Landing pages to visit manually (no stable direct link):
MANUAL = {
    'PLFS (graduate unemployment & LFPR by state, latest 2025 calendar-year)':
        'https://www.mospi.gov.in/  -> Reports -> Periodic Labour Force Survey  (microdata: https://microdata.gov.in)',
    'AICTE approved institutions (intake by state/district: engineering, management, architecture, design)':
        'https://facilities.aicte-india.org/dashboard/pages/dashboardaicte.php',
    'NIRF rankings (institution quality by discipline)':
        'https://www.nirfindia.org/Rankings/2024/Ranking.html',
}

for name, url in DIRECT.items():
    dest = os.path.join('external', name)
    try:
        print(f'Downloading {name} ...')
        urllib.request.urlretrieve(url, dest)
        print(f'  saved -> {dest}')
    except Exception as e:
        print(f'  FAILED ({e}); open in browser: {url}')

print('\nFetch these manually (no stable direct link):')
for k, v in MANUAL.items():
    print(f'  - {k}\n      {v}')
