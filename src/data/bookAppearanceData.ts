import {
  BookCoverStyle,
  BookMaterialFinish,
  BookSizePreset,
  CollectionAppearance,
  ResearchItem,
  ShelfWoodMaterial,
  SpineEmblemType,
} from '../types/research';

export interface SpineColorPreset {
  id: string;
  label: string;
  hex: string;
  isLight?: boolean;
}

export const VINTAGE_SPINE_COLORS: SpineColorPreset[] = [
  { id: 'forest_green', label: 'Forest Green', hex: '#234233' },
  { id: 'burgundy', label: 'Burgundy Cloth', hex: '#742421' },
  { id: 'navy_blue', label: 'Navy Blue', hex: '#203E5F' },
  { id: 'cream', label: 'Aged Cream', hex: '#D5CBB8', isLight: true },
  { id: 'olive_green', label: 'Olive Green', hex: '#3B4F37' },
  { id: 'antique_brown', label: 'Antique Brown', hex: '#4B3628' },
  { id: 'dark_walnut', label: 'Dark Walnut', hex: '#2D3C35' },
  { id: 'ochre', label: 'Parchment Ochre', hex: '#CEBE9E', isLight: true },
  { id: 'terracotta', label: 'Terracotta Red', hex: '#862B24' },
  { id: 'dusty_blue', label: 'Dusty Prussian', hex: '#2B4865' },
  { id: 'charcoal', label: 'Charcoal Leather', hex: '#262523' },
  { id: 'vintage_mustard', label: 'Vintage Mustard', hex: '#8E6D2F' },
];

export interface ShelfMaterialOption {
  id: ShelfWoodMaterial;
  label: string;
  description: string;
  topSurface: string;
  frontEdge: string;
  bottomLip: string;
  grainColor: string;
  borderTop: string;
  shadowColor: string;
}

