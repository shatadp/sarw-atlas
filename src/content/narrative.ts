// Founder's-read narrative — opinionated framing, not a neutral data dump.
// Keep it short. Every claim must be defensible from the data on the page.

export const HEADER = {
  tag: 'SARW Labs',
  title: 'SARW Atlas',
  subtitle: 'India Higher Education & Skills Landscape',
  dataset: 'AISHE 2021-22 · Ministry of Education',
};

export const INTRO = `India's higher-education system is large, lopsided, and built around degrees \
that don't match the skills market. This map is the SARW Labs read of where students \
are, where institutions are, and where the participation gaps sit — the situational \
awareness behind every decision we make about cohort design and lab geography.`;

export const LAYER_GUIDE: Record<string, string> = {
  population: 'Raw 18-23 market size by state. UP, Bihar, Maharashtra, MP, WB account for ~half the cohort.',
  density:    'Colleges per lakh of 18-23 population — supply, not headcount. Karnataka, Telangana, Puducherry sit at the top; Bihar and Jharkhand are the most under-served large states.',
  ger:        'Gross Enrolment Ratio. National = 28.4%. Diverging palette: red = under-served, blue = over-served. Chandigarh, Puducherry, Delhi sit above 49%; Bihar and Assam are below 18%.',
  enrolment:  'Where the enrolled student base actually lives. Useful for funnel sizing per geography, separate from raw demography.',
};

export const DISCIPLINE_NOTE = `AISHE does not cross discipline with geography — there is no \
"engineering students in Karnataka" anywhere in the source. This view is therefore strictly \
national. Closing the gap requires AICTE intake data (later phase).`;

export const DESIGN_CALLOUT = `Design = 0.14% of UG enrolment. ~45k students nationally, \
against ~33M total UG. The scarcity is the opportunity SARW reads.`;

export const FOOTER = `Built in public by SARW Labs. Numbers come from a validated Python \
extraction pipeline against AISHE 2021-22; every figure on this page traces back to a CSV. \
Source on GitHub. District-level, AICTE intake, and AI Q&A are scheduled fast-follows.`;
