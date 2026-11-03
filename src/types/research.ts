export type ReadingStatus =
  | 'inbox'
  | 'to_read'
  | 'reading'
  | 'paused'
  | 'completed'
  | 'reference_only'
  | 'archived';

export type PriorityLevel = 'low' | 'medium' | 'high';

export type HighlightColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange';

export type ShelfWoodMaterial =
  | 'walnut'
  | 'oak'
  | 'mahogany'
  | 'ebony'
  | 'light_wood'
  | 'paper';

export type BookCoverStyle =
  | 'leather'
  | 'journal'
  | 'cloth'
  | 'botanical'
  | 'editorial'
  | 'archival'
  | 'hardcover'
  | 'modern';

export type BookMaterialFinish =
  | 'leather'
  | 'cloth'
  | 'textured_paper'
  | 'aged_paper'
  | 'matte_hardcover'
  | 'printed';

export type BookSizePreset = 'slim' | 'standard' | 'thick' | 'large';

export type ShelfSortMode =
  | 'custom'
  | 'recent'
  | 'year'
  | 'title'
  | 'author'
  | 'status';

export type SpineEmblemType =
  | 'wheat'
  | 'basket'
  | 'landscape'
  | 'compass'
  | 'chart'
  | 'eye'
  | 'terroir'
  | 'vr'
  | 'cart'
  | 'sprout'
  | 'olive'
  | 'network';

export interface CollectionAppearance {
  spineColor: string;
  coverStyle: BookCoverStyle;
  material: BookMaterialFinish;
  bookSize: BookSizePreset;
  sortingMode?: ShelfSortMode;
}

export interface BookAppearanceOverride {
  spineTitle?: string;
  typeCode?: string;
  spineEmblem?: SpineEmblemType;
  customSpineColor?: string;
  customCoverStyle?: BookCoverStyle;
  customMaterial?: BookMaterialFinish;
  customSize?: BookSizePreset;
}

export interface Highlight {
  id: string;
  paperId: string;
  pageNumber: number;
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: string;
}

export interface Annotation {
  id: string;
  paperId: string;
  pageNumber?: number;
  title?: string;
  content: string;
  type: 'comment' | 'insight' | 'question' | 'quote';
  createdAt: string;
}

export interface Bookmark {
  id: string;
  paperId: string;
  pageNumber: number;
  label: string;
  createdAt: string;
}

export interface ReadingSession {
  id: string;
  paperId: string;
  date: string; // ISO date YYYY-MM-DD
  durationMinutes: number;
  pagesRead: number;
}

export interface LiteratureSynthesisData {
  researchQuestion?: string;
  mainThemes?: string[];
  supportingEvidence?: string[];
  contradictoryFindings?: string[];
  methodologicalDifferences?: string[];
  gaps?: string[];
  keyReferences?: string[];
}

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  type: 'paper' | 'general' | 'synthesis';
  paperIds: string[];
  collectionIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  synthesisData?: LiteratureSynthesisData;
}

export interface ResearchCollection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
  isSmart?: boolean;
  appearance?: CollectionAppearance;
  smartFilter?: {
    readingStatus?: ReadingStatus;
    minYear?: number;
    hasPdf?: boolean;
    hasNotes?: boolean;
    tag?: string;
    priority?: PriorityLevel;
  };
}

export interface ReadingGoal {
  id: string;
  type: 'papers_per_week' | 'minutes_per_day' | 'papers_per_month';
  label: string;
  target: number;
  period: 'daily' | 'weekly' | 'monthly';
  current: number;
}

export interface ActivityLog {
  id: string;
  type:
    | 'added_paper'
    | 'finished_paper'
    | 'highlighted'
    | 'created_note'
    | 'changed_status'
    | 'imported'
    | 'profile_created';
  description: string;
  timestamp: string;
  paperId?: string;
  paperTitle?: string;
}

export interface VisualMaterialData {
  type:
    | 'literature-map'
    | 'digital-flow'
    | 'nudging-experiment'
    | 'creda-roadmap'
    | 'gi-map'
    | 'gi-database'
    | 'biovalue-matrix'
    | 'eye-tracking-sim'
    | string;
  title: string;
  caption: string;
  metrics?: { label: string; value: string; detail?: string }[];
}

export interface ResearchResource {
  label: string;
  actionType:
    | 'copy-citation'
    | 'schema-viewer'
    | 'download-summary'
    | 'request-preprint'
    | 'external-link';
  url?: string;
  available: boolean;
  meta?: string;
}

export type ResearchCategory = string;

export interface ResearchItem {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  authors: string[];
  year: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfContentText?: string;
  extractedText?: string;
  methodology?: string;
  findings?: string;
  importance?: number;
  priority?: PriorityLevel;
  rating?: number;
  pageCount?: number;
  type: string;
  status: string; // e.g. 'Published', 'Manuscript prepared'
  readingStatus: ReadingStatus;
  readingProgress: {
    currentPage: number;
    totalPages: number;
    percent: number;
    lastReadAt?: string;
    totalReadingTimeMinutes: number;
  };
  evaluation: {
    importance: PriorityLevel;
    relevance: PriorityLevel;
    rating: number; // 1-5
    priority: PriorityLevel;
  };
  field: string;
  category: string;
  secondaryCategories?: string[];
  collectionIds: string[];
  tags: string[];
  institution?: string;
  topics: string[];
  methods: string[];
  tools?: string[];
  dataSources?: string;
  sample?: string;
  focus: string;
  abstract: string;
  objectives: string[];
  researchQuestions: string[];
  keyFindings?: string[];
  contributions: string[];
  collaborators?: string[];
  spineAccent: string;
  coverPalette: {
    bg: string;
    text: string;
    accent: string;
    motif: string;
  };
  bookAppearance?: BookAppearanceOverride;
  visualMaterial: VisualMaterialData;
  resources: ResearchResource[];
}

export interface MethodologyCard {
  id: string;
  title: string;
  category: string;
  associatedTechniques: string[];
  scientificApplications: string;
  workflow: string[];
  tools: string[];
  associatedResearchIds: string[];
}

export interface ResearcherProfile {
  id: string;
  name: string;
  title: string;
  program: string;
  primaryAffiliation: string;
  secondaryAffiliations: string[];
  academicBackground: {
    degree: string;
    field: string;
    institution?: string;
    year?: string;
  }[];
  researchPillars: {
    title: string;
    description: string;
  }[];
  currentEnvironment: {
    institution: string;
    role: string;
    details: string;
  }[];
  previousExperience: {
    institution: string;
    project: string;
    period?: string;
    focus: string;
  }[];
  technicalExpertise: {
    category: string;
    skills: string[];
  }[];
  verifiedLinks: {
    label: string;
    handle?: string;
    url?: string;
    available: boolean;
  }[];
}

export interface CategoryDefinition {
  id: string;
  label: string;
  shortLabel?: string;
  isCustom?: boolean;
  appearance?: CollectionAppearance;
}
