import React, { useState, useEffect } from 'react';
import { ResearchItem, CategoryDefinition } from '../types/research';
import { PhysicalCover } from './PhysicalCover';
import { X, Plus, Trash2, Check, Sparkles, BookOpen } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ResearchItem) => void;
  initialItem?: ResearchItem | null;
  categories: CategoryDefinition[];
  onAddNewCategory?: (catName: string) => void;
}

const MOTIF_OPTIONS = [
  { id: 'bibliometric-network', label: 'Bibliometric Network (Nodes & Clusters)' },
  { id: 'digital-interaction', label: 'Digital Choice Flow (Screen & Heuristics)' },
  { id: 'nudging-matrix', label: '2×2 Factorial Matrix (Nudging & Control)' },
  { id: 'creda-consortium', label: 'Agri-Food Intersection (Consortium Rings)' },
  { id: 'gi-smart-map', label: 'Terroir & GI Contour (Geographical Map)' },
  { id: 'gi-database-schema', label: 'Relational Schema (Data Pipeline & SQL)' },
  { id: 'biovalue-agro', label: 'Agro-Biodiversity Cycle (Botanical Rings)' },
  { id: 'eye-tracking-gaze', label: '120Hz Eye-Tracking Gaze (Saccades & Heat)' },
] as const;

