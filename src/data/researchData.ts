import {
  ResearchItem,
  MethodologyCard,
  ResearcherProfile,
  ResearchCollection,
  Highlight,
  ResearchNote,
  ReadingSession,
  ReadingGoal,
  ActivityLog,
} from '../types/research';

export const INITIAL_COLLECTIONS: ResearchCollection[] = [
  {
    id: 'col-general',
    name: 'General Research Archive',
    description: 'Primary repository for peer-reviewed papers and working preprints.',
    color: '#1F3FB0',
  },
  {
    id: 'col-reviews',
    name: 'Literature Reviews & Syntheses',
    description: 'Evidence synthesis, meta-analyses, and systematic bibliometric reviews.',
    color: '#2563EB',
  },
  {
    id: 'col-methods',
    name: 'Methodology & Empirical Studies',
    description: 'Empirical protocols, computational frameworks, and experimental models.',
    color: '#536B52',
  },
  // Smart Collections
  {
    id: 'col-smart-unread',
    name: 'Unread Reading Queue',
    description: 'Papers in Inbox or marked To Read.',
    isSmart: true,
    smartFilter: { readingStatus: 'to_read' },
    color: '#9333EA',
  },
  {
    id: 'col-smart-high',
    name: 'High Priority Reads',
    description: 'Studies tagged with High Importance.',
    isSmart: true,
    smartFilter: { priority: 'high' },
    color: '#E11D48',
  },
];

export const INITIAL_RESEARCH_ITEMS: ResearchItem[] = [];

export const INITIAL_HIGHLIGHTS: Highlight[] = [];

export const INITIAL_NOTES: ResearchNote[] = [];

export const INITIAL_READING_SESSIONS: ReadingSession[] = [];

