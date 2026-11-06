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
    title: 'Big Data Analytics',
    category: 'COMPUTATIONAL CONSUMER SCIENCE',
    associatedTechniques: [
      'Scanner data analysis',
      'Loyalty card telemetry',
      'Passive digital footprints',
      'Web scraping & Crawl4AI',
    ],
    scientificApplications:
      'Leverages high-frequency transactional point-of-sale streams and store loyalty cards to observe continuous, longitudinal consumer grocery purchases without survey recall fatigue or social desirability bias.',
    workflow: [
      'Raw barcode & receipt ingest from retail partners',
      'Entity linkage to national nutrient and carbon composition databases',
      'Filtering seasonal noise and price promotion confounding',
      'Time-series trajectory modeling for dietary transitions',
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
      'Thematic synthesis',
      'Risk of bias assessment',
    ],
    scientificApplications:
      'Produces exhaustive, reproducible syntheses of emergent interdisciplinary scientific domains at the intersection of computational data science and nutritional consumer behavior.',
    workflow: [
      'Protocol registration & search string formulation',
      'Multi-database harvesting (Scopus, WoS, PubMed)',
      'Blind multi-reviewer screening & conflict resolution',
      'Extraction matrix & bibliometric network modeling',
    ],
    tools: ['VOSviewer', 'Bibliometrix', 'Rayyan', 'Python NLP'],
    associatedResearchIds: [],
  },
  {
    id: 'method-03',
    title: 'Behavioural Science & Nudging',
    category: 'BEHAVIOURAL ECONOMICS',
    associatedTechniques: [
      'Field experiments',
      'Shelf-availability manipulation',
      'Symbolic point incentives',
      'Choice architecture',
    ],
    scientificApplications:
      'Evaluates low-cost, non-coercive environmental modifications that facilitate healthier and more sustainable consumer food choices in real-world retail settings, especially solidarity supermarkets.',
    workflow: [
      'Baseline purchasing pattern audit via barcode scanners',
      'Factorial intervention design (e.g., availability vs incentives)',
      'In-store deployment with unobtrusive logging',
      'Post-washout observation to test durable habit formation',
    ],
    tools: ['R', 'Difference-in-Differences Econometrics', 'Qualtrics'],
    associatedResearchIds: [],
  },
  {
    id: 'method-04',
    title: 'Immersive Technologies (VR & Eye Tracking)',
    category: 'CONSUMER NEUROSCIENCE',
    associatedTechniques: [
      'Virtual Reality 3D supermarkets',
      'High-frequency eye tracking (120Hz)',
      'Fixation duration & sequence analysis',
      'Areas of Interest (AOI) heatmapping',
    ],
    scientificApplications:
      'Uncovers the subconscious visual attention mechanisms that govern front-of-pack label processing and food choice deliberation before conscious verbalization occurs.',
    workflow: [
      'Photorealistic 3D retail environment modeling in Unity',
      'Binocular gaze calibration and parallax validation',
      'Automated AOI detection on packaging and shelf levels',
      'Multi-modal correlation of gaze fixations with purchase decisions',
    ],
    tools: ['Unity 3D', 'HTC Vive Pro Eye', 'Tobii Pro', 'Python (SciPy)'],
    associatedResearchIds: [],
  },
  {
    id: 'method-05',
    title: 'Data Science & Automated Web Scraping',
    category: 'DATA ENGINEERING & SCRAPING',
    associatedTechniques: [
      'Crawl4AI asynchronous scraping',
      'Schema normalization',
      'Dynamic JS rendering bypass',
      'Relational modeling',
    ],
    scientificApplications:
      'Builds comprehensive, reliable scientific databases from heterogeneous online registries (such as European Commission eAmbrosia and EUIPO databases) for agro-food policy analysis.',
    workflow: [
      'Target registry structure audit and endpoint discovery',
      'Asynchronous crawler deployment with rate-limiting and error recovery',
      'Data cleaning, deduplication, and entity resolution',
      'Export to relational SQL and geospatial Parquet formats',
    ],
    tools: ['Crawl4AI', 'Playwright', 'PostgreSQL', 'DuckDB', 'BeautifulSoup'],
    associatedResearchIds: [],
  },
  {
    id: 'method-06',
    title: 'Geospatial & Geographical Indications Research',
    category: 'FOOD HERITAGE & GIS',
    associatedTechniques: [
      'GIS boundary polygon matching',
      'Terroir spatial distribution analysis',
      'PDO/PGI verification audits',
      'Regional supply chain mapping',
    ],
    scientificApplications:
      'Structures the spatial and legal footprints of European Geographical Indications, analyzing the territorial distribution, heritage protection, and economic resilience of localized food systems.',
    workflow: [
      'Harvesting legal municipal specifications from EU gazettes',
      'Mapping administrative boundaries with NUTS / LAU coordinates',
      'Spatial correlation with agro-climatic conditions and biodiversity',
      'Public dashboard and policy visualization generation',
    ],
    tools: ['QGIS', 'GeoPandas', 'Shapely', 'Leaflet / Mapbox'],
    associatedResearchIds: [],
  },
  {
    id: 'method-07',
    title: 'Agro-Biodiversity & Value Chain Analysis',
    category: 'SUSTAINABLE AGRI-FOOD SYSTEMS',
    associatedTechniques: [
      'Value chain mapping',
      'Sensory and hedonic product evaluation',
      'Multi-stakeholder workshops',
      'Socio-economic impact modeling',
    ],
    scientificApplications:
      'Investigates the complete path from farm to fork for neglected and climate-resilient crop varieties (legumes, ancient grains), resolving processing bottlenecks and consumer acceptance barriers.',
    workflow: [
      'Agronomic field trial data integration',
      'Stakeholder interviews along processing and logistics chains',
      'Consumer hedonic sensory testing of reformulated staple foods',
      'Synthesis of regional policy recommendations for agricultural subsidies',
    ],
    tools: ['SPSS', 'R', 'Value Chain Matrix Analysis', 'Sensory Profiling'],
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
      title: 'Sustainable Food Systems & Consumption',
      description:
        'Investigating the socio-economic determinants of healthy and sustainable dietary transitions, focusing on planetary-health diets, whole grains, and agrobiodiversity.',
    },
    {
      title: 'Consumer Behaviour & Behavioural Economics',
      description:
        'Applying nudging interventions, field experimentation, and choice architecture in physical retail (such as solidarity social supermarkets) and digital e-grocery stores.',
    },
    {
      title: 'Big Data Analytics & Consumer Trend Mapping',
      description:
        'Harnessing transactional POS scanner streams, loyalty card logs, and computational web scraping to detect longitudinal food purchasing patterns without self-reporting biases.',
    },
    {
      title: 'Immersive Technologies & Consumer Neuroscience',
      description:
        'Utilizing photorealistic Virtual Reality and high-frequency head-mounted eye-tracking to capture unconscious visual attention, gaze fixation, and decision heuristics in food environments.',
    },
    {
      title: 'Geographical Indications & Food Heritage',
      description:
        'Structuring pan-European databases of PDO and PGI certifications, evaluating digital transparency tools, and fostering sustainable value chain resilience.',
    },
  ],
  currentEnvironment: [
    {
      institution: 'University of Parma (Italy)',
      role: 'MSCA PhD Fellow — FutureData4EU',
      details:
        'Conducting doctoral research across the Department of Food and Drug and Department of Economics and Management, advancing data-driven consumer food models.',
    },
    {
      institution: 'CITA (Centro de Investigación y Tecnología Agroalimentaria de Aragón), Zaragoza (Spain)',
      role: 'Visiting Research Period',
      details:
        'Collaborative research exchange focusing on consumer economics, discrete choice experiments, and sustainable agricultural value chains in the Mediterranean basin.',
    },
  ],
  previousExperience: [
    {
      institution: 'CIHEAM Mediterranean Agronomic Institute of Chania (MAICh), Greece',
      project: 'Sustainable Agri-Food Systems',
      period: '2021–2023',
      focus:
        'Research on sustainable agricultural value chains, biodiversity preservation, and socio-economic value chain development for climate-resilient agriculture.',
    },
  ],
  technicalExpertise: [
    {
      category: 'Programming & Data Engineering',
      skills: ['Python', 'Crawl4AI', 'Pandas / NumPy', 'SQL / PostgreSQL', 'DuckDB', 'Playwright', 'Git'],
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
      skills: ['Food Systems', 'Behavioural Economics', 'Geographical Indications', 'Agrobiodiversity', 'PRISMA Reviews'],
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