export const SHELF_WOOD_MATERIALS: ShelfMaterialOption[] = [
  {
    id: 'walnut',
    label: 'Dark Walnut',
    description: 'Deep library walnut with rich horizontal grain and aged patina',
    topSurface: 'linear-gradient(180deg, #3A2516 0%, #4E3320 65%, #3D2718 100%)',
    frontEdge: 'linear-gradient(180deg, #563924 0%, #3F2817 45%, #2C1B0E 100%)',
    bottomLip: '#1E1209',
    grainColor: 'rgba(20, 10, 4, 0.42)',
    borderTop: 'rgba(255, 225, 190, 0.22)',
    shadowColor: 'rgba(18, 11, 6, 0.55)',
  },
  {
    id: 'oak',
    label: 'Natural Oak',
    description: 'Warm honeyed European oak timber with classic collegiate character',
    topSurface: 'linear-gradient(180deg, #7B5636 0%, #946B47 65%, #7E5939 100%)',
    frontEdge: 'linear-gradient(180deg, #9E744F 0%, #835C3B 50%, #65452A 100%)',
    bottomLip: '#4A311C',
    grainColor: 'rgba(58, 34, 14, 0.32)',
    borderTop: 'rgba(255, 240, 215, 0.32)',
    shadowColor: 'rgba(35, 22, 10, 0.45)',
  },
  {
    id: 'mahogany',
    label: 'Aged Mahogany',
    description: 'Reddish-brown heirloom mahogany from 19th-century reading rooms',
    topSurface: 'linear-gradient(180deg, #421C16 0%, #5B2820 65%, #471E17 100%)',
    frontEdge: 'linear-gradient(180deg, #682E25 0%, #4C2019 50%, #33130E 100%)',
    bottomLip: '#240C09',
    grainColor: 'rgba(28, 6, 4, 0.45)',
    borderTop: 'rgba(255, 205, 190, 0.22)',
    shadowColor: 'rgba(25, 8, 6, 0.55)',
  },
  {
    id: 'ebony',
    label: 'Dark Antique Wood',
    description: 'Charred espresso library timber with subtle bronze highlights',
    topSurface: 'linear-gradient(180deg, #221B17 0%, #302722 65%, #241D18 100%)',
    frontEdge: 'linear-gradient(180deg, #382E28 0%, #261F1B 50%, #171210 100%)',
    bottomLip: '#0F0C0A',
    grainColor: 'rgba(0, 0, 0, 0.55)',
    borderTop: 'rgba(255, 235, 215, 0.16)',
    shadowColor: 'rgba(10, 8, 6, 0.62)',
  },
  {
    id: 'oxford_noir',
    label: 'Oxford Noir Ebony',
    description: 'Deep blackened charred oak with inlaid antique brass bevel, crafted for nocturne study',
    topSurface: 'linear-gradient(180deg, #161310 0%, #221D18 65%, #181411 100%)',
    frontEdge: 'linear-gradient(180deg, #28221C 0%, #1A1612 50%, #100D0A 100%)',
    bottomLip: '#080605',
    grainColor: 'rgba(212, 175, 55, 0.18)',
    borderTop: 'rgba(212, 175, 55, 0.45)',
    shadowColor: 'rgba(0, 0, 0, 0.85)',
  },
  {
    id: 'scandinavian_birch',
    label: 'Scandinavian Birch',
    description: 'Minimalist blonde Nordic timber with pale silver grain and satin lacquer',
    topSurface: 'linear-gradient(180deg, #CBB69A 0%, #E2D3BA 65%, #C8B294 100%)',
    frontEdge: 'linear-gradient(180deg, #DCCBB0 0%, #C4B194 50%, #A89578 100%)',
    bottomLip: '#7D6C54',
    grainColor: 'rgba(90, 70, 48, 0.22)',
    borderTop: 'rgba(255, 255, 255, 0.55)',
    shadowColor: 'rgba(50, 40, 25, 0.32)',
  },
  {
    id: 'light_wood',
    label: 'Light Vintage Wood',
    description: 'Sun-bleached Nordic ash and birch with delicate fine grain',
    topSurface: 'linear-gradient(180deg, #A98E6E 0%, #C2A887 65%, #B09574 100%)',
    frontEdge: 'linear-gradient(180deg, #CBB292 0%, #B29674 50%, #947A5B 100%)',
    bottomLip: '#6E583F',
    grainColor: 'rgba(85, 62, 38, 0.25)',
    borderTop: 'rgba(255, 250, 240, 0.45)',
    shadowColor: 'rgba(45, 34, 22, 0.35)',
  },
  {
    id: 'paper',
    label: 'Minimalist Paper Shelf',
    description: 'Original architectural off-white museum plinth with accession ticks',
    topSurface: 'linear-gradient(180deg, #DFDBD2 0%, #D4CFC4 100%)',
    frontEdge: 'linear-gradient(180deg, #C9C3B6 0%, #B8B1A2 100%)',
    bottomLip: '#9E9788',
    grainColor: 'rgba(20, 20, 20, 0.08)',
    borderTop: 'rgba(255, 255, 255, 0.55)',
    shadowColor: 'rgba(20, 20, 20, 0.22)',
  },
];

export const BOOK_COVER_STYLES: {
  id: BookCoverStyle;
  label: string;
  description: string;
}[] = [
  {
    id: 'archival',
    label: 'Archival Paper',
    description: 'Warm weathered parchment with cobalt or sepia etching illustration',
  },
  {
    id: 'leather',
    label: 'Classic Leather-Bound',
    description: 'Rich full-grain leather binding with embossed gold foil frame',
  },
  {
    id: 'journal',
    label: 'Vintage Academic Journal',
    description: 'Monograph issue layout with double rules and scholarly imprint',
  },
  {
    id: 'cloth',
    label: 'Antique Clothbound',
    description: 'Woven bookcloth texture with inset paper title label',
  },
  {
    id: 'botanical',
    label: 'Botanical Scientific',
    description: 'Natural history field guide frame with specimen line-art',
  },
  {
    id: 'editorial',
    label: 'Minimalist Editorial',
    description: 'High-contrast contemporary literary journal typography',
  },
  {
    id: 'hardcover',
    label: 'Traditional Library Hardcover',
    description: 'Buckram library binding with stamped spine and corner guards',
  },
  {
    id: 'modern',
    label: 'Modern Academic Publication',
    description: 'Clean geometric university press layout with bold accent band',
  },
];

