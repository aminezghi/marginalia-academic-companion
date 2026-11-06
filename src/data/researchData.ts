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
    id: 'col-slr',
    name: 'Systematic Literature Review',
    description: 'Evidence synthesis on big data and dietary consumer choices (PRISMA).',
    color: '#1F3FB0',
  },
  {
    id: 'col-bigdata',
    name: 'Big Data & Retail Telemetry',
    description: 'Point-of-sale scanner receipts, loyalty card logs, and web scraping.',
    color: '#2563EB',
  },
  {
    id: 'col-nudging',
    name: 'Behavioural Nudging & Solidarity Markets',
    description: 'Choice architecture and experimental interventions in social supermarkets.',
    color: '#536B52',
  },
  {
    id: 'col-gi',
    name: 'Geographical Indications & Food Heritage',
    description: 'European PDO/PGI registries, Crawl4AI databases, and terroir innovation.',
    color: '#7C3AED',
  },
  {
    id: 'col-vr',
    name: 'Immersive VR & Eye Tracking',
    description: 'Consumer neuroscience and visual attention in 3D grocery environments.',
    color: '#D97706',
  },
  {
    id: 'col-thesis',
    name: 'PhD Thesis Core Literature',
    description: 'Primary citations and theoretical frameworks for the FutureData4EU doctoral thesis.',
    color: '#0D9488',
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

export const INITIAL_RESEARCH_ITEMS: ResearchItem[] = [
  {
    id: 'item-v01',
    number: '01',
    title: 'Planetary Health & Sustainable Diets in Mediterranean Food Systems',
    shortTitle: 'Sustainable Diets',
    authors: ['Elena Castellini', 'Amine Zouaghi', 'Marco Setti'],
    year: '2019',
    journal: 'Global Food Security',
    doi: '10.1016/j.gfs.2019.100342',
    type: 'Systematic Review',
    status: 'Published archive',
    readingStatus: 'completed',
    readingProgress: {
      currentPage: 24,
      totalPages: 24,
      percent: 100,
      totalReadingTimeMinutes: 85,
      lastReadAt: '2026-09-12T10:00:00Z',
    },
    evaluation: {
      importance: 'high',
      relevance: 'high',
      rating: 5,
      priority: 'medium',
    },
    field: 'Sustainable Food Systems & Nutrition',
    category: 'FOOD SYSTEMS',
    secondaryCategories: ['BIODIVERSITY', 'CONSUMER BEHAVIOUR'],
    collectionIds: ['col-slr', 'col-thesis'],
    tags: ['Planetary Health', 'Mediterranean Diet', 'Carbon Footprint', 'Sustainable Diets'],
    institution: 'University of Parma',
    topics: ['Planetary health boundaries', 'Mediterranean dietary adherence', 'Lifecycle environmental footprints'],
    methods: ['Systematic Literature Review', 'Meta-analytical dietary footprint synthesis'],
    tools: ['R', 'OpenLCA', 'PRISMA framework'],
    focus: 'Evaluating the nutritional adequacy and environmental footprint of Mediterranean plant-forward dietary transitions.',
    abstract: 'Transitioning toward sustainable dietary patterns requires reconciling nutritional sufficiency with cultural food heritage and environmental boundaries. This review synthesizes longitudinal evidence across Mediterranean food systems.',
    objectives: [
      'Quantify greenhouse gas and water footprint reductions associated with plant-forward Mediterranean diets.',
      'Identify socio-demographic barriers to sustainable dietary adherence.',
    ],
    researchQuestions: [
      'How do regional Mediterranean dietary shifts impact household food expenditure and carbon intensity?',
    ],
    keyFindings: [
      'Adherence to traditional Mediterranean legume-and-grain proportions lowers household dietary carbon footprints by 29%.',
    ],
    contributions: [
      'Integrated multi-indicator sustainability matrix for Mediterranean food baskets.',
    ],
    spineAccent: '#234233',
    coverPalette: {
      bg: '#EDEBE6',
      text: '#141414',
      accent: '#234233',
      motif: 'biovalue-agro',
    },
    bookAppearance: {
      spineTitle: 'SUSTAINABLE DIETS',
      typeCode: 'REV',
      spineEmblem: 'wheat',
      customSpineColor: '#D5CBB8',
      customCoverStyle: 'botanical',
      customMaterial: 'aged_paper',
      customSize: 'standard',
    },
    visualMaterial: {
      type: 'literature-map',
      title: 'Planetary Health Dietary Footprint Synthesis',
      caption: 'Comparative environmental impact across dietary transition cohorts.',
      metrics: [
        { label: 'Carbon Delta', value: '-29%', detail: 'Household basket emissions' },
        { label: 'Cohort Studies', value: '64', detail: 'Mediterranean basin' },
      ],
    },
    resources: [
      { label: 'Copy BibTeX Citation Reference', actionType: 'copy-citation', available: true },
    ],
  },
  {
    id: 'item-v02',
    number: '02',
    title: 'Behavioural Determinants of Sustainable Consumer Choice in Grocery Retail',
    shortTitle: 'Consumer Choice',
    authors: ['Davide Menozzi', 'Cristina Mora', 'Amine Zouaghi'],
    year: '2020',
    journal: 'Appetite',
    doi: '10.1016/j.appet.2020.104819',
    type: 'Empirical Research',
    status: 'Published archive',
    readingStatus: 'completed',
    readingProgress: {
      currentPage: 20,
      totalPages: 20,
      percent: 100,
      totalReadingTimeMinutes: 65,
    },
    evaluation: {
      importance: 'high',
      relevance: 'high',
      rating: 4,
      priority: 'medium',
    },
    field: 'Consumer Behaviour & Behavioural Economics',
    category: 'CONSUMER BEHAVIOUR',
    secondaryCategories: ['FOOD SYSTEMS'],
    collectionIds: ['col-nudging', 'col-thesis'],
    tags: ['Consumer Choice', 'Heuristic Decision', 'Eco-Labels', 'WTP'],
    institution: 'University of Parma',
    topics: ['Point-of-purchase heuristics', 'Eco-label credibility', 'Habit vs intention gap'],
    methods: ['Structural equation modeling', 'In-store intercept survey', 'Discrete choice modeling'],
    tools: ['R (lavaan)', 'Stata', 'Qualtrics'],
    focus: 'Deconstructing the attitude-behaviour gap in sustainable grocery purchasing decisions.',
    abstract: 'While consumers frequently report strong pro-environmental intentions, point-of-sale grocery selections remain dominated by price, habit, and sensory expectations. This empirical study models the moderating role of label trust and time pressure.',
    objectives: [
      'Measure the elasticity of eco-certified food selection under varying retail time constraints.',
    ],
    researchQuestions: [
      'Why do stated sustainability preferences diverge from observed retail checkout baskets?',
    ],
    keyFindings: [
      'Habit strength and perceived price premiums account for 62% of the variance in the green attitude-behaviour gap.',
    ],
    contributions: [
      'Empirical behavioral model isolating habitual vs reflective grocery pathways.',
    ],
    spineAccent: '#742421',
    coverPalette: {
      bg: '#EDEBE6',
      text: '#141414',
      accent: '#742421',
      motif: 'creda-consortium',
    },
    bookAppearance: {
      spineTitle: 'CONSUMER CHOICE',
      typeCode: 'EMP',
      spineEmblem: 'basket',
      customSpineColor: '#742421',
      customCoverStyle: 'cloth',
      customMaterial: 'cloth',
      customSize: 'standard',
    },
    visualMaterial: {
      type: 'nudging-experiment',
      title: 'Attitude-Behaviour Gap Structural Model',
      caption: 'Path coefficients linking environmental attitude, habit friction, and basket choice.',
      metrics: [
        { label: 'Sample Size', value: 'N = 840', detail: 'Retail grocery shoppers' },
        { label: 'Variance Explained', value: '62.4%', detail: 'SEM model fit' },
      ],
    },
    resources: [
      { label: 'Copy BibTeX Citation Reference', actionType: 'copy-citation', available: true },
    ],
  },
  {
    id: 'item-v03',
    number: '03',
    title: 'Architecture of Physical and Digital Food Environments: A Policy Review',
    shortTitle: 'Food Environments',
    authors: ['Sofia Menozzi', 'Amine Zouaghi', 'Filippo Arfini'],
    year: '2021',
    journal: 'Food Policy',
    doi: '10.1016/j.foodpol.2021.102114',
    type: 'Systematic Review',
    status: 'Published archive',
    readingStatus: 'completed',
    readingProgress: {
      currentPage: 30,
      totalPages: 30,
      percent: 100,
      totalReadingTimeMinutes: 90,
    },
    evaluation: {
      importance: 'high',
      relevance: 'high',
      rating: 5,
      priority: 'high',
    },
    field: 'Food Environments & Public Policy',
    category: 'FOOD SYSTEMS',
    secondaryCategories: ['DIGITAL INNOVATION'],
    collectionIds: ['col-slr', 'col-thesis'],
    tags: ['Food Environments', 'Retail Architecture', 'Food Policy'],
    institution: 'University of Parma',
    topics: ['External vs personal food environments', 'Spatial food access', 'Retail shelf governance'],
    methods: ['Scoping review', 'Policy taxonomy synthesis'],
    tools: ['NVivo', 'QGIS', 'Bibliometrix'],
    focus: 'Mapping how structural food environment dimensions shape dietary equity and sustainability across urban and rural regions.',
    abstract: 'Food choices never occur in a vacuum; they are bounded by physical availability, pricing structures, promotional salience, and spatial accessibility. This review establishes a spatial-behavioral framework for evaluating food environments.',
    objectives: [
      'Synthesize structural indicators of healthy and sustainable retail food environments.',
    ],
    researchQuestions: [
      'How do physical store layouts interact with neighborhood socio-economic stratigraphy?',
    ],
    keyFindings: [
      'Shelf prominence and end-aisle positioning exert 2.8x greater influence on impulse food selection than back-of-pack nutrition tables.',
    ],
    contributions: [
      'Multi-layered taxonomy of external and personal food environment determinants.',
    ],
    spineAccent: '#203E5F',
    coverPalette: {
      bg: '#EDEBE6',
      text: '#141414',
      accent: '#203E5F',
      motif: 'gi-smart-map',
    },
    bookAppearance: {
      spineTitle: 'FOOD ENVIRONMENTS',
      typeCode: 'REV',
      spineEmblem: 'landscape',
      customSpineColor: '#203E5F',
      customCoverStyle: 'archival',
      customMaterial: 'cloth',
      customSize: 'standard',
    },
    visualMaterial: {
      type: 'gi-map',
      title: 'Food Environment Typology & Retail Prominence',
      caption: 'Interaction between external retail supply architecture and household dietary quality.',
      metrics: [
        { label: 'Policy Domains', value: '5 Pillars', detail: 'Availability, Price, Info, Access, Salience' },
        { label: 'Salience Lift', value: '2.8×', detail: 'End-aisle vs standard shelf' },
      ],
    },
    resources: [
      { label: 'Copy BibTeX Citation Reference', actionType: 'copy-citation', available: true },
    ],
  },
  {
    id: 'item-v04',
    number: '04',
    title: 'Choice Architecture & Cognitive Nudging in Sustainable Food Procurement',
    shortTitle: 'Nudging & Behaviour',
    authors: ['Amine Zouaghi', 'Davide Menozzi'],
    year: '2022',
    journal: 'Journal of Behavioral and Experimental Economics',
    doi: '10.1016/j.socec.2022.101912',
    type: 'Experimental Research',
    status: 'Published archive',
    readingStatus: 'completed',
    readingProgress: {
      currentPage: 22,
      totalPages: 22,
      percent: 100,
      totalReadingTimeMinutes: 70,
    },
    evaluation: {
      importance: 'high',
      relevance: 'high',
      rating: 5,
      priority: 'high',
    },
    field: 'Behavioural Economics & Choice Architecture',
    category: 'CONSUMER BEHAVIOUR',
    secondaryCategories: ['FOOD SYSTEMS'],
    collectionIds: ['col-nudging', 'col-thesis'],
    tags: ['Nudging', 'Choice Architecture', 'Default Options', 'Salience'],
    institution: 'University of Parma',
    topics: ['Type 1 vs Type 2 cognitive processing', 'Default nudges', 'Dynamic social norms'],
    methods: ['Randomized controlled laboratory experiment', 'Mixed-effects logistic regression'],
    tools: ['R (lme4)', 'z-Tree', 'Python'],
    focus: 'Testing cognitive friction, default positioning, and dynamic social norm cues in sustainable food selection.',
    abstract: 'Behavioural nudges alter the choice environment without forbidding options or significantly changing economic incentives. This experimental study compares default pre-selection, salience enhancements, and dynamic descriptive norms.',
    objectives: [
      'Compare effect sizes of structural default nudges versus informational eco-labeling.',
    ],
    researchQuestions: [
      'Which nudge typology yields the lowest psychological reactance among habitual meat consumers?',
    ],
    keyFindings: [
      'Structural positioning and default bundling outperform purely informational eco-labels by +41% in low-deliberation shopping tasks.',
    ],
    contributions: [
      'Comparative taxonomy of cognitive vs structural nudges in food retail.',
    ],
    spineAccent: '#4B3628',
    coverPalette: {
      bg: '#EDEBE6',
      text: '#141414',
      accent: '#4B3628',
      motif: 'nudging-matrix',
    },
    bookAppearance: {
      spineTitle: 'NUDGING & BEHAVIOUR',
      typeCode: 'EXP',
      spineEmblem: 'compass',
      customSpineColor: '#CBBFA8',
      customCoverStyle: 'journal',
      customMaterial: 'aged_paper',
      customSize: 'slim',
    },
    visualMaterial: {
      type: 'nudging-experiment',
      title: 'Cognitive vs Structural Nudge Effect Sizes',
      caption: 'Experimental comparison across 4 choice-architecture conditions.',
      metrics: [
        { label: 'Default Effect', value: '+41.0%', detail: 'vs Information-only control' },
        { label: 'Reactance Score', value: 'Low (1.8/7)', detail: 'Preserved autonomy' },
      ],
    },
    resources: [
      { label: 'Copy BibTeX Citation Reference', actionType: 'copy-citation', available: true },
    ],
  },
  {
    id: 'item-01',
    number: '05',
    title: 'Mapping Consumer Trends for Healthy and Sustainable Food Choices',
    shortTitle: 'Mapping Consumer Trends',
    authors: ['Amine Zouaghi', 'Elena Castellini', 'Mario Rossi'],
    year: '2026',
    journal: 'Journal of Cleaner Production (In Prep)',
    doi: '10.1016/j.jclepro.2026.104821',
    type: 'Systematic Review',
    status: 'Manuscript prepared for submission',
    readingStatus: 'reading',
    readingProgress: {
      currentPage: 16,
      totalPages: 32,
      percent: 50,
      totalReadingTimeMinutes: 75,
      lastReadAt: '2026-11-01T15:30:00Z',
    },
    evaluation: {
      importance: 'high',
      relevance: 'high',
      rating: 5,
      priority: 'high',
    },
    field: 'Big Data · Consumer Behaviour · Sustainable Diets',
    category: 'BIG DATA',
    secondaryCategories: ['FOOD SYSTEMS', 'CONSUMER BEHAVIOUR'],
    collectionIds: ['col-slr', 'col-bigdata', 'col-thesis'],
    tags: ['PRISMA', 'Scanner Data', 'Loyalty Cards', 'Plant-based'],
    institution: 'University of Parma',
    topics: [
      'Scanner data',
      'Loyalty card telemetry',
      'Wearable & sensor streams',
      'Consumer dietary trends',
      'Food purchasing dynamics',
    ],
    methods: [
      'Systematic Literature Review (PRISMA guidelines)',
      'Bibliometric co-occurrence analysis',
      'Thematic synthesis',
      'Corpus textual mining',
    ],
    tools: ['Python', 'VOSviewer', 'Bibliometrix', 'Scopus / Web of Science API'],
    dataSources: 'Multi-database scientific literature corpus (Scopus, Web of Science, PubMed)',
    sample: '142 peer-reviewed articles synthesized across 2014–2025',
    focus:
      'Understanding how novel big data sources (scanner receipts, retail loyalty logs, wearable metrics) identify longitudinal dietary habits and guide actionable behavioral interventions toward healthier and environmentally sustainable consumption.',
    abstract:
      'The accelerating digitization of grocery retail and personal health tracking generates unprecedented granular behavioral streams. This systematic review synthesizes methodological paradigms across retail scanner datasets, loyalty telemetry, and consumer sensor logs. We identify critical predictive indicators that differentiate transient consumer fads from enduring structural transitions toward plant-forward and low-carbon dietary choices, articulating an empirical framework for evidence-based nutritional policy.',
    objectives: [
      'Synthesize peer-reviewed methodologies utilizing big data architectures in consumer food decision analysis.',
      'Categorize data modalities (transactional, sensorial, passive digital footprints) by predictive validity for sustainable choice.',
      'Identify methodological bottlenecks in data linkage, sample representativeness, and ethical consumer governance.',
      'Construct a unified taxonomy bridging computational data science and nutritional behavioural economics.',
    ],
    researchQuestions: [
      'How reliably do passive transactional records (scanner/loyalty data) mirror actual household nutritional quality?',
      'Which algorithmic pattern-recognition approaches best isolate deliberate sustainable substitutions from price-driven noise?',
      'What ethical data-protection boundaries govern public-private retail research partnerships?',
    ],
    keyFindings: [
      'Transactional scanner datasets demonstrate 3.4× higher fidelity in tracking repeat plant-based meat alternative adoptions compared to retrospective self-reported surveys.',
      'Loyalty card basket analysis reveals marked socioeconomic polarization in organic product responsiveness following inflation shocks.',
      'Thematic synthesis demonstrates an emerging paradigm shift from static cross-sectional consumer profiles to dynamic time-series basket trajectory modeling.',
    ],
    contributions: [
      'First comprehensive methodological synthesis of granular retail transactional datasets applied strictly to planetary-health dietary boundaries.',
      'PRISMA-compliant multi-tier classification matrix for computational consumer food research.',
      'Validated protocol for reconciling high-frequency retail churn with epidemiological nutritional indexes.',
    ],
    collaborators: [
      'Department of Food and Drug, University of Parma',
      'FutureData4EU Doctoral Consortium',
    ],
    spineAccent: '#1F3FB0',
    coverPalette: {
      bg: '#141414',
      text: '#EDEBE6',
      accent: '#3B82F6',
      motif: 'bibliometric-network',
    },
    visualMaterial: {
      type: 'literature-map',
      title: 'PRISMA Corpus & Thematic Co-Occurrence Architecture',
      caption:
        'Methodological funnel mapping 2,180 initial records to 142 synthesized studies across transactional and sensor modalities.',
      metrics: [
        { label: 'Synthesized Studies', value: '142', detail: 'Peer-reviewed 2014–2025' },
        { label: 'Corpus Coverage', value: '3 Databases', detail: 'Scopus, WoS, PubMed' },
        { label: 'Data Paradigms', value: '4 Streams', detail: 'POS, Loyalty, Wearable, Search' },
        { label: 'Intervention Index', value: '78.4%', detail: 'Predictive alignment' },
      ],
    },
    resources: [
      {
        label: 'Request Working Paper & Methodology Protocol',
        actionType: 'request-preprint',
        available: true,
        meta: 'Prepared for journal submission',
      },
      {
        label: 'Download PRISMA Extraction Schema (Summary)',
        actionType: 'download-summary',
        available: true,
        meta: 'PDF format · Data extraction variables',
      },
      {
        label: 'Copy BibTeX Citation Reference',
        actionType: 'copy-citation',
        available: true,
        meta: 'Zouaghi, A. et al. (2025)',
      },
    ],
    pdfFileName: 'Zouaghi_2025_BigData_ConsumerTrends.pdf',
    pdfContentText: `1. INTRODUCTION & THEORETICAL FOUNDATIONS
The accelerating digitization of grocery retail and personal health tracking generates unprecedented granular behavioral streams. Unlike traditional survey recall instruments that suffer from severe retrospective inaccuracy and social desirability biases, continuous point-of-sale barcode logs provide unmediated observations of household procurement.

2. SYSTEMATIC SEARCH STRATEGY (PRISMA 2020)
We harvested 2,180 initial records across Scopus, Web of Science, and PubMed using Boolean strings uniting computational terminology ("scanner data", "loyalty telemetry", "transactional logs") with sustainable food keywords ("dietary transition", "organic", "plant-based alternatives", "carbon footprint"). After duplicate removal and blind two-reviewer screening, 142 empirical studies were retained for detailed evidence synthesis.

3. DATA MODALITIES & PREDICTIVE FIDELITY
Transactional scanner datasets demonstrate 3.4x higher fidelity in tracking repeat plant-based meat alternative adoptions compared to survey recall. Loyalty card basket analysis reveals marked socioeconomic polarization in organic product responsiveness following macro-economic inflation shocks.

4. METHODOLOGICAL BOTTLENECKS
Primary obstacles include data linkage with national nutrient databases and non-probabilistic loyalty card sampling bias. Reconciling high-frequency retail churn with epidemiological nutritional indexes requires standardized multi-tier normalization schemas.`,
  },
  {
    id: 'item-02',
    number: '02',
    title: 'Digital Technologies and Consumer Interactions in Food Environments',
    shortTitle: 'Digital Food Interactions',
    authors: ['Amine Zouaghi', 'Sofia Menozzi'],
    year: '2025',
    journal: 'Appetite (Under Review)',
    doi: '10.1016/j.appet.2025.107294',
    type: 'State-of-the-Art Review',
    status: 'Manuscript prepared for submission',
    readingStatus: 'reading',
    readingProgress: {
      currentPage: 8,
      totalPages: 22,
      percent: 36,
      totalReadingTimeMinutes: 40,
      lastReadAt: '2026-10-30T11:20:00Z',
    },
    evaluation: {
      importance: 'high',
      relevance: 'medium',
      rating: 4,
      priority: 'high',
    },
    field: 'Digital Food Environments',
    category: 'DIGITAL INNOVATION',
    secondaryCategories: ['CONSUMER BEHAVIOUR', 'FOOD SYSTEMS'],
    collectionIds: ['col-bigdata', 'col-thesis'],
    tags: ['e-Grocery', 'Choice Architecture', 'Algorithmic Nudges'],
    institution: 'University of Parma',
    topics: [
      'Digital grocery interfaces',
      'Smart labeling & QR transparency',
      'Algorithmic decision-support',
      'E-commerce consumer choice architecture',
      'Food environment digitization',
    ],
    methods: [
      'State-of-the-art literature synthesis',
      'Conceptual framework formulation',
      'Research agenda roadmapping',
    ],
    tools: ['Qualitative comparative matrix', 'Conceptual systems modeling'],
    dataSources: 'Multidisciplinary peer-reviewed literature across HCI, marketing, and food policy',
    focus:
      'Understanding how digital interfaces, mobile food shopping environments, and immersive technologies fundamentally reshape human perception, cognitive friction, and choice architecture during food procurement.',
    abstract:
      'As grocery retail migrates to hybrid omnichannel platforms, the micro-moments of food choice are increasingly mediated through screens, recommendation algorithms, and automated filters. This state-of-the-art review deconstructs the cognitive affordances of digital food environments, evaluating how visual ranking algorithms, automated basket-fillers, and eco-label positioning alter deliberation times and sustainability tradeoffs.',
    objectives: [
      'Delineate the physical vs digital decision environment divide in food procurement.',
      'Critique default algorithmic sorting mechanisms regarding their unintentional nutritional and carbon bias.',
      'Propose a human-centered digital food choice model prioritizing long-term planetary health.',
    ],
    researchQuestions: [
      'In what ways do frictionless mobile checkouts suppress conscious deliberation on eco-labels?',
      'How can algorithmic default options be re-engineered into ethical sustainable nudges without eroding perceived consumer autonomy?',
    ],
    keyFindings: [
      'Default sorting by "Popularity" in online grocery portals reduces consumer exposure to certified organic and regenerative alternatives by over 46%.',
      'Interactive carbon-footprint tooltips with contextual equivalence (e.g., vehicle km saved) demonstrate 2.1× higher retention than static numeric gram indicators.',
      'Mobile interface constraints amplify heuristic shortcutting, making visual prominent badges significantly more decisive than deep-scroll nutritional tables.',
    ],
    contributions: [
      'Unified Conceptual Taxonomy of Digital Food Environment Touchpoints.',
      'Actionable policy guidelines for algorithmic transparency in retail e-grocery platforms.',
      'Strategic research agenda pinpointing empirical gaps across generational consumer cohorts.',
    ],
    collaborators: [
      'Department of Food and Drug, University of Parma',
      'Inter-institutional Food Policy Working Group',
    ],
    spineAccent: '#2563EB',
    coverPalette: {
      bg: '#EDEBE6',
      text: '#141414',
      accent: '#1F3FB0',
      motif: 'digital-interaction',
    },
    visualMaterial: {
      type: 'digital-flow',
      title: 'Digital Choice Architecture & Cognitive Touchpoint Model',
      caption:
        'Taxonomy of digital touchpoints: algorithmic search defaults, micro-nutrition overlays, and frictionless payment friction.',
      metrics: [
        { label: 'Touchpoint Vectors', value: '6 Stages', detail: 'Browse to Checkout' },
        { label: 'Heuristic Drift', value: '+34%', detail: 'Mobile vs Desktop procurement' },
        { label: 'Default Impact', value: '46% Delta', detail: 'In sustainable exposure' },
      ],
    },
    resources: [
      {
        label: 'Request State-of-the-Art Review Manuscript',
        actionType: 'request-preprint',
        available: true,
      },
      {
        label: 'Copy BibTeX Citation Reference',
        actionType: 'copy-citation',
        available: true,
      },
    ],
    pdfFileName: 'Zouaghi_2025_DigitalFoodEnvironments.pdf',
    pdfContentText: `1. INTRODUCTION: THE RISE OF DIGITAL FOODSCAPES
Digital food procurement channels—spanning online supermarkets, quick-commerce dark stores, and meal delivery platforms—have fundamentally altered how consumers deliberate over dietary choices.

2. ALGORITHMIC SORTING & HEURISTIC SHORTCUTTING
In traditional supermarkets, shelf-placement negotiations dictate eye-level real estate. In algorithmic e-commerce environments, ranking algorithms govern the first screen fold. Default sorting by "Popularity" suppresses certified organic and low-carbon items by 46%.

3. INTERACTIVE CARBON FOOTPRINT VISUALIZATION
Presenting carbon metrics in raw grams fails to alter intent due to conceptual abstraction. Translating emissions into real-world equivalents (e.g., "equivalent to driving 4.2 km") increases retention and substitution propensity by 2.1x.`,
  },
  {
    id: 'item-03',
    number: '03',
    title: 'Encouraging Wholegrain Pasta Consumption Through Behavioural Nudging',
    shortTitle: 'Social Supermarkets Nudging Experiment',
    authors: ['Amine Zouaghi', 'Davide Menozzi', 'Cristina Mora'],
    year: '2025',
    journal: 'Food Quality and Preference',
    doi: '10.1016/j.foodqual.2025.105118',
    type: 'Experimental Research',
    status: 'Manuscript prepared for submission',
    readingStatus: 'completed',
    readingProgress: {
      currentPage: 28,
      totalPages: 28,
      percent: 100,
      totalReadingTimeMinutes: 95,
      lastReadAt: '2026-10-25T18:00:00Z',
    },
    evaluation: {
      importance: 'high',
      relevance: 'high',
      rating: 5,
      priority: 'high',
    },
    field: 'Behavioural Economics & Sustainable Consumption',
    category: 'CONSUMER BEHAVIOUR',
    secondaryCategories: ['FOOD SYSTEMS'],
    collectionIds: ['col-nudging', 'col-thesis'],
    tags: ['Field Experiment', 'Social Supermarket', 'Wholegrain', 'Nudging'],
    institution: 'University of Parma',
    topics: [
      'Behavioural nudging',
      'Wholegrain cereals',
      'Social supermarkets (solidarity retail)',
      'Availability interventions',
      'Point-based loyalty incentives',
      'Vulnerable consumer nutrition',
    ],
    methods: [
      'Controlled field experiment in real retail setting',
      'Point-of-sale transactional scanner analysis',
      'Pre- and post-intervention consumer survey',
      'Longitudinal purchase habit tracking',
    ],
    tools: ['R', 'Python (Pandas, Statsmodels)', 'Difference-in-Differences econometrics'],
    dataSources: 'Point-of-Sale barcode scanner records + structured questionnaires',
    sample: 'Approximately 200 participants followed across baseline, intervention, and post-intervention phases',
    focus:
      'Evaluating whether physical product availability adjustments (shelf ratio shifts) and non-monetary point-based loyalty rewards encourage durable wholegrain pasta purchases among patrons of social supermarkets in Italy.',
    abstract:
      'Social supermarkets provide essential food security while serving economically vulnerable demographics often excluded from conventional dietary intervention studies. This empirical field experiment investigates low-friction behavioral nudges targeting staple cereal selection. By manipulating physical shelf space ratios and implementing targeted bonus points in the solidarity loyalty ledger, we test both immediate substitution velocity and habit stickiness after incentive withdrawal.',
    objectives: [
      'Quantify the relative elasticities of shelf-availability nudges vs point-based symbolic incentives.',
      'Assess substitution dynamics between traditional refined durum wheat pasta and wholegrain alternatives.',
      'Examine habit formation: whether purchases remain elevated once active points promotions terminate.',
      'Provide evidence-based operational recommendations for managers of non-profit solidarity food markets.',
    ],
    researchQuestions: [
      'Does expanding the visible shelf share of wholegrain pasta from 20% to 50% elevate sales without consumer resistance?',
      'Can non-monetary symbolic loyalty points bridge unfamiliarity barriers with wholegrain textures?',
      'Do dietary improvements persist across a 4-week washout follow-up observation window?',
    ],
    keyFindings: [
      'Physical availability nudging (increasing shelf proportion to 50% at eye level) produced a statistically significant +38.2% relative increase in wholegrain selection.',
      'Combining availability with bonus solidarity points yielded the highest uptake (+54.6%), particularly among households with young children.',
      'During the 4-week post-incentive observation window, wholegrain pasta purchases retained a +21.4% elevation above historical baseline, substantiating genuine habit inception.',
    ],
    contributions: [
      'Pioneering field experimental data inside Italian solidarity retail networks.',
      'Empirical proof that non-punitive nudges effectively narrow dietary quality disparities without imposing economic penalty.',
      'Actionable toolkit for solidarity pantry managers balancing supply logistics with nutritional dignity.',
    ],
    collaborators: [
      'Solidarity Supermarket Operational Board',
      'University of Parma Behavioural Research Unit',
    ],
    spineAccent: '#536B52',
    coverPalette: {
      bg: '#EDEBE6',
      text: '#141414',
      accent: '#536B52',
      motif: 'nudging-matrix',
    },
    visualMaterial: {
      type: 'nudging-experiment',
      title: '2×2 Experimental Factorial Design & Longitudinal Trajectory',
      caption:
        'Controlled field deployment comparing Shelf Availability (20% vs 50%) and Point Incentives across ~200 participants.',
      metrics: [
        { label: 'Sample Cohort', value: '~200', detail: 'Solidarity retail patrons' },
        { label: 'Availability Effect', value: '+38.2%', detail: 'Relative uptake (p < 0.01)' },
        { label: 'Combined Intervention', value: '+54.6%', detail: 'Availability + Points' },
        { label: 'Post-Washout Habit', value: '+21.4%', detail: 'Persistent baseline lift' },
      ],
    },
    resources: [
      {
        label: 'View Field Experiment Design Protocol',
        actionType: 'download-summary',
        available: true,
      },
      {
        label: 'Copy BibTeX Citation Reference',
        actionType: 'copy-citation',
        available: true,
      },
    ],
    pdfFileName: 'Zouaghi_2025_Nudging_SocialSupermarkets.pdf',
    pdfContentText: `1. INTRODUCTION: SOLIDARITY RETAIL AS EXPERIMENTAL LIVING LAB
Solidarity grocery stores (Empori della Solidarietà) allocate staple foods using points-based monthly credit allowances rather than euros. This non-monetary currency setting isolates psychological choice architecture from price elasticities.

2. FACTORIAL INTERVENTION DESIGN
Participants (N=198) were assigned across four arms: Control (20% wholegrain shelf share, standard points), Availability Nudge (50% wholegrain shelf share), Incentive Nudge (+50 bonus points on wholegrain), and Combined Arm.

3. LONGITUDINAL FINDINGS
Availability restructuring alone achieved +38.2% relative gain. The combined intervention reached +54.6%. Crucially, following incentive withdrawal, a 4-week washout phase confirmed persistent +21.4% elevation, demonstrating durable habit formation.`,
  },
  {
    id: 'item-04',
    number: '04',
    title: 'Consumer Research and Digital Approaches for Sustainable Food Systems',
    shortTitle: 'CREDA Research Collaboration',
    authors: ['Amine Zouaghi', 'Zein Kallas', 'Chema Gil'],
    year: '2024',
    journal: 'Agribusiness & Food Economics Report',
    doi: '10.5281/zenodo.1084291',
    type: 'Research Project',
    status: 'Ongoing research',
    readingStatus: 'reading',
    readingProgress: {
      currentPage: 14,
      totalPages: 45,
      percent: 31,
      totalReadingTimeMinutes: 50,
      lastReadAt: '2026-10-28T09:15:00Z',
    },
    evaluation: {
      importance: 'medium',
      relevance: 'high',
      rating: 4,
      priority: 'medium',
    },
    field: 'Consumer Behaviour & Food Systems',
    category: 'RESEARCH PROJECTS',
    secondaryCategories: ['CONSUMER BEHAVIOUR', 'FOOD SYSTEMS'],
    collectionIds: ['col-bigdata', 'col-thesis'],
    tags: ['Discrete Choice', 'Mediterranean Food', 'WTP'],
    institution: 'CREDA-UPC-IRTA & Collaborating Centers',
    topics: [
      'Consumer trend modeling',
      'Food choice determinants',
      'Sustainable dietary transitions',
      'Digital methodologies in agro-food',
      'Mediterranean consumer behavior',
    ],
    methods: [
      'Discrete choice experiments',
      'Market scanner data econometrics',
      'Stakeholder participatory workshops',
      'Cross-national consumer surveying',
    ],
    tools: ['R Biogeme', 'Python', 'Qualtrics advanced logic', 'Spatial consumer profiling'],
    focus:
      'Research activities investigating consumer trends, food choices, and the drivers of sustainable food consumption through cutting-edge empirical and digital methodologies.',
    abstract:
      'In collaboration with specialized agro-food research bodies, this ongoing project investigates consumer responsiveness to sustainable food innovations across Southern Europe. By coupling discrete choice experiments with real transactional market observations, the research decodes how environmental attributes weigh against price sensitivity in fluctuating economic conditions.',
    objectives: [
      'Map consumer willingness-to-pay (WTP) for climate-resilient and biodiversity-positive food products.',
      'Harmonize psychometric attitude measurements with observed transactional grocery behaviors.',
      'Evaluate consumer trust mechanisms in third-party vs decentralized certification schemes.',
    ],
    researchQuestions: [
      'What pricing thresholds cause environmentally conscious consumers to compromise on sustainable food choices?',
      'How does consumer perception of "sustainability" vary between Mediterranean countries?',
    ],
    keyFindings: [
      'Preliminary discrete choice modeling indicates consumer valuation for local origin exceeds carbon claims by 1.7× in southern European fresh produce categories.',
      'Information transparency experiments reveal diminishing cognitive returns beyond three simultaneous sustainability labels.',
    ],
    contributions: [
      'Cross-validated experimental datasets capturing post-inflationary Mediterranean consumer priorities.',
      'Standardized discrete choice survey modules for regional agro-food researchers.',
    ],
    collaborators: [
      'CREDA (Center for Agro-Food Economy & Development)',
      'University of Parma',
      'Agro-food value chain stakeholders',
    ],
    spineAccent: '#1F3FB0',
    coverPalette: {
      bg: '#141414',
      text: '#EDEBE6',
      accent: '#60A5FA',
      motif: 'creda-consortium',
    },
    visualMaterial: {
      type: 'creda-roadmap',
      title: 'Multidisciplinary Consumer Roadmap & Methodology Matrix',
      caption:
        'Triangulation architecture uniting Discrete Choice modeling, Real POS data, and Cross-National Surveying.',
      metrics: [
        { label: 'Work Packages', value: '4 Pillars', detail: 'Trends, Experiments, Models, Policy' },
        { label: 'Survey Coverage', value: 'ES & IT', detail: 'Cross-Mediterranean focus' },
        { label: 'Research Status', value: 'Active', detail: '2024–Present timeline' },
      ],
    },
    resources: [
      {
        label: 'View Collaborative Project Overview',
        actionType: 'external-link',
        available: true,
      },
      {
        label: 'Copy BibTeX Reference',
        actionType: 'copy-citation',
        available: true,
      },
    ],
    pdfFileName: 'CREDA_2024_SustainableAgroFoodReport.pdf',
    pdfContentText: `1. PROJECT OBJECTIVES & SCOPE
The CREDA consortium investigates how Mediterranean food buyers reconcile provenance, organic status, and price spikes during high-inflation economic cycles.

2. DISCRETE CHOICE MODELING FRAMEWORK
Utilizing mixed logit specifications in R Biogeme, we present respondents with multi-attribute choice sets varying local origin distance, carbon footprint ratings, and packaging materials.

3. PRELIMINARY WTP METRICS
Willingness-to-pay for designated regional terroir exceeds generic low-carbon certifications by 1.7x across fresh fruits and vegetables in both Catalonia and Emilia-Romagna.`,
  },
  {
    id: 'item-05',
    number: '05',
    title: 'Geographical Indications and Digital Innovation',
    shortTitle: 'GI SMART Initiative',
    authors: ['Amine Zouaghi', 'Filippo Arfini', 'Michele Donati'],
    year: '2024',
    journal: 'Horizon Europe Research Deliverables',
    doi: '10.3030/101084291',
    type: 'European Research Initiative',
    status: 'Ongoing research',
    readingStatus: 'to_read',
    readingProgress: {
      currentPage: 0,
      totalPages: 52,
      percent: 0,
      totalReadingTimeMinutes: 0,
    },
    evaluation: {
      importance: 'medium',
      relevance: 'medium',
      rating: 4,
      priority: 'medium',
    },
    field: 'Geographical Indications & Food Heritage',
    category: 'DIGITAL INNOVATION',
    secondaryCategories: ['FOOD SYSTEMS', 'RESEARCH PROJECTS'],
    collectionIds: ['col-gi', 'col-thesis'],
    tags: ['PDO', 'PGI', 'Terroir', 'Digital Storytelling'],
    institution: 'Horizon Europe GI SMART Consortium / University of Parma',
    topics: [
      'Protected Designation of Origin (PDO)',
      'Protected Geographical Indication (PGI)',
      'Agri-food value chain resilience',
      'Digital traceability & storytelling',
      'Producer consortium empowerment',
    ],
    methods: [
      'International research workshops',
      'Cross-consortium knowledge exchange',
      'Digital communication audit of GI consortia',
      'Qualitative stakeholder interviews',
    ],
    tools: ['Digital benchmarking frameworks', 'Web scraping audits', 'Qualitative thematic coding'],
    focus:
      'Exploring how digital technologies, transparent data exchange, and online communication can support the recognition, economic visibility, and sustainable evolution of European Geographical Indications.',
    abstract:
      'Geographical Indications (GIs) protect traditional agricultural patrimony and rural livelihoods across Europe. However, smaller GI consortia face steep digital transformation hurdles in engaging younger consumers and proving environmental stewardship. GI SMART investigates how digital platforms, verifiable digital identity, and enhanced information architecture can amplify GI value preservation without distorting authentic heritage.',
    objectives: [
      'Examine the current digital maturity of European PDO and PGI producer organizations.',
      'Assess how consumers verify authentic GI credentials in online retail and food delivery ecosystems.',
      'Formulate policy recommendations for modernization of the European Union GI regulatory framework.',
    ],
    researchQuestions: [
      'How can digital traceability tools convey terroir and artisanal methods without confusing retail buyers?',
      'What institutional barriers prevent smaller GI producer syndicates from adopting digital verification tools?',
    ],
    keyFindings: [
      'Over 68% of small-scale GI producer websites lack interactive provenance mapping or verifiable certification lookup.',
      'Consumer testing demonstrates that digital QR-linked farm transparency significantly increases willingness-to-pay among urban millennial cohorts.',
    ],
    contributions: [
      'Pan-European assessment framework for GI digital communication readiness.',
      'Participation in multi-stakeholder policy roundtables shaping European food heritage digitization.',
    ],
    collaborators: [
      'GI SMART Horizon Consortium',
      'University of Parma',
      'European PDO / PGI Consortia',
    ],
    spineAccent: '#1F3FB0',
    coverPalette: {
      bg: '#EDEBE6',
      text: '#141414',
      accent: '#1F3FB0',
      motif: 'gi-smart-map',
    },
    visualMaterial: {
      type: 'gi-map',
      title: 'European GI Innovation Map & Value Chain Linkages',
      caption:
        'Mapping digital touchpoints, certification tiers (PDO/PGI), and territory-based agro-ecological linkages.',
      metrics: [
        { label: 'Scope', value: 'Pan-European', detail: 'PDO / PGI / TSG schemes' },
        { label: 'Consortium Units', value: '18 Partners', detail: 'Universities & GI Federations' },
        { label: 'Focus', value: 'Terroir & Data', detail: 'Rural sustainability' },
      ],
    },
    resources: [
      {
        label: 'Visit Horizon Europe GI SMART Consortium Portal',
        actionType: 'external-link',
        available: true,
      },
      {
        label: 'Copy BibTeX Citation Reference',
        actionType: 'copy-citation',
        available: true,
      },
    ],
    pdfFileName: 'GI_SMART_Deliverable_D1.2.pdf',
    pdfContentText: `1. INTRODUCTION: TRADITION MEETS DIGITAL INNOVATION
European Geographical Indications (GIs) represent over €75 billion in annual wholesale value. Yet producer consortia operate with stark digital asymmetries.

2. DIGITAL MATURITY BENCHMARKING
Auditing 340 GI consortium portals reveals that 68% offer static text descriptions without interactive maps, batch authenticity checkers, or sustainability metrics.

3. URBAN GENERATION Z ENGAGEMENT
Pilot tests with QR-enabled physical labels linked to farmer video narratives increase young consumer trust scores by 34% compared to standard EU certification badges.`,
  },
  {
    id: 'item-06',
    number: '06',
    title: 'Building a Structured Database of European Geographical Indication Products',
    shortTitle: 'European GI Structured Database',
    authors: ['Amine Zouaghi', 'Computer Engineering Lab'],
    year: '2025',
    journal: 'Data in Brief (Submitted)',
    doi: '10.5281/zenodo.1098231',
    type: 'Data Science Research',
    status: 'Ongoing research',
    readingStatus: 'completed',
    readingProgress: {
      currentPage: 18,
      totalPages: 18,
      percent: 100,
      totalReadingTimeMinutes: 60,
      lastReadAt: '2026-10-18T16:45:00Z',
    },
    evaluation: {
      importance: 'high',
      relevance: 'high',
      rating: 5,
      priority: 'high',
    },
    field: 'Food Data & Digital Heritage',
    category: 'BIG DATA',
    secondaryCategories: ['DIGITAL INNOVATION', 'FOOD SYSTEMS'],
    collectionIds: ['col-gi', 'col-bigdata', 'col-thesis'],
    tags: ['Crawl4AI', 'Python', 'SQL', 'eAmbrosia', 'Scraping'],
    institution: 'University of Parma',
    topics: [
      'Automated web scraping',
      'Crawl4AI & asynchronous pipelines',
      'eAmbrosia registry extraction',
      'TMDN / TMview trademark registers',
      'Geocoding & administrative boundaries',
      'Data harmonization',
    ],
    methods: [
      'Automated web extraction pipelines (Crawl4AI)',
      'Schema normalization and entity resolution',
      'Geospatial bounding and coordinate matching',
      'SQL / Parquet structured warehousing',
    ],
    tools: ['Python', 'Crawl4AI', 'Playwright', 'PostgreSQL', 'DuckDB', 'GeoPandas'],
    dataSources:
      'Official European Commission eAmbrosia database, EUIPO TMDN trademark registries, national gazettes',
    sample:
      'Comprehensive catalog of registered European Food & Wine GIs including geographical production polygons',
    focus:
      'Extracting, structuring, and integrating fragmented geographical indication data from official EU registers into a unified, queryable relational and spatial database for researchers and policymakers.',
    abstract:
      'Despite the economic prominence of European Geographical Indications, official registries like eAmbrosia exist as static tabular web portals lacking unified programmatic endpoints or granular geolocated production boundaries. This data science project develops an automated, resilient extraction pipeline using Crawl4AI and entity-resolution models, structuring thousands of products across countries, certification bodies, and municipal territory restrictions.',
    objectives: [
      'Engineer high-throughput scraping pipelines resilient to dynamic web interfaces and schema updates.',
      'Reconcile multi-lingual product designations with standardized EU vocabularies.',
      'Produce an open-science benchmark database enabling spatial econometrics on food heritage.',
    ],
    researchQuestions: [
      'How can disparate administrative boundary designations in GI legal specifications be automatically translated into GIS vector polygons?',
      'What data inconsistencies exist between national gazettes and centralized EU registries?',
    ],
    keyFindings: [
      'Engineered an automated Crawl4AI pipeline processing thousands of GI product dossiers with 99.4% field completeness.',
      'Identified critical discrepancies in regional municipal boundary naming across member states, resolved via automated gazetteer alignment.',
      'Established the first unified tabular relational schema linking producer consortium metadata with legal gazette filing dates.',
    ],
    contributions: [
      'Production-grade open extraction codebase built in Python with Crawl4AI.',
      'Structured database featuring unified schemas for PDO, PGI, and TSG categories.',
      'Reusable data pipeline supporting future agricultural economics and provenance studies.',
    ],
    collaborators: [
      'Department of Food and Drug, University of Parma',
      'Computational Agro-Food Data Working Group',
    ],
    spineAccent: '#1F3FB0',
    coverPalette: {
      bg: '#141414',
      text: '#EDEBE6',
      accent: '#60A5FA',
      motif: 'gi-database-schema',
    },
    visualMaterial: {
      type: 'gi-database',
      title: 'Crawl4AI Extraction Pipeline & Relational Schema',
      caption:
        'Live schema architecture showing automated ingestion from eAmbrosia and TMDN into structured relational entities.',
      metrics: [
        { label: 'Harvested Records', value: '3,800+', detail: 'Food, wine & spirit GIs' },
        { label: 'Field Completeness', value: '99.4%', detail: 'Verified metadata' },
        { label: 'Pipeline Engine', value: 'Crawl4AI', detail: 'Asynchronous Python core' },
        { label: 'Schema Entities', value: '12 Tables', detail: 'Normalized relational model' },
      ],
    },
    resources: [
      {
        label: 'Explore Structured Database Schema & Fields',
        actionType: 'schema-viewer',
        available: true,
      },
      {
        label: 'Copy BibTeX Citation Reference',
        actionType: 'copy-citation',
        available: true,
      },
    ],
    pdfFileName: 'Zouaghi_2025_GIDatabase_DataPaper.pdf',
    pdfContentText: `1. INTRODUCTION: FRAGMENTATION IN EU FOOD REGISTRIES
The European Commission's eAmbrosia platform catalogs over 3,800 protected names. However, researchers face disjointed tabular layouts and missing geospatial shapefiles.

2. CRAWL4AI HIGH-THROUGHPUT EXTRACTION
Using asynchronous Crawl4AI engines backed by headless Chromium instances, our scraper navigates multilingual legal annexes, extracting registration dates, applicant consortia, product specifications, and defined administrative municipalities.

3. SCHEMA ARCHITECTURE & VALIDATION
Data is normalized into a relational PostgreSQL schema (and exported to DuckDB / Parquet). The pipeline achieved 99.4% field completeness across 3,842 verified products.`,
  },
  {
    id: 'item-07',
    number: '07',
    title: 'Underutilized Crops, Biodiversity and Sustainable Food Value Chains',
    shortTitle: 'BIOVALUE Project',
    authors: ['Amine Zouaghi', 'George Baourakis', 'Periklis Drakos'],
    year: '2023',
    journal: 'Sustainability in Agri-Food Chains',
    doi: '10.3390/su15129482',
    type: 'Previous Research Project',
    status: 'Previous research project',
    readingStatus: 'reference_only',
    readingProgress: {
      currentPage: 24,
      totalPages: 24,
      percent: 100,
      totalReadingTimeMinutes: 80,
    },
    evaluation: {
      importance: 'medium',
      relevance: 'medium',
      rating: 4,
      priority: 'low',
    },
    field: 'Agricultural Biodiversity & Sustainable Food Systems',
    category: 'BIODIVERSITY',
    secondaryCategories: ['FOOD SYSTEMS', 'RESEARCH PROJECTS'],
    collectionIds: ['col-slr', 'col-thesis'],
    tags: ['Biodiversity', 'Underutilized Crops', 'CIHEAM', 'Legumes'],
    institution: 'CIHEAM Mediterranean Agronomic Institute of Chania (MAICh)',
    topics: [
      'Agrobiodiversity preservation',
      'Underutilized crop species (legumes, ancestral grains)',
      'Climate-resilient cultivation',
      'Mediterranean food value chains',
      'Consumer acceptance of neglected crops',
    ],
    methods: [
      'Value chain stakeholder mapping',
      'Consumer sensory and attitude evaluation',
      'Agro-ecological suitability modeling',
      'Socio-economic impact assessment',
    ],
    tools: ['Statistical survey modeling', 'Value chain flow analysis', 'SPSS / R'],
    dataSources: 'Field experimental trials across Mediterranean partner regions + consumer panel surveys',
    focus:
      'Exploring the nutritional potential of neglected and underutilized crops, promoting biodiversity preservation, and strengthening climate-resilient sustainable food production systems.',
    abstract:
      'Modern food systems rely dangerously on a fragile handful of staple crops, exacerbating soil degradation and climatic vulnerability. As part of the European Horizon BIOVALUE research framework at CIHEAM MAICh, this investigation examined how reviving underutilized crops (such as buckwheat, lentil landraces, and ancestral wheats) creates resilient agricultural micro-economies and meets consumer demand for functional, bio-diverse foods.',
    objectives: [
      'Assess the socio-economic feasibility of reintroducing neglected traditional crop varieties.',
      'Quantify consumer sensory willingness to substitute conventional staples with biodiversity-rich grains.',
      'Trace bottlenecks across processing, distribution, and certification in Mediterranean supply chains.',
    ],
    researchQuestions: [
      'What sensory and price thresholds influence consumer willingness to purchase underutilized crop products?',
      'How can farmers in marginal Mediterranean lands be financially de-risked when transitioning to biodiverse rotations?',
    ],
    keyFindings: [
      'Demonstrated high sensory acceptability for ancestral grain and legume blended baked goods when paired with origin narrative labeling.',
      'Identified processing equipment bottlenecks as the primary barrier preventing smallholders from scaling underutilized grain production.',
      'Formulated strategic policy briefs for regional agro-biodiversity subsidies in Mediterranean basin contexts.',
    ],
    contributions: [
      'Comprehensive value chain analysis published within the European BIOVALUE project repository.',
      'Multi-attribute consumer acceptance datasets for neglected Mediterranean agricultural species.',
      'Policy recommendations for linking crop biodiversity payments to rural development programs.',
    ],
    collaborators: [
      'CIHEAM Mediterranean Agronomic Institute of Chania (MAICh)',
      'BIOVALUE Horizon 2020 Consortium',
      'Mediterranean Agricultural Research Stations',
    ],
    spineAccent: '#536B52',
    coverPalette: {
      bg: '#EDEBE6',
      text: '#141414',
      accent: '#536B52',
      motif: 'biovalue-agro',
    },
    visualMaterial: {
      type: 'biovalue-matrix',
      title: 'Biodiversity Agro-Ecological Matrix & Value Chain Resilience',
      caption:
        'Socio-ecological cycle: resilient crop cultivation, functional processing, and market uptake of neglected species.',
      metrics: [
        { label: 'Neglected Species', value: '8 Crops', detail: 'Ancestral grains & legumes' },
        { label: 'Partner Hubs', value: '14 Regions', detail: 'Mediterranean & Central Europe' },
        { label: 'Host Center', value: 'CIHEAM MAICh', detail: 'Chania, Greece' },
        { label: 'Framework', value: 'Horizon 2020', detail: 'Under grant agreement' },
      ],
    },
    resources: [
      {
        label: 'Visit CIHEAM MAICh Institutional Research Profile',
        actionType: 'external-link',
        available: true,
      },
      {
        label: 'Copy BibTeX Reference',
        actionType: 'copy-citation',
        available: true,
      },
    ],
    pdfFileName: 'BIOVALUE_2023_FinalReport_CIHEAM.pdf',
    pdfContentText: `1. AGRO-BIODIVERSITY AS CLIMATE MITIGATION
Relying on just three primary grain monocultures exposes global food chains to biotic and abiotic shocks. Diversifying Mediterranean rotations with drought-hardy legumes and pseudocereals restores soil nitrogen balances.

2. VALUE CHAIN RESILIENCE IN MARGINAL LANDS
Smallholder farmers in Crete and Southern Italy achieve higher net farm income per hectare when growing ancestral grains, provided cooperative milling facilities exist within 45 kilometers.

3. SENSORY & CONSUMER PANELS
Blind sensory testing of pasta blended with 30% grass pea and buckwheat scored 88% overall hedonic liking relative to 100% refined semolina controls.`,
  },
  {
    id: 'item-08',
    number: '08',
    title: 'Understanding Consumer Attention and Food Choice Through Virtual Reality and Eye Tracking',
    shortTitle: 'Immersive Consumer Research & Eye Tracking',
    authors: ['Amine Zouaghi', 'Davide Menozzi', 'Marco Setti'],
    year: '2026',
    journal: 'Frontiers in Neuroscience (In Prep)',
    doi: '10.3389/fnins.2026.119284',
    type: 'Research Methodology',
    status: 'Active methodology',
    readingStatus: 'inbox',
    readingProgress: {
      currentPage: 3,
      totalPages: 36,
      percent: 8,
      totalReadingTimeMinutes: 15,
      lastReadAt: '2026-10-22T14:10:00Z',
    },
    evaluation: {
      importance: 'high',
      relevance: 'high',
      rating: 5,
      priority: 'high',
    },
    field: 'Consumer Neuroscience & Immersive Technologies',
    category: 'IMMERSIVE TECHNOLOGIES',
    secondaryCategories: ['CONSUMER BEHAVIOUR'],
    collectionIds: ['col-vr', 'col-thesis'],
    tags: ['Eye Tracking', 'Virtual Reality', 'Neuroscience', 'Gaze Tracking'],
    institution: 'University of Parma',
    topics: [
      'Virtual Reality (VR) retail supermarkets',
      'Head-mounted eye tracking',
      'Gaze fixation duration & sequence',
      'Visual saliency vs goal-directed attention',
      'Immersive consumer experiments',
    ],
    methods: [
      'Controlled VR laboratory experiments',
      'Pupillometry and fixation trajectory analysis',
      'Spatial heatmapping in 3D environments',
      'Post-immersion recall and decision testing',
    ],
    tools: ['HTC Vive Pro Eye / Meta Quest Pro', 'Tobii Pro Lab', 'Unity 3D', 'Python (scikit-learn)'],
    dataSources: 'High-frequency 120Hz millisecond gaze coordinates + 3D interaction telemetry',
    sample: 'Experimental laboratory cohorts in controlled immersive supermarket environments',
    focus:
      'Investigating how consumers allocate visual attention and navigate food choice trade-offs within fully immersive, realistic 3D virtual retail settings equipped with eye tracking.',
    abstract:
      'Traditional laboratory survey methods suffer from hypothetical bias, while in-store field experiments lack physiological experimental control. By combining photorealistic Virtual Reality environments with high-speed binocular eye-tracking telemetry, this methodological framework captures unconscious visual attention, fixation sequences, and cognitive hesitation during grocery navigation with millisecond fidelity.',
    objectives: [
      'Establish standardized experimental protocols for eye-tracking calibration in immersive 6-DOF VR food environments.',
      'Disentangle bottom-up visual saliency (bright packaging) from top-down goal orientation (looking for organic labels).',
      'Correlate total dwell time on sustainability certifications with final purchasing decisions.',
    ],
    researchQuestions: [
      'Do front-of-pack sustainability labels receive genuine cognitive fixation or merely transient peripheral glance?',
      'How does physical shelf height in a 3D VR environment alter attention duration compared to real-world store shelves?',
    ],
    keyFindings: [
      'Fixation duration exceeding 320ms on sustainability labels strongly predicts product choice with 84.2% classification accuracy.',
      'Eco-labels placed on the upper-third of packaging capture 2.4× quicker initial time-to-first-fixation (TTFF) than lower-placed marks.',
      'Virtual reality grocery environments replicate real-world aisle navigation paths with high ecological validity, while enabling seamless instantaneous manipulation of store layouts.',
    ],
    contributions: [
      'Open-source experimental script architecture for Unity-based VR supermarket studies.',
      'Gaze fixation normalization algorithm compensating for head movement in immersive environments.',
      'Methodological protocol bridging neuro-marketing tools with sustainable public health interventions.',
    ],
    collaborators: [
      'Department of Food and Drug, University of Parma',
      'Immersive Technology & Behavioural Analytics Lab',
    ],
    spineAccent: '#1F3FB0',
    coverPalette: {
      bg: '#141414',
      text: '#EDEBE6',
      accent: '#60A5FA',
      motif: 'eye-tracking-gaze',
    },
    visualMaterial: {
      type: 'eye-tracking-sim',
      title: 'Virtual Shelf Gaze Fixation & Visual Saliency Simulation',
      caption:
        'Interactive gaze trajectory, millisecond fixation clusters, and attention heatmap overlay on grocery shelf items.',
      metrics: [
        { label: 'Sampling Rate', value: '120 Hz', detail: 'Millisecond gaze coordinates' },
        { label: 'Predictive Threshold', value: '320 ms', detail: 'Fixation duration trigger' },
        { label: 'Choice Accuracy', value: '84.2%', detail: 'Neuro-attention model' },
        { label: 'Spatial Saliency', value: '6-DOF', detail: 'Full 3D VR tracking' },
      ],
    },
    resources: [
      {
        label: 'View Eye-Tracking Experimental Protocol Summary',
        actionType: 'download-summary',
        available: true,
      },
      {
        label: 'Copy BibTeX Citation Reference',
        actionType: 'copy-citation',
        available: true,
      },
    ],
    pdfFileName: 'Zouaghi_2026_VR_EyeTracking_Protocol.pdf',
    pdfContentText: `1. PROTOCOL ARCHITECTURE FOR 6-DOF VR SUPERMARKETS
Virtual environments modeled with photorealistic PBR shaders inside Unity 3D enable complete experimental manipulation of shelf layouts, packaging labels, and price tags.

2. BINOCULAR 120HZ GAZE CALIBRATION
Integrated eye-tracking sensors in the HTC Vive Pro Eye capture binocular gaze vectors, pupil diameter, and corneal reflections. Saccades and fixations are classified using an adaptive velocity-threshold identification (I-VT) filter.

3. PREDICTIVE ATTENTION CLASSIFICATION
Fixations exceeding 320 milliseconds on front-of-pack environmental claims indicate cognitive integration and predict final basket selection with 84.2% ROC-AUC accuracy.`,
  },
];

export const INITIAL_HIGHLIGHTS: Highlight[] = [
  {
    id: 'hl-01',
    paperId: 'item-01',
    pageNumber: 3,
    text: 'Transactional scanner datasets demonstrate 3.4x higher fidelity in tracking repeat plant-based meat alternative adoptions compared to survey recall.',
    color: 'green',
    note: 'Critical quantitative proof for the PhD thesis methodology chapter.',
    createdAt: '2026-10-31T14:22:00Z',
  },
  {
    id: 'hl-02',
    paperId: 'item-01',
    pageNumber: 4,
    text: 'Reconciling high-frequency retail churn with epidemiological nutritional indexes requires standardized multi-tier normalization schemas.',
    color: 'blue',
    note: 'Methodological hurdle to solve with Python data pipelines.',
    createdAt: '2026-11-01T09:12:00Z',
  },
  {
    id: 'hl-03',
    paperId: 'item-03',
    pageNumber: 3,
    text: 'Combining availability with bonus solidarity points yielded the highest uptake (+54.6%), particularly among households with young children.',
    color: 'yellow',
    note: 'Synergistic effect between choice architecture and symbolic rewards.',
    createdAt: '2026-10-25T11:40:00Z',
  },
  {
    id: 'hl-04',
    paperId: 'item-03',
    pageNumber: 4,
    text: 'Following incentive withdrawal, a 4-week washout phase confirmed persistent +21.4% elevation, demonstrating durable habit formation.',
    color: 'green',
    note: 'Crucial distinction between transient compliance and habit stickiness.',
    createdAt: '2026-10-25T11:55:00Z',
  },
  {
    id: 'hl-05',
    paperId: 'item-08',
    pageNumber: 3,
    text: 'Fixations exceeding 320 milliseconds on front-of-pack environmental claims indicate cognitive integration and predict final basket selection with 84.2% ROC-AUC accuracy.',
    color: 'pink',
    note: 'Hypothesis for next laboratory experimental series.',
    createdAt: '2026-10-22T14:30:00Z',
  },
];

export const INITIAL_NOTES: ResearchNote[] = [
  {
    id: 'note-01',
    title: 'Methodological Triangulation: POS Telemetry vs Field Nudges',
    content: `# Methodological Triangulation: POS Telemetry vs Field Nudges

## Intellectual Rationale
One of the primary contributions of the PhD thesis is showing how **passive transactional streams** (scanner data) validate and monitor the real-world stickiness of **behavioural nudges**.

- In [[item-03]], the social supermarket field experiment manipulated physical shelf space (50% availability) and symbolic loyalty points.
- However, traditional self-reports would have been plagued by social desirability bias.
- Utilizing POS barcode records allowed objective day-by-day measurement across baseline, intervention, and the 4-week washout period.

## Backlinks & Relevant Studies:
- [[item-01]]: Systematic review establishing that scanner data has 3.4x higher fidelity than recall surveys.
- [[item-06]]: The Crawl4AI database can provide regional product attributes to join with POS transaction data.

## Next Step
Run a mixed logit regression modeling basket-level habit stickiness across household demographic tiers.`,
    type: 'paper',
    paperIds: ['item-01', 'item-03'],
    collectionIds: ['col-slr', 'col-thesis'],
    tags: ['Triangulation', 'Econometrics', 'Scanner Data'],
    createdAt: '2026-10-26T16:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'note-02',
    title: 'Literature Synthesis: Determinants of Sustainable Food Transitions',
    content: `# Synthesis: Determinants of Sustainable Food Transitions in Mediterranean Retail

## 1. Research Question
What combination of choice architecture, price parity, and origin certification produces permanent (rather than transient) shifts toward planetary-health diets?

## 2. Main Thematic Streams
1. **Physical & Digital Choice Architecture**: Shelf placement and algorithmic prominence dominate deliberate consumer choice ([[item-02]], [[item-03]]).
2. **Terroir vs Carbon Metrics**: Southern European consumers consistently value regional authenticity and geographical origin over generic carbon claims ([[item-04]], [[item-05]]).
3. **Cognitive Deliberation & Gaze**: Sustainability claims need at least 320ms of focused visual gaze on the upper-third of packaging to cross the purchasing threshold ([[item-08]]).

## 3. Contradictory Findings in Literature
- Several stated preference surveys report high willingness-to-pay for carbon labels, but actual scanner purchase logs show rapid dropout unless supported by taste/origin reassurance.`,
    type: 'synthesis',
    paperIds: ['item-01', 'item-02', 'item-03', 'item-04', 'item-05', 'item-08'],
    collectionIds: ['col-thesis'],
    tags: ['Synthesis', 'Mediterranean Food', 'Planetary Health'],
    createdAt: '2026-10-29T11:00:00Z',
    updatedAt: '2026-11-02T08:30:00Z',
    synthesisData: {
      researchQuestion: 'What combination of choice architecture, price parity, and origin certification produces permanent shifts toward sustainable diets?',
      mainThemes: ['Physical & Digital Choice Architecture', 'Terroir vs Carbon Metrics', 'Neuro-Attention Thresholds'],
      supportingEvidence: [
        '50% shelf availability achieved +38.2% relative lift in wholegrain purchases in solidarity markets.',
        'Fixations > 320ms predict purchase with 84.2% ROC-AUC accuracy.',
      ],
      contradictoryFindings: [
        'Stated preference surveys over-predict carbon label adoption compared to actual transactional basket logs.',
      ],
      gaps: [
        'Long-term (> 6 months) habit persistence in commercial supermarket chains.',
        'Cross-country harmonization of GI spatial production polygons with retail loyalty logs.',
      ],
      keyReferences: [
        'Zouaghi et al. (2025) Systematic Literature Review on Big Data & Food Choice.',
        'Zouaghi et al. (2025) Social Supermarkets Nudging Field Experiment.',
      ],
    },
  },
];

export const INITIAL_READING_SESSIONS: ReadingSession[] = [
  { id: 'rs-01', paperId: 'item-01', date: '2026-11-01', durationMinutes: 45, pagesRead: 10 },
  { id: 'rs-02', paperId: 'item-01', date: '2026-10-31', durationMinutes: 30, pagesRead: 6 },
  { id: 'rs-03', paperId: 'item-02', date: '2026-10-30', durationMinutes: 40, pagesRead: 8 },
  { id: 'rs-04', paperId: 'item-04', date: '2026-10-28', durationMinutes: 50, pagesRead: 14 },
  { id: 'rs-05', paperId: 'item-03', date: '2026-10-25', durationMinutes: 60, pagesRead: 18 },
  { id: 'rs-06', paperId: 'item-03', date: '2026-10-24', durationMinutes: 35, pagesRead: 10 },
  { id: 'rs-07', paperId: 'item-08', date: '2026-10-22', durationMinutes: 15, pagesRead: 3 },
  { id: 'rs-08', paperId: 'item-06', date: '2026-10-18', durationMinutes: 60, pagesRead: 18 },
  { id: 'rs-09', paperId: 'item-07', date: '2026-10-15', durationMinutes: 40, pagesRead: 12 },
  { id: 'rs-10', paperId: 'item-07', date: '2026-10-14', durationMinutes: 40, pagesRead: 12 },
  { id: 'rs-11', paperId: 'item-01', date: '2026-10-10', durationMinutes: 25, pagesRead: 5 },
  { id: 'rs-12', paperId: 'item-04', date: '2026-10-08', durationMinutes: 30, pagesRead: 7 },
];

export const INITIAL_GOALS: ReadingGoal[] = [
  {
    id: 'goal-01',
    type: 'papers_per_week',
    label: 'Weekly Papers Completed',
    target: 3,
    period: 'weekly',
    current: 2,
  },
  {
    id: 'goal-02',
    type: 'minutes_per_day',
    label: 'Daily Deep Reading Time',
    target: 35,
    period: 'daily',
    current: 45,
  },
  {
    id: 'goal-03',
    type: 'papers_per_month',
    label: 'Systematic Review Papers Synthesized',
    target: 12,
    period: 'monthly',
    current: 8,
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-01',
    type: 'highlighted',
    description: 'Highlighted key finding on transactional scanner data fidelity in Item 01',
    timestamp: '2026-11-01T14:22:00Z',
    paperId: 'item-01',
    paperTitle: 'Mapping Consumer Trends for Healthy and Sustainable Food Choices',
  },
  {
    id: 'act-02',
    type: 'created_note',
    description: 'Drafted Literature Synthesis on Determinants of Sustainable Food Transitions',
    timestamp: '2026-10-29T11:00:00Z',
  },
  {
    id: 'act-03',
    type: 'finished_paper',
    description: 'Completed reading Social Supermarkets Nudging Experiment (28 pages)',
    timestamp: '2026-10-25T18:00:00Z',
    paperId: 'item-03',
    paperTitle: 'Encouraging Wholegrain Pasta Consumption Through Behavioural Nudging',
  },
  {
    id: 'act-04',
    type: 'imported',
    description: 'Imported European GI Structured Database dossier and data paper',
    timestamp: '2026-10-18T16:45:00Z',
    paperId: 'item-06',
  },
  {
    id: 'act-05',
    type: 'changed_status',
    description: 'Moved Immersive Consumer Research & Eye Tracking to Inbox',
    timestamp: '2026-10-15T09:30:00Z',
    paperId: 'item-08',
  },
];

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
    associatedResearchIds: ['item-01', 'item-06'],
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
    associatedResearchIds: ['item-01', 'item-02'],
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
    associatedResearchIds: ['item-03', 'item-04'],
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
    associatedResearchIds: ['item-08'],
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
    associatedResearchIds: ['item-06', 'item-05'],
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
    associatedResearchIds: ['item-05', 'item-06'],
  },
  {
    id: 'method-07',
    title: 'Agro-Biodiversity & Value Chain Analysis',
    category: 'SUSTAINABLE AGRI-FOOD SYSTEMS',
    associatedTechniques: [
      'Value chain mapping',
      'Underutilized crop sensory evaluation',
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
    associatedResearchIds: ['item-07'],
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
      project: 'BIOVALUE (Horizon 2020)',
      period: '2021–2023',
      focus:
        'Research on underutilized crops, agrobiodiversity preservation, and socio-economic value chain development for climate-resilient agriculture.',
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
      url: 'https://orcid.org',
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
