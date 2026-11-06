import { ResearchItem, ResearchCollection } from '../types/research';

export interface TopicPreset {
  id: string;
  name: string;
  query: string;
  category: string;
  description: string;
  iconName: string;
}

export const POPULAR_TOPICS: TopicPreset[] = [
  {
    id: 'ai-llm',
    name: 'Artificial Intelligence & Foundation Models',
    query: 'large language models transformers neural networks',
    category: 'ARTIFICIAL INTELLIGENCE',
    description: 'Transformer architectures, multimodal learning, and inference alignment.',
    iconName: 'Cpu',
  },
  {
    id: 'quantum',
    name: 'Quantum Computing & Information',
    query: 'quantum computing qubits quantum algorithms',
    category: 'QUANTUM PHYSICS',
    description: 'Quantum supremacy, error correction, and quantum cryptography.',
    iconName: 'Zap',
  },
  {
    id: 'climate-energy',
    name: 'Climate Resilience & Renewable Energy',
    query: 'climate change mitigation renewable energy decarbonization',
    category: 'CLIMATE & ENERGY',
    description: 'Atmospheric modeling, solar-hydrogen materials, and grid storage.',
    iconName: 'Globe',
  },
  {
    id: 'crispr-genomics',
    name: 'CRISPR & Precision Gene Editing',
    query: 'CRISPR Cas9 gene editing precision medicine genomics',
    category: 'GENOMICS & BIOTECH',
    description: 'Targeted base editors, prime editing, and therapeutics.',
    iconName: 'Dna',
  },
  {
    id: 'neuroscience',
    name: 'Cognitive Neuroscience & Brain Research',
    query: 'neuroscience neural plasticity cognitive computing brain',
    category: 'NEUROSCIENCE',
    description: 'Connectomics, synaptic plasticity, and neural interface decoding.',
    iconName: 'Sparkles',
  },
  {
    id: 'astrophysics',
    name: 'Astrophysics & Space Science',
    query: 'astrophysics gravitational waves cosmology exoplanets',
    category: 'ASTROPHYSICS',
    description: 'Interferometric telescopes, black hole physics, and deep space telemetry.',
    iconName: 'Compass',
  },
];

function buildResearchItem(params: {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  authors: string[];
  year: string;
  journal?: string;
  doi?: string;
  url?: string;
  type: string;
  category: string;
  field: string;
  abstract: string;
  tags: string[];
  institution?: string;
  collectionIds: string[];
}): ResearchItem {
  return {
    ...params,
    status: 'Published open access',
    readingStatus: 'to_read',
    readingProgress: {
      currentPage: 1,
      totalPages: 16,
      percent: 0,
      totalReadingTimeMinutes: 0,
    },
    evaluation: {
      importance: 'high',
      relevance: 'high',
      rating: 5,
      priority: 'medium',
    },
    topics: params.tags,
    methods: ['Open-access empirical peer review'],
    focus: params.abstract.slice(0, 160),
    objectives: ['Advance open scientific knowledge and public scholarship'],
    researchQuestions: [],
    contributions: ['Published open-access peer-reviewed contribution'],
    spineAccent: '#1F3FB0',
    coverPalette: {
      bg: '#141414',
      text: '#EDEBE6',
      accent: '#1F3FB0',
      motif: 'bibliometric-network',
    },
    visualMaterial: {
      type: 'literature-map',
      title: params.title,
      caption: params.abstract.slice(0, 140),
    },
    resources: [
      {
        label: 'Copy BibTeX Citation',
        actionType: 'copy-citation',
        available: true,
      },
    ],
  };
}