export const BOOK_MATERIAL_FINISHES: {
  id: BookMaterialFinish;
  label: string;
}[] = [
  { id: 'leather', label: 'Full-Grain Leather' },
  { id: 'cloth', label: 'Woven Bookcloth' },
  { id: 'aged_paper', label: 'Aged Parchment Paper' },
  { id: 'textured_paper', label: 'Laid Cotton Paper' },
  { id: 'matte_hardcover', label: 'Matte Buckram Hardcover' },
  { id: 'printed', label: 'Classic Printed Cover' },
];

export const BOOK_SIZE_PRESETS: {
  id: BookSizePreset;
  label: string;
  spineWidthDesktop: number;
  spineWidthTablet: number;
  spineWidthMobile: number;
  heightOffset: number;
}[] = [
  {
    id: 'slim',
    label: 'Slim Journal',
    spineWidthDesktop: 60,
    spineWidthTablet: 52,
    spineWidthMobile: 44,
    heightOffset: -8,
  },
  {
    id: 'standard',
    label: 'Standard Academic Book',
    spineWidthDesktop: 70,
    spineWidthTablet: 58,
    spineWidthMobile: 48,
    heightOffset: 0,
  },
  {
    id: 'thick',
    label: 'Thick Monograph',
    spineWidthDesktop: 78,
    spineWidthTablet: 64,
    spineWidthMobile: 52,
    heightOffset: 6,
  },
  {
    id: 'large',
    label: 'Large Reference Volume',
    spineWidthDesktop: 86,
    spineWidthTablet: 70,
    spineWidthMobile: 56,
    heightOffset: 12,
  },
];

export const SPINE_EMBLEM_OPTIONS: {
  id: SpineEmblemType;
  label: string;
}[] = [
  { id: 'wheat', label: 'Botanical Wheat Stalk' },
  { id: 'basket', label: 'Market Basket' },
  { id: 'landscape', label: 'Agro-Ecological Landscape' },
  { id: 'compass', label: 'Choice Vector Compass' },
  { id: 'chart', label: 'Econometric Bar Chart' },
  { id: 'eye', label: 'Neuro-Gaze Eye' },
  { id: 'terroir', label: 'Terroir & Cypress Hills' },
  { id: 'vr', label: 'Immersive VR Headset' },
  { id: 'cart', label: 'Retail Trolley' },
  { id: 'sprout', label: 'Seedling & Leaf' },
  { id: 'olive', label: 'Mediterranean Olive Branch' },
  { id: 'network', label: 'Data Topology Nodes' },
];

export const DEFAULT_CATEGORY_APPEARANCES: Record<string, CollectionAppearance> = {
  ALL: {
    spineColor: '#234233',
    coverStyle: 'archival',
    material: 'leather',
    bookSize: 'standard',
    sortingMode: 'custom',
  },
  'FOOD SYSTEMS': {
    spineColor: '#234233', // Forest green leather
    coverStyle: 'botanical',
    material: 'leather',
    bookSize: 'standard',
    sortingMode: 'custom',
  },
  'CONSUMER BEHAVIOUR': {
    spineColor: '#742421', // Burgundy cloth
    coverStyle: 'cloth',
    material: 'cloth',
    bookSize: 'standard',
    sortingMode: 'custom',
  },
  'BIG DATA': {
    spineColor: '#203E5F', // Navy blue
    coverStyle: 'archival',
    material: 'leather',
    bookSize: 'thick',
    sortingMode: 'custom',
  },
  'IMMERSIVE TECHNOLOGIES': {
    spineColor: '#4B3628', // Antique brown
    coverStyle: 'journal',
    material: 'leather',
    bookSize: 'standard',
    sortingMode: 'custom',
  },
  BIODIVERSITY: {
    spineColor: '#3B4F37', // Olive green
    coverStyle: 'botanical',
    material: 'cloth',
    bookSize: 'thick',
    sortingMode: 'custom',
  },
  'DIGITAL INNOVATION': {
    spineColor: '#2D3C35', // Dark walnut / deep slate green
    coverStyle: 'journal',
    material: 'leather',
    bookSize: 'standard',
    sortingMode: 'custom',
  },
  'RESEARCH PROJECTS': {
    spineColor: '#CEBE9E', // Aged parchment ochre
    coverStyle: 'archival',
    material: 'aged_paper',
    bookSize: 'standard',
    sortingMode: 'custom',
  },
  METHODOLOGY: {
    spineColor: '#4B3628', // Antique brown
    coverStyle: 'leather',
    material: 'leather',
    bookSize: 'thick',
    sortingMode: 'custom',
  },
};