const PALETTE_OPTIONS = [
  { bg: '#141414', text: '#EDEBE6', accent: '#3B82F6', label: 'Midnight Archival' },
  { bg: '#EDEBE6', text: '#141414', accent: '#1F3FB0', label: 'Alabaster Paper' },
  { bg: '#EDEBE6', text: '#141414', accent: '#536B52', label: 'Sage Ecological' },
  { bg: '#1E293B', text: '#F8FAFC', accent: '#60A5FA', label: 'Deep Lapis' },
  { bg: '#1F3FB0', text: '#FFFFFF', accent: '#93C5FD', label: 'Cobalt Monograph' },
  { bg: '#232723', text: '#F4F2ED', accent: '#86EFAC', label: 'Forest Terroir' },
];

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  categories,
  onAddNewCategory,
}) => {
  const isEditing = !!initialItem;

  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [type, setType] = useState('Experimental Research');
  const [status, setStatus] = useState('Published');
  const [field, setField] = useState('Sustainable Food Systems');
  const [category, setCategory] = useState(categories[1]?.id || 'FOOD SYSTEMS');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [year, setYear] = useState('2026');
  const [institution, setInstitution] = useState('University of Parma');
  const [abstract, setAbstract] = useState('');
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [researchQuestions, setResearchQuestions] = useState<string[]>(['']);
  const [methods, setMethods] = useState<string>('Field experiment, quantitative analysis');
  const [tools, setTools] = useState<string>('Python, R, Survey platform');
  const [dataSources, setDataSources] = useState<string>('Retail scanner logs & participant surveys');
  const [sample, setSample] = useState<string>('N = 250 experimental participants');
  const [keyFindings, setKeyFindings] = useState<string[]>(['']);
  const [contributions, setContributions] = useState<string[]>(['']);
  const [collaborators, setCollaborators] = useState<string>('University research consortium');
  const [spineAccent, setSpineAccent] = useState('#1F3FB0');
  const [selectedPalette, setSelectedPalette] = useState(PALETTE_OPTIONS[0]);
  const [motif, setMotif] = useState<(typeof MOTIF_OPTIONS)[number]['id']>('bibliometric-network');

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setShortTitle(initialItem.shortTitle);
      setType(initialItem.type);
      setStatus(initialItem.status);
      setField(initialItem.field);
      setCategory(initialItem.category);
      setYear(initialItem.year);
      setInstitution(initialItem.institution || '');
      setAbstract(initialItem.abstract);
      setObjectives(initialItem.objectives?.length ? initialItem.objectives : ['']);
      setResearchQuestions(initialItem.researchQuestions?.length ? initialItem.researchQuestions : ['']);
      setMethods(initialItem.methods.join(', '));
      setTools(initialItem.tools ? initialItem.tools.join(', ') : '');
      setDataSources(initialItem.dataSources || '');
      setSample(initialItem.sample || '');
      setKeyFindings(initialItem.keyFindings?.length ? initialItem.keyFindings : ['']);
      setContributions(initialItem.contributions?.length ? initialItem.contributions : ['']);
      setCollaborators(initialItem.collaborators ? initialItem.collaborators.join(' · ') : '');
      setSpineAccent(initialItem.spineAccent || '#1F3FB0');
      const foundPalette = PALETTE_OPTIONS.find((p) => p.bg === initialItem.coverPalette.bg) || {
        bg: initialItem.coverPalette.bg,
        text: initialItem.coverPalette.text,
        accent: initialItem.coverPalette.accent,
        label: 'Custom',
      };
      setSelectedPalette(foundPalette);
      setMotif(initialItem.coverPalette.motif as any);
    } else {
      // Default blank template
      setTitle('');
      setShortTitle('');
      setType('Experimental Research');
      setStatus('Published');
      setField('Sustainable Consumption & Behaviour');
      setCategory(categories[1]?.id || 'FOOD SYSTEMS');
      setYear('2026');
      setInstitution('University of Parma');
      setAbstract('');
      setObjectives(['Investigate consumer responsiveness to sustainable food labels.']);
      setResearchQuestions(['Does visual placement alter purchasing decisions?']);
      setMethods('Discrete choice experiment, eye tracking');
      setTools('Python, R');
      setDataSources('Experimental laboratory session records');
      setSample('N = 180 participants');
      setKeyFindings(['Significant 34% increase in eco-label selection.']);
      setContributions(['Open experimental protocol for food policy researchers.']);
      setCollaborators('University of Parma Behavioural Research Unit');
      setSpineAccent('#1F3FB0');
      setSelectedPalette(PALETTE_OPTIONS[0]);
      setMotif('bibliometric-network');
    }
  }, [initialItem, categories]);

  if (!isOpen) return null;

  const handleArrayChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const handleRemoveArrayItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalCategory = category;
    if (category === '__NEW__' && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim().toUpperCase();
      if (onAddNewCategory) {
        onAddNewCategory(finalCategory);
      }
    }

    const itemNumber = initialItem ? initialItem.number : String(Math.floor(Math.random() * 90) + 10);
    const itemId = initialItem ? initialItem.id : `item-custom-${Date.now()}`;

    const updatedItem: ResearchItem = {
      id: itemId,
      number: itemNumber,
      title: title.trim(),
      shortTitle: (shortTitle || title).trim().slice(0, 36),
      authors: initialItem?.authors || ['Amine Zouaghi'],
      readingStatus: initialItem?.readingStatus || 'to_read',
      readingProgress: initialItem?.readingProgress || {
        currentPage: 1,
        totalPages: 20,
        percent: 0,
        totalReadingTimeMinutes: 0,
      },
      evaluation: initialItem?.evaluation || {
        importance: 'medium',
        relevance: 'medium',
        rating: 4,
        priority: 'medium',
      },
      collectionIds: initialItem?.collectionIds || [],
      tags: initialItem?.tags || [finalCategory],
      type,
      status,
      field: field.trim(),
      category: finalCategory,
      secondaryCategories: [finalCategory],
      year: year.trim() || '2026',
      institution: institution.trim(),
      topics: [field, finalCategory, 'Empirical Analysis'],
      methods: methods.split(',').map((s) => s.trim()).filter(Boolean),
      tools: tools.split(',').map((s) => s.trim()).filter(Boolean),
      dataSources: dataSources.trim(),
      sample: sample.trim(),
      focus: abstract.slice(0, 160) + '...',
      abstract: abstract.trim(),
      objectives: objectives.filter((s) => s.trim().length > 0),
      researchQuestions: researchQuestions.filter((s) => s.trim().length > 0),
      keyFindings: keyFindings.filter((s) => s.trim().length > 0),
      contributions: contributions.filter((s) => s.trim().length > 0),
      collaborators: collaborators.split('·').map((s) => s.trim()).filter(Boolean),
      spineAccent,
      coverPalette: {
        bg: selectedPalette.bg,
        text: selectedPalette.text,
        accent: selectedPalette.accent,
        motif,
      },
      visualMaterial: initialItem?.visualMaterial || {
        type: 'literature-map',
        title: `${shortTitle || title} Methodology Overview`,
        caption: `Visual framework and experimental metrics for Archive VOL. ${itemNumber}`,
        metrics: [
          { label: 'Year', value: year, detail: type },
          { label: 'Category', value: finalCategory, detail: status },
        ],
      },
      resources: initialItem?.resources || [
        {
          label: 'Request Working Paper Pre-Print',
          actionType: 'request-preprint',
          available: true,
        },
        {
          label: 'Copy BibTeX Citation',
          actionType: 'copy-citation',
          available: true,
        },
      ],
    };

    playTactileClick();
    onSave(updatedItem);
    onClose();
  };

  // Dummy item for live cover preview
  const previewItem: ResearchItem = {
    id: 'preview',
    number: initialItem?.number || 'NEW',
    title: title || 'Title of Scientific Publication',
    shortTitle: shortTitle || 'Short Title',
    authors: initialItem?.authors || ['Amine Zouaghi'],
    readingStatus: 'reading',
    readingProgress: {
      currentPage: 1,
      totalPages: 20,
      percent: 0,
      totalReadingTimeMinutes: 0,
    },
    evaluation: {
      importance: 'medium',
      relevance: 'medium',
      rating: 4,
      priority: 'medium',
    },
    collectionIds: [],
    tags: [],
    type,
    status,
    field: field || 'Field of Research',
    category: category === '__NEW__' ? customCategoryInput || 'CUSTOM' : category,
    year: year || '2026',
    institution: institution || 'Academic Institution',
    topics: [],
    methods: [],
    focus: '',
    abstract: '',
    objectives: [],
    researchQuestions: [],
    contributions: [],
    spineAccent,
    coverPalette: {
      bg: selectedPalette.bg,
      text: selectedPalette.text,
      accent: selectedPalette.accent,
      motif,
    },
    visualMaterial: {
      type: 'literature-map',
      title: 'Preview',
      caption: '',
    },
    resources: [],
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Publication Editor"
    >
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-[#F4F2ED] text-[#141414] border border-[#141414]/25 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/15 bg-[#EDEBE6]">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#77736B]">
            <span className="text-[#141414] font-bold">
              {isEditing ? 'EDIT ARCHIVE PUBLICATION' : 'ADD NEW RESEARCH PUBLICATION TO SHELF'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#1F3FB0]">COMPANION AUTHORING STUDIO</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#141414]/20 hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
            aria-label="Close Editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Form + Live 3D Preview */}
        <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left / Middle: Form Fields (8 cols) */}
          <div className="lg:col-span-8 p-6 overflow-y-auto space-y-6 border-r border-[#141414]/15">
            {/* Title & Short Title */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#77736B] mb-1">
                  Full Research Title *
                </label>
                <textarea
                  rows={2}
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Encouraging Sustainable Dietary Transitions Through High-Frequency Scanner Telemetry"
                  className="w-full p-2.5 bg-white border border-[#141414]/25 text-sm font-serif leading-snug focus:border-[#1F3FB0] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#77736B] mb-1">
                    Spine Short Title (Max 35 chars)
                  </label>
                  <input
                    type="text"
                    maxLength={35}
                    value={shortTitle}
                    onChange={(e) => setShortTitle(e.target.value)}
                    placeholder="e.g. Dietary Transitions & POS"
                    className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono focus:border-[#1F3FB0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#77736B] mb-1">
                    Research Area / Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono focus:border-[#1F3FB0] focus:outline-hidden"
                  >
                    {categories
                      .filter((c) => c.id !== 'ALL')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    <option value="__NEW__">+ Add Custom Category...</option>
                  </select>
                </div>
              </div>

              {category === '__NEW__' && (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#1F3FB0] mb-1">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="e.g. AGROECOLOGY, NEUROBIOLOGY, CIRCULAR SYSTEMS"
                    className="w-full p-2 bg-white border border-[#1F3FB0] text-xs font-mono focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Publication Type, Status, Year & Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1">
                  Publication Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono"
                >
                  <option value="Systematic Literature Review">Systematic Literature Review</option>
                  <option value="State-of-the-Art Review">State-of-the-Art Review</option>
                  <option value="Experimental Research">Experimental Research</option>
                  <option value="Research Project">Research Project</option>
                  <option value="European Research Initiative">European Research Initiative</option>
                  <option value="Data Science Research">Data Science Research</option>
                  <option value="Research Methodology">Research Methodology</option>
                  <option value="Working Paper">Working Paper</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono"
                >
                  <option value="Published">Published</option>
                  <option value="Manuscript prepared for submission">Manuscript prepared</option>
                  <option value="Ongoing research">Ongoing research</option>
                  <option value="Previous research project">Previous project</option>
                  <option value="Active methodology">Active methodology</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1">
                  Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="University of Parma"
                  className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono"
                />
              </div>
            </div>

            {/* Scientific Abstract */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#77736B] mb-1">
                Scientific Abstract *
              </label>
              <textarea
                rows={4}
                required
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Comprehensive scientific synopsis of hypotheses, methodologies, empirical datasets, and critical conclusions..."
                className="w-full p-2.5 bg-white border border-[#141414]/25 text-xs font-sans leading-relaxed focus:border-[#1F3FB0] focus:outline-hidden"
              />
            </div>

            {/* Methodology & Data Specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-[#77736B] mb-1">
                  Methods (Comma separated)
                </label>
                <input
                  type="text"
                  value={methods}
                  onChange={(e) => setMethods(e.target.value)}
                  placeholder="PRISMA, Econometrics, Eye tracking"
                  className="w-full p-2 bg-white border border-[#141414]/25"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#77736B] mb-1">
                  Software / Tools (Comma separated)
                </label>
                <input
                  type="text"
                  value={tools}
                  onChange={(e) => setTools(e.target.value)}
                  placeholder="Python, Crawl4AI, R, Unity"
                  className="w-full p-2 bg-white border border-[#141414]/25"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#77736B] mb-1">
                  Data Sources
                </label>
                <input
                  type="text"
                  value={dataSources}
                  onChange={(e) => setDataSources(e.target.value)}
                  placeholder="Retail receipts, eAmbrosia, PubMed"
                  className="w-full p-2 bg-white border border-[#141414]/25"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#77736B] mb-1">
                  Sample / Corpus
                </label>
                <input
                  type="text"
                  value={sample}
                  onChange={(e) => setSample(e.target.value)}
                  placeholder="N = 250 households, 142 studies"
                  className="w-full p-2 bg-white border border-[#141414]/25"
                />
              </div>
            </div>

            {/* Objectives List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-mono uppercase text-[#77736B]">
                  Research Objectives
                </label>
                <button
                  type="button"
                  onClick={() => handleAddArrayItem(setObjectives)}
                  className="text-[10px] font-mono text-[#1F3FB0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Objective
                </button>
              </div>
              <div className="space-y-2">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#77736B] w-6 shrink-0">0{i + 1}.</span>
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => handleArrayChange(i, e.target.value, setObjectives)}
                      placeholder="Specific scientific objective..."
                      className="flex-1 p-1.5 bg-white border border-[#141414]/20 text-xs font-sans"
                    />
                    {objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(i, setObjectives)}
                        className="p-1 text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Findings List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-mono uppercase text-[#77736B]">
                  Verified Research Findings
                </label>
                <button
                  type="button"
                  onClick={() => handleAddArrayItem(setKeyFindings)}
                  className="text-[10px] font-mono text-[#1F3FB0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Finding
                </button>
              </div>
              <div className="space-y-2">
                {keyFindings.map((kf, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#1F3FB0] w-6 shrink-0">§{i + 1}</span>
                    <input
                      type="text"
                      value={kf}
                      onChange={(e) => handleArrayChange(i, e.target.value, setKeyFindings)}
                      placeholder="Empirical finding or verified result..."
                      className="flex-1 p-1.5 bg-white border border-[#141414]/20 text-xs font-sans"
                    />
                    {keyFindings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(i, setKeyFindings)}
                        className="p-1 text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Cover Customization */}
            <div className="border-t border-[#141414]/15 pt-4 space-y-4">
              <span className="text-xs font-mono uppercase font-bold text-[#141414] block">
                PHYSICAL 3D COVER & SPINE STYLING
              </span>

              {/* Palette Selection */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1.5">
                  Archival Cover Color Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PALETTE_OPTIONS.map((pal, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPalette(pal);
                        setSpineAccent(pal.accent);
                      }}
                      className={`p-2 border flex items-center gap-2 text-left transition-all cursor-pointer ${
                        selectedPalette.bg === pal.bg && selectedPalette.accent === pal.accent
                          ? 'border-[#1F3FB0] shadow-sm'
                          : 'border-[#141414]/20 hover:border-[#141414]'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: pal.bg }}
                      />
                      <span className="text-[11px] font-mono truncate">{pal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Motif Selection */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#77736B] mb-1.5">
                  Cover Scientific Diagram Motif
                </label>
                <select
                  value={motif}
                  onChange={(e) => setMotif(e.target.value as any)}
                  className="w-full p-2 bg-white border border-[#141414]/25 text-xs font-mono"
                >
                  {MOTIF_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#141414]/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#141414]/30 text-xs font-mono uppercase hover:bg-stone-200 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#1F3FB0] text-white text-xs font-mono uppercase font-bold tracking-wider hover:bg-[#19328D] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'SAVE ARTICLE CHANGES' : 'ADD PUBLICATION TO SHELF'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live 3D Miniature Cover Preview (4 cols) */}
          <div className="lg:col-span-4 p-6 bg-[#EDEBE6] flex flex-col items-center justify-between overflow-y-auto">
            <div className="w-full">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] block mb-3 text-center">
                LIVE SHELF COVER PREVIEW
              </span>
              <div className="w-full max-w-[260px] h-[370px] mx-auto shadow-xl">
                <PhysicalCover item={previewItem} tiltX={0} tiltY={0} />
              </div>
            </div>

            <div className="w-full bg-white p-3 border border-[#141414]/15 mt-6 text-[11px] font-mono text-[#77736B] leading-relaxed">
              <span className="text-[#1F3FB0] font-semibold">PHYSICAL SHELF BINDING: </span>
              Your publication will automatically acquire a physical 3D monograph spine, volume accession marker, and expand into an interactive paper sheet upon inspection.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