// Offline fallback: Universal landmark open-science papers (zero personal research data)
export const UNIVERSAL_OPEN_SCIENCE_PAPERS: ResearchItem[] = [
  buildResearchItem({
    id: 'open-landmark-01',
    number: '01',
    title: 'Attention Is All You Need',
    shortTitle: 'Attention Is All You Need',
    authors: [
      'Ashish Vaswani',
      'Noam Shazeer',
      'Niki Parmar',
      'Jakob Uszkoreit',
      'Llion Jones',
      'Aidan N. Gomez',
      'Lukasz Kaiser',
      'Illia Polosukhin',
    ],
    year: '2017',
    journal: 'Advances in Neural Information Processing Systems (NeurIPS)',
    doi: '10.48550/arXiv.1706.03762',
    url: 'https://arxiv.org/abs/1706.03762',
    type: 'Milestone Research Paper',
    field: 'Machine Learning & Natural Language Processing',
    category: 'ARTIFICIAL INTELLIGENCE',
    tags: ['Transformer', 'Attention Mechanism', 'Deep Learning', 'NLP'],
    institution: 'Google Brain / Google Research',
    collectionIds: ['col-general'],
    abstract:
      'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose the Transformer, a novel network architecture based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
  }),
  buildResearchItem({
    id: 'open-landmark-02',
    number: '02',
    title: 'A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity',
    shortTitle: 'CRISPR-Cas9 Endonuclease',
    authors: ['Martin Jinek', 'Krzysztof Chylinski', 'Ines Fonfara', 'Michael Hauer', 'Jennifer A. Doudna', 'Emmanuelle Charpentier'],
    year: '2012',
    journal: 'Science',
    doi: '10.1126/science.1225829',
    url: 'https://www.science.org/doi/10.1126/science.1225829',
    type: 'Foundational Molecular Biology',
    field: 'Molecular Genetics & Biotechnology',
    category: 'GENOMICS & BIOTECH',
    tags: ['CRISPR', 'Cas9', 'Genome Editing', 'Adaptive Immunity'],
    institution: 'UC Berkeley & Umeå University',
    collectionIds: ['col-general'],
    abstract:
      'Clustered regularly interspaced short palindromic repeats (CRISPR)/CRISPR-associated (Cas) systems provide bacteria and archaea with adaptive immunity against viruses and plasmids. Here, we demonstrate that Cas9 endonuclease can be programmed with dual-RNA guides to introduce site-specific double-stranded breaks in target DNA, providing a versatile platform for RNA-programmable genome engineering.',
  }),
  buildResearchItem({
    id: 'open-landmark-03',
    number: '03',
    title: 'Deep Residual Learning for Image Recognition',
    shortTitle: 'Deep Residual Networks (ResNet)',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    year: '2016',
    journal: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
    doi: '10.1109/CVPR.2016.90',
    url: 'https://arxiv.org/abs/1512.03385',
    type: 'Computer Vision Benchmark',
    field: 'Computer Vision & Deep Learning',
    category: 'ARTIFICIAL INTELLIGENCE',
    tags: ['ResNet', 'Residual Learning', 'Deep Convolutional Networks'],
    institution: 'Microsoft Research',
    collectionIds: ['col-general'],
    abstract:
      'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We evaluate our residual networks with a depth of up to 152 layers on the ImageNet dataset.',
  }),
  buildResearchItem({
    id: 'open-landmark-04',
    number: '04',
    title: 'Highly accurate protein structure prediction with AlphaFold',
    shortTitle: 'AlphaFold Protein Structure',
    authors: ['John Jumper', 'Richard Evans', 'Alexander Pritzel', 'Demis Hassabis', 'Pushmeet Kohli'],
    year: '2021',
    journal: 'Nature',
    doi: '10.1038/s41586-021-03819-2',
    url: 'https://www.nature.com/articles/s41586-021-03819-2',
    type: 'Computational Biology Breakthrough',
    field: 'Structural Biology & Machine Learning',
    category: 'GENOMICS & BIOTECH',
    tags: ['Protein Folding', 'AlphaFold', 'Structural Biology', 'Evoformer'],
    institution: 'Google DeepMind',
    collectionIds: ['col-general'],
    abstract:
      'Proteins are essential to life, and understanding their structure can facilitate a mechanistic understanding of their function. We present AlphaFold, a computational method that can regularly predict protein structures with atomic accuracy even when no similar structure is known. We validated this method in the CASP14 competition, demonstrating unprecedented structural prediction performance.',
  }),
  buildResearchItem({
    id: 'open-landmark-05',
    number: '05',
    title: 'Observation of Gravitational Waves from a Binary Black Hole Merger',
    shortTitle: 'Observation of Gravitational Waves',
    authors: ['B. P. Abbott', 'R. Abbott', 'T. D. Abbott', 'LIGO Scientific Collaboration & Virgo Collaboration'],
    year: '2016',
    journal: 'Physical Review Letters',
    doi: '10.1103/PhysRevLett.116.061102',
    url: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.116.061102',
    type: 'Experimental Physics Landmark',
    field: 'Relativistic Astrophysics & Gravitation',
    category: 'ASTROPHYSICS',
    tags: ['Gravitational Waves', 'LIGO', 'General Relativity', 'Black Holes'],
    institution: 'LIGO Laboratory, Caltech & MIT',
    collectionIds: ['col-general'],
    abstract:
      'On September 14, 2015 at 09:50:45 UTC, the two detectors of the Laser Interferometer Gravitational-Wave Observatory simultaneously observed a transient gravitational-wave signal. The signal matches the waveform predicted by general relativity for the inspiral and merger of a pair of black holes and the ringdown of the resulting single black hole.',
  }),
  buildResearchItem({
    id: 'open-landmark-06',
    number: '06',
    title: 'Quantum computational advantage using photons',
    shortTitle: 'Photonic Quantum Advantage',
    authors: ['Han-Sen Zhong', 'Hui Wang', 'Yu-Hao Deng', 'Chao-Yang Lu', 'Jian-Wei Pan'],
    year: '2020',
    journal: 'Science',
    doi: '10.1126/science.abe8770',
    url: 'https://www.science.org/doi/10.1126/science.abe8770',
    type: 'Experimental Quantum Computing',
    field: 'Quantum Optics & Computation',
    category: 'QUANTUM PHYSICS',
    tags: ['Quantum Advantage', 'Gaussian Boson Sampling', 'Photonic Computing'],
    institution: 'University of Science and Technology of China',
    collectionIds: ['col-general'],
    abstract:
      'Quantum computers promise to perform certain tasks that are exponentially faster than classical supercomputers. We have built a quantum computational prototype, Jiuzhang, which sent up to 76 output photons through a 100-mode interferometer to implement Gaussian boson sampling. The output state space dimension is 10^30, demonstrating quantum computational advantage without viable classical simulation.',
  }),
];