export const INITIAL_GOALS: ReadingGoal[] = [
  {
    id: 'goal-01',
    type: 'papers_per_week',
    label: 'Weekly Papers Completed',
    target: 3,
    period: 'weekly',
    current: 0,
  },
  {
    id: 'goal-02',
    type: 'minutes_per_day',
    label: 'Daily Deep Reading Time',
    target: 35,
    period: 'daily',
    current: 0,
  },
  {
    id: 'goal-03',
    type: 'papers_per_month',
    label: 'Papers Synthesized',
    target: 12,
    period: 'monthly',
    current: 0,
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

export const METHODOLOGY_CARDS: MethodologyCard[] = [
  {
    id: 'method-01',
    title: 'Computational Data Science & Statistical Inference',
    category: 'QUANTITATIVE & COMPUTATIONAL SCIENCE',
    associatedTechniques: [
      'Hypothesis testing & regression',
      'Time-series econometric modeling',
      'Bayesian statistical inference',
      'Automated data ingestion & ETL',
    ],
    scientificApplications:
      'Formulates reproducible statistical pipelines and empirical econometric models from large-scale multi-dimensional observation data without self-reporting biases.',
    workflow: [
      'Raw data ingest & schema validation from empirical repositories',
      'Entity linkage and longitudinal record alignment',
      'Filtering confounding variables and seasonal noise',
      'Statistical model estimation and cross-validation benchmarking',
    ],
    tools: ['Python', 'Pandas', 'DuckDB', 'PySpark', 'SQL'],
    associatedResearchIds: [],
  },
  {
    id: 'method-02',
    title: 'Systematic Reviews & Evidence Synthesis',
    category: 'EVIDENCE-BASED METHODOLOGY',
    associatedTechniques: [
      'PRISMA 2020 guidelines',
      'Bibliometric co-word networks',
      'Thematic qualitative synthesis',
      'Risk-of-bias assessment',
    ],
    scientificApplications:
      'Produces exhaustive, reproducible syntheses of emergent interdisciplinary scientific domains across global bibliographic databases.',
    workflow: [
      'Protocol registration & search string formulation',
      'Multi-database harvesting (Scopus, WoS, OpenAlex, PubMed)',
      'Blind multi-reviewer screening & conflict resolution',
      'Extraction matrix & bibliometric network modeling',
    ],
    tools: ['VOSviewer', 'Bibliometrix', 'Rayyan', 'Python NLP'],
    associatedResearchIds: [],
  },
  {
    id: 'method-03',
    title: 'Controlled Experimental Design & Hypothesis Testing',
    category: 'EMPIRICAL & EXPERIMENTAL DESIGN',
    associatedTechniques: [
      'Factorial intervention design',
      'Randomized control groups',
      'Choice architecture & nudging',
      'Counterfactual causal modeling',
    ],
    scientificApplications:
      'Evaluates environmental and informational interventions to quantify causal mechanisms in real-world and digital decision environments.',
    workflow: [
      'Baseline behavioral pattern audit and power analysis',
      'Factorial intervention design and control allocation',
      'Field deployment with unobtrusive logging',
      'Difference-in-differences econometric analysis',
    ],
    tools: ['R', 'Difference-in-Differences Econometrics', 'Qualtrics'],
    associatedResearchIds: [],
  },
  {
    id: 'method-04',
    title: 'Immersive Technologies & Visual Attention Analysis',
    category: 'EXPERIMENTAL TECHNOLOGIES',
    associatedTechniques: [
      'Virtual Reality 3D environments',
      'High-frequency eye tracking telemetry',
      'Fixation duration & sequence analysis',
      'Areas of Interest (AOI) heatmapping',
    ],
    scientificApplications:
      'Uncovers the subconscious visual attention mechanisms and cognitive deliberation heuristics before conscious verbalization occurs.',
    workflow: [
      'Photorealistic 3D environment modeling in Unity',
      'Binocular gaze calibration and parallax validation',
      'Automated AOI detection on stimulus interfaces',
      'Multi-modal correlation of gaze fixations with decisions',
    ],
    tools: ['Unity 3D', 'HTC Vive Pro Eye', 'Tobii Pro', 'Python (SciPy)'],
    associatedResearchIds: [],
  },
  {
    id: 'method-05',
    title: 'Data Science & Automated Web Harvesters',
    category: 'DATA ENGINEERING & SCRAPING',
    associatedTechniques: [
      'Asynchronous web crawling',
      'Schema normalization',
      'Dynamic JS rendering capture',
      'Relational data modeling',
    ],
    scientificApplications:
      'Builds comprehensive, reliable scientific databases from heterogeneous online registries and APIs for computational research analysis.',
    workflow: [
      'Target registry structure audit and endpoint discovery',
      'Asynchronous crawler deployment with rate-limiting and error recovery',
      'Data cleaning, deduplication, and entity resolution',
      'Export to relational SQL and geospatial Parquet formats',
    ],
    tools: ['Python', 'Playwright', 'PostgreSQL', 'DuckDB', 'BeautifulSoup'],
    associatedResearchIds: [],
  },
  {
    id: 'method-06',
    title: 'Geospatial & Regional Spatial Analysis',
    category: 'GEOSPATIAL & REGIONAL SCIENCE',
    associatedTechniques: [
      'GIS boundary polygon matching',
      'Spatial distribution & clustering',
      'Administrative boundary mapping',
      'Territorial supply network modeling',
    ],
    scientificApplications:
      'Structures the spatial and administrative footprints of regional phenomena, analyzing territorial distribution, spatial clustering, and economic resilience.',
    workflow: [
      'Harvesting municipal and territorial specifications',
      'Mapping administrative boundaries with NUTS / LAU coordinates',
      'Spatial correlation with environmental and socio-economic indicators',
      'Interactive cartographic dashboard and map visualization',
    ],
    tools: ['QGIS', 'GeoPandas', 'Shapely', 'Leaflet / Mapbox'],
    associatedResearchIds: [],
  },
  {
    id: 'method-07',
    title: 'Reproducible Computational Pipelines & Open Science',
    category: 'REPRODUCIBILITY & DATA MANAGEMENT',
    associatedTechniques: [
      'FAIR data stewardship',
      'Containerized execution pipelines',
      'Version-controlled analytical code',
      'Open repository deposit & DOI linkage',
    ],
    scientificApplications:
      'Ensures complete scientific transparency, auditable code execution, and long-term preservation of scientific research assets.',
    workflow: [
      'Analytical workflow dependency containerization',
      'Open schema metadata annotation',
      'Public registry deposit with persistent identifiers',
      'Automated peer-verification testing suite',
    ],
    tools: ['Docker', 'Git', 'Zenodo', 'OpenAlex API', 'Snakemake'],
    associatedResearchIds: [],
  },
];

export const RESEARCHER_PROFILE: ResearcherProfile = {
  id: 'profile-primary',
  name: 'Amine Zouaghi',
  title: 'Multidisciplinary Researcher & MSCA PhD Fellow',
  program: 'FutureData4EU Doctoral Programme (Horizon Europe MSCA COFUND)',
  primaryAffiliation: 'University of Parma',
  secondaryAffiliations: [
    'Department of Food and Drug / Department of Economics and Management, University of Parma',
    'Visiting Researcher, CITA (Centro de Investigación y Tecnología Agroalimentaria de Aragón), Zaragoza, Spain',
    'Alumnus & Former Researcher, CIHEAM Mediterranean Agronomic Institute of Chania (MAICh), Greece',
  ],
  academicBackground: [
    {
      degree: 'Doctoral Candidate (MSCA PhD Fellow)',
      field: 'Big Data, Consumer Behaviour & Sustainable Food Systems',
      institution: 'University of Parma (FutureData4EU)',
      year: '2023–Present',
    },
    {
      degree: 'Master of Science (MSc)',
      field: 'Business Economics and Management',
      institution: 'CIHEAM Mediterranean Agronomic Institute of Chania (MAICh)',
      year: '2022',
    },
    {
      degree: 'Master of Science (MSc)',
      field: 'Computer Engineering',
      institution: 'National Engineering School',
      year: '2020',
    },
  ],
  researchPillars: [
    {
      title: 'Computational Data Science & Empirical Modeling',
      description:
        'Developing reproducible quantitative pipelines, Bayesian econometric models, and high-dimensional analytical frameworks for complex empirical phenomena.',
    },
    {
      title: 'Evidence Synthesis & Systematic Literature Reviews',
      description:
        'Conducting PRISMA-compliant systematic reviews, bibliometric network mapping, and evidence synthesis across interdisciplinary scientific repositories.',
    },
    {
      title: 'Controlled Experimental Design & Behavioral Analytics',
      description:
        'Formulating factorial interventions, choice architecture, and field experiments to identify causal mechanisms in digital and physical environments.',
    },
    {
      title: 'Immersive Technologies & Visual Cognitive Analytics',
      description:
        'Utilizing 3D virtual environments and high-frequency eye-tracking telemetry to measure visual attention, fixation sequences, and decision heuristics.',
    },
    {
      title: 'Open Science, Reproducibility & Data Stewardship',
      description:
        'Advancing FAIR data principles, containerized analytical execution, and transparent open-access scientific dissemination.',
    },
  ],
  currentEnvironment: [
    {
      institution: 'University of Parma (Italy)',
      role: 'MSCA PhD Fellow — FutureData4EU',
      details:
        'Conducting doctoral research across the Department of Food and Drug and Department of Economics and Management, advancing data-driven consumer and computational models.',
    },
    {
      institution: 'CITA (Centro de Investigación y Tecnología Agroalimentaria de Aragón), Zaragoza (Spain)',
      role: 'Visiting Research Period',
      details:
        'Collaborative research exchange focusing on consumer economics, discrete choice experiments, and empirical decision models.',
    },
  ],
  previousExperience: [
    {
      institution: 'CIHEAM Mediterranean Agronomic Institute of Chania (MAICh), Greece',
      project: 'Sustainable Agri-Food Systems',
      period: '2021–2023',
      focus:
        'Research on quantitative data analysis, socio-economic modeling, and value chain development.',
    },
  ],
  technicalExpertise: [
    {
      category: 'Programming & Data Engineering',
      skills: ['Python', 'Pandas / NumPy', 'SQL / PostgreSQL', 'DuckDB', 'Playwright', 'Git'],
    },
    {
      category: 'Statistical & Econometric Analysis',
      skills: ['R (lme4, mlogit)', 'Difference-in-Differences', 'Discrete Choice Modeling', 'SPSS', 'VOSviewer'],
    },
    {
      category: 'Experimental & Immersive Tech',
      skills: ['Virtual Reality (HTC Vive Pro Eye, Meta)', 'Eye Tracking (Tobii)', 'Unity 3D', 'Qualtrics'],
    },
    {
      category: 'Scientific Domains',
      skills: ['Data Science', 'Behavioural Modeling', 'Evidence Synthesis', 'Experimental Design', 'Open Science'],
    },
  ],
  verifiedLinks: [
    {
      label: 'University Profile',
      handle: 'University of Parma Directory',
      url: 'https://personale.unipr.it/en/ugovdocenti/person/270639',
      available: true,
    },
    {
      label: 'ORCID',
      handle: '0009-0004-9407-7815',
      url: 'https://orcid.org/0009-0004-9407-7815',
      available: true,
    },
    {
      label: 'Google Scholar',
      handle: 'Amine Zouaghi',
      url: 'https://scholar.google.com/citations?user=KeVyb90AAAAJ&hl=en',
      available: true,
    },
    {
      label: 'ResearchGate',
      handle: 'Amine-Zouaghi',
      url: 'https://www.researchgate.net/profile/Amine-Zouaghi',
      available: true,
    },
    {
      label: 'LinkedIn',
      handle: 'amine-zouaghi',
      url: 'https://www.linkedin.com/in/zouaghi-amine/',
      available: true,
    },
    {
      label: 'Institutional Email',
      handle: 'amine.zouaghi@unipr.it',
      url: 'mailto:amine.zouaghi@unipr.it',
      available: true,
    },
  ],
};