// Reference-image-inspired per-item defaults so existing localStorage items without `bookAppearance`
// automatically render with the rich vintage library palette from the reference artwork.
const ITEM_VINTAGE_DEFAULTS: Record<
  string,
  {
    spineTitle: string;
    typeCode: string;
    spineEmblem: SpineEmblemType;
    spineColor: string;
    coverStyle: BookCoverStyle;
    material: BookMaterialFinish;
    bookSize: BookSizePreset;
  }
> = {
  'item-v01': {
    spineTitle: 'SUSTAINABLE DIETS',
    typeCode: 'REV',
    spineEmblem: 'wheat',
    spineColor: '#D5CBB8',
    coverStyle: 'botanical',
    material: 'aged_paper',
    bookSize: 'standard',
  },
  'item-v02': {
    spineTitle: 'CONSUMER CHOICE',
    typeCode: 'EMP',
    spineEmblem: 'basket',
    spineColor: '#742421',
    coverStyle: 'cloth',
    material: 'cloth',
    bookSize: 'standard',
  },
  'item-v03': {
    spineTitle: 'FOOD ENVIRONMENTS',
    typeCode: 'REV',
    spineEmblem: 'landscape',
    spineColor: '#203E5F',
    coverStyle: 'archival',
    material: 'cloth',
    bookSize: 'standard',
  },
  'item-v04': {
    spineTitle: 'NUDGING & BEHAVIOUR',
    typeCode: 'EXP',
    spineEmblem: 'compass',
    spineColor: '#CBBFA8',
    coverStyle: 'journal',
    material: 'aged_paper',
    bookSize: 'slim',
  },
  'item-06': {
    spineTitle: 'BIG DATA IN FOOD',
    typeCode: 'REV',
    spineEmblem: 'chart',
    spineColor: '#263B34',
    coverStyle: 'leather',
    material: 'leather',
    bookSize: 'thick',
  },
  'item-08': {
    spineTitle: 'VR & EYE TRACKING',
    typeCode: 'EMP',
    spineEmblem: 'eye',
    spineColor: '#4B3628',
    coverStyle: 'leather',
    material: 'leather',
    bookSize: 'standard',
  },
  'item-05': {
    spineTitle: 'GEOGRAPHICAL INDICATIONS',
    typeCode: 'PROJ',
    spineEmblem: 'terroir',
    spineColor: '#D2C6B2',
    coverStyle: 'archival',
    material: 'aged_paper',
    bookSize: 'standard',
  },
  'item-01': {
    spineTitle: 'CONSUMER TRENDS & BIG DATA',
    typeCode: 'REV',
    spineEmblem: 'terroir',
    spineColor: '#203E5F',
    coverStyle: 'archival',
    material: 'aged_paper',
    bookSize: 'thick',
  },
  'item-02': {
    spineTitle: 'DIGITAL FOOD INTERACTIONS',
    typeCode: 'REV',
    spineEmblem: 'vr',
    spineColor: '#253D32',
    coverStyle: 'leather',
    material: 'leather',
    bookSize: 'standard',
  },
  'item-03': {
    spineTitle: 'FIELD EXPERIMENT',
    typeCode: 'EXP',
    spineEmblem: 'chart',
    spineColor: '#7A2622',
    coverStyle: 'cloth',
    material: 'cloth',
    bookSize: 'standard',
  },
};

export function isLightSpineColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58;
}