/**
 * Reconstructs standard paragraph text from OpenAlex's abstract_inverted_index
 */
function reconstructAbstract(invertedIndex: Record<string, number[]> | undefined | null): string {
  if (!invertedIndex) return '';
  const wordPositions: [number, string][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordPositions.push([pos, word]);
    }
  }
  wordPositions.sort((a, b) => a[0] - b[0]);
  return wordPositions.map(([, word]) => word).join(' ');
}

/**
 * Queries OpenAlex public open-access archives for verified academic articles by topic
 */
export async function fetchOpenAccessPapersByTopic(
  topic: string,
  count: number = 8
): Promise<{ papers: ResearchItem[]; collection: ResearchCollection }> {
  const safeTopic = topic.trim() || 'artificial intelligence';
  const encodedQuery = encodeURIComponent(safeTopic);
  const url = `https://api.openalex.org/works?search=${encodedQuery}&per-page=${count}&filter=has_doi:true,is_oa:true`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MarginaliaAcademicCompanion/1.0 (mailto:scholar@marginalia.academic)',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAlex returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) {
      throw new Error(`No open-access works found for topic "${topic}"`);
    }

    const collectionId = `col-topic-${Date.now()}`;
    const collectionName = `${safeTopic.charAt(0).toUpperCase() + safeTopic.slice(1)} Archive`;
    const categoryName = safeTopic.toUpperCase().slice(0, 24);

    const papers: ResearchItem[] = results.map((work: any, idx: number) => {
      const doiRaw = work.doi || '';
      const cleanDoi = doiRaw.replace(/^https?:\/\/doi\.org\//i, '');
      const authors = Array.isArray(work.authorships)
        ? work.authorships
            .map((a: any) => a.author?.display_name)
            .filter(Boolean)
            .slice(0, 8)
        : ['Academic Research Group'];

      const year = String(work.publication_year || new Date().getFullYear());
      const journal =
        work.primary_location?.source?.display_name ||
        work.host_venue?.display_name ||
        'Peer-Reviewed Open Access Repository';

      const reconstructed = reconstructAbstract(work.abstract_inverted_index);
      const abstract = reconstructed || `Open-access scientific investigation indexed in international registries under DOI ${cleanDoi}.`;

      const numStr = (idx + 1).toString().padStart(2, '0');

      return buildResearchItem({
        id: `oa-${work.id?.split('/')?.pop() || Date.now() + '-' + idx}`,
        number: numStr,
        title: work.title || 'Untitled Academic Investigation',
        shortTitle: (work.title || 'Academic Paper').slice(0, 36),
        authors: authors.length > 0 ? authors : ['Scholar'],
        year,
        journal,
        doi: cleanDoi || undefined,
        url: work.open_access?.oa_url || (cleanDoi ? `https://doi.org/${cleanDoi}` : undefined),
        type: work.type === 'article' ? 'Journal Article' : work.type || 'Open Access Paper',
        field: safeTopic,
        category: categoryName,
        collectionIds: [collectionId],
        tags: [safeTopic, 'Open Access', `${year}`],
        abstract,
      });
    });

    const collection: ResearchCollection = {
      id: collectionId,
      name: collectionName,
      description: `Open-access peer-reviewed literature harvested from international archives on ${safeTopic}.`,
      color: '#1F3FB0',
    };

    return { papers, collection };
  } catch (err) {
    console.warn('Network lookup failed, deploying universal landmark open-science fallback:', err);
    const collectionId = `col-landmark-${Date.now()}`;
    const collection: ResearchCollection = {
      id: collectionId,
      name: 'Universal Landmark Papers',
      description: 'Foundational open-access scientific publications across AI, Genomics, and Physics.',
      color: '#1F3FB0',
    };
    const papers = UNIVERSAL_OPEN_SCIENCE_PAPERS.map((p) => ({
      ...p,
      collectionIds: [collectionId],
    }));
    return { papers, collection };
  }
}