export function deriveShortTypeCode(item: ResearchItem): string {
  if (item.bookAppearance?.typeCode) return item.bookAppearance.typeCode;
  if (ITEM_VINTAGE_DEFAULTS[item.id]?.typeCode) return ITEM_VINTAGE_DEFAULTS[item.id].typeCode;
  const t = (item.type || '').toLowerCase();
  if (t.includes('review') || t.includes('synthesis')) return 'REV';
  if (t.includes('experiment')) return 'EXP';
  if (t.includes('project') || t.includes('initiative')) return 'PROJ';
  if (t.includes('data') || t.includes('empirical') || t.includes('method')) return 'EMP';
  return 'ART';
}

export function deriveSpineEmblem(item: ResearchItem, index: number): SpineEmblemType {
  if (item.bookAppearance?.spineEmblem) return item.bookAppearance.spineEmblem;
  if (ITEM_VINTAGE_DEFAULTS[item.id]?.spineEmblem) return ITEM_VINTAGE_DEFAULTS[item.id].spineEmblem;
  const cat = (item.category || '').toUpperCase();
  const title = (item.title || '').toLowerCase();
  if (title.includes('eye') || title.includes('virtual reality') || cat.includes('IMMERSIVE')) return 'eye';
  if (title.includes('supermarket') || title.includes('nudg')) return 'cart';
  if (title.includes('geographical') || title.includes('terroir')) return 'terroir';
  if (cat.includes('BIODIVERSITY') || title.includes('biodiversity') || title.includes('ecology')) return 'olive';
  if (title.includes('digital')) return 'vr';
  if (cat.includes('BIG DATA')) return 'chart';
  if (cat.includes('FOOD SYSTEMS')) return 'wheat';
  if (cat.includes('CONSUMER')) return 'basket';
  const all: SpineEmblemType[] = [
    'wheat',
    'basket',
    'landscape',
    'compass',
    'chart',
    'eye',
    'terroir',
    'vr',
    'cart',
    'sprout',
    'olive',
    'network',
  ];
  return all[index % all.length];
}

export function resolveBookAppearance(
  item: ResearchItem,
  index: number,
  categoryAppearances: Record<string, CollectionAppearance> = DEFAULT_CATEGORY_APPEARANCES
) {
  const catDefault =
    categoryAppearances[item.category] ||
    DEFAULT_CATEGORY_APPEARANCES[item.category] ||
    DEFAULT_CATEGORY_APPEARANCES.ALL;

  const itemPreset = ITEM_VINTAGE_DEFAULTS[item.id];
  const ov = item.bookAppearance || {};

  const spineColor =
    ov.customSpineColor ||
    itemPreset?.spineColor ||
    catDefault.spineColor ||
    VINTAGE_SPINE_COLORS[index % VINTAGE_SPINE_COLORS.length].hex;

  const coverStyle: BookCoverStyle =
    ov.customCoverStyle || itemPreset?.coverStyle || catDefault.coverStyle || 'archival';

  const material: BookMaterialFinish =
    ov.customMaterial || itemPreset?.material || catDefault.material || 'leather';

  const bookSize: BookSizePreset =
    ov.customSize || itemPreset?.bookSize || catDefault.bookSize || 'standard';

  const sizeConfig =
    BOOK_SIZE_PRESETS.find((s) => s.id === bookSize) || BOOK_SIZE_PRESETS[1];

  const spineTitle = (
    ov.spineTitle ||
    itemPreset?.spineTitle ||
    item.shortTitle ||
    item.title
  ).toUpperCase();

  const typeCode = deriveShortTypeCode(item);
  const spineEmblem = deriveSpineEmblem(item, index);
  const isLight = isLightSpineColor(spineColor);

  // Subtle deterministic height and lean variation so books feel like a real physical shelf
  const hash = item.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const microHeightDelta = ((hash % 5) - 2) * 3 + sizeConfig.heightOffset;
  const microLeanDeg = ((hash % 7) - 3) * 0.22;

  return {
    spineColor,
    coverStyle,
    material,
    bookSize,
    sizeConfig,
    spineTitle,
    typeCode,
    spineEmblem,
    isLight,
    microHeightDelta,
    microLeanDeg,
  };
}
