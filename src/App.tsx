import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import {
  ResearchCategory,
  ResearchItem,
  ResearcherProfile,
  CategoryDefinition,
  ResearchCollection,
  ResearchNote,
  Highlight,
  ReadingSession,
  ReadingGoal,
  ActivityLog,
  ReadingStatus,
  ShelfWoodMaterial,
  ShelfSortMode,
  CollectionAppearance,
  BookAppearanceOverride,
  ImportDestination,
} from './types/research';
import {
  INITIAL_RESEARCH_ITEMS,
  INITIAL_COLLECTIONS,
  INITIAL_NOTES,
  INITIAL_HIGHLIGHTS,
  INITIAL_READING_SESSIONS,
  INITIAL_GOALS,
  INITIAL_ACTIVITY_LOGS,
  RESEARCHER_PROFILE,
  METHODOLOGY_CARDS,
} from './data/researchData';
import { DEFAULT_CATEGORY_APPEARANCES } from './data/bookAppearanceData';

import { TopNav, MainViewMode } from './components/TopNav';
import { CategoryTabs } from './components/CategoryTabs';
import { ShelfArchive } from './components/ShelfArchive';
import { ResearchCaption } from './components/ResearchCaption';
import { VintageSkeleton } from './components/VintageSkeleton';
import { CommandPalette } from './components/CommandPalette';
import { exportMasterBibtex, exportObsidianVault, downloadFile } from './utils/academicExport';
import { CustomCursor } from './components/CustomCursor';
import { Footer } from './components/Footer';

// Code-split dynamic views & modals (Vercel edge performance optimization)
const LibraryView = React.lazy(() => import('./components/LibraryView').then((m) => ({ default: m.LibraryView })));
const DedicatedReader = React.lazy(() => import('./components/DedicatedReader').then((m) => ({ default: m.DedicatedReader })));
const BookContentsModal = React.lazy(() => import('./components/BookContentsModal').then((m) => ({ default: m.BookContentsModal })));
const NotesView = React.lazy(() => import('./components/NotesView').then((m) => ({ default: m.NotesView })));
const ReadingTrackerView = React.lazy(() => import('./components/ReadingTrackerView').then((m) => ({ default: m.ReadingTrackerView })));
const AiAssistantView = React.lazy(() => import('./components/AiAssistantView').then((m) => ({ default: m.AiAssistantView })));
const ResearchMapView = React.lazy(() => import('./components/ResearchMapView').then((m) => ({ default: m.ResearchMapView })));
const CollectionsView = React.lazy(() => import('./components/CollectionsView').then((m) => ({ default: m.CollectionsView })));
const DedicatedImportModal = React.lazy(() => import('./components/DedicatedImportModal').then((m) => ({ default: m.DedicatedImportModal })));
const LibraryCustomizerModal = React.lazy(() => import('./components/LibraryCustomizerModal').then((m) => ({ default: m.LibraryCustomizerModal })));

const ResearchDetailSheet = React.lazy(() => import('./components/ResearchDetailSheet').then((m) => ({ default: m.ResearchDetailSheet })));
const ResearcherProfileModal = React.lazy(() => import('./components/ResearcherProfileModal').then((m) => ({ default: m.ResearcherProfileModal })));
const MethodologyArchiveModal = React.lazy(() => import('./components/MethodologyArchiveModal').then((m) => ({ default: m.MethodologyArchiveModal })));
const ArticleEditorModal = React.lazy(() => import('./components/ArticleEditorModal').then((m) => ({ default: m.ArticleEditorModal })));
const CategoryManagerModal = React.lazy(() => import('./components/CategoryManagerModal').then((m) => ({ default: m.CategoryManagerModal })));
const CompanionToolsModal = React.lazy(() => import('./components/CompanionToolsModal').then((m) => ({ default: m.CompanionToolsModal })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));
const AccountSettingsModal = React.lazy(() => import('./components/AccountSettingsModal').then((m) => ({ default: m.AccountSettingsModal })));
const ApiKeyPrompt = React.lazy(() => import('./components/ApiKeyPrompt').then((m) => ({ default: m.ApiKeyPrompt })));
const Onboarding = React.lazy(() => import('./components/Onboarding').then((m) => ({ default: m.Onboarding })));
const TopicSampleModal = React.lazy(() => import('./components/TopicSampleModal').then((m) => ({ default: m.TopicSampleModal })));

import {
  toggleSound,
  playTactileClick,
  playPaperRustle,
  playSheetExpand,
} from './utils/sound';

import { useAuth } from './contexts/AuthContext';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { clearGuestPdfFiles, storeGuestPdfFile } from './services/pdfDocuments';
import type { PdfDocumentReference } from './services/pdfDocuments';

import {
  BookOpen,
  FileText,
  Upload,
  Layers,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';

const INITIAL_CATEGORIES: CategoryDefinition[] = [
  { id: 'ALL', label: 'ALL RESEARCH', shortLabel: 'All' },
  { id: 'GENERAL', label: 'GENERAL', shortLabel: 'General' },
  { id: 'THEORY', label: 'THEORY & CONCEPTS', shortLabel: 'Theory' },
  { id: 'EMPIRICAL', label: 'EMPIRICAL STUDIES', shortLabel: 'Empirical' },
  { id: 'METHODOLOGY', label: 'METHODOLOGY', shortLabel: 'Methodology' },
  { id: 'REVIEW', label: 'LITERATURE REVIEWS', shortLabel: 'Reviews' },
];

function buildInitialOrderedItems(): ResearchItem[] {
  return INITIAL_RESEARCH_ITEMS;
}

function isIndividualResearchPaper(item: ResearchItem): boolean {
  const type = (item.type || '').toLowerCase();
  if (/\b(project|initiative|monograph|book|volume|deliverable)\b/.test(type)) return false;
  return /\b(articles?|papers?|reviews?|chapters?|journal|conference)\b/i.test(type)
    || Boolean(item.doi || item.journal || item.abstract);
}

export default function App() {
  // Firebase Auth
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail, signUp, logout, userProfile, updateUserSettings, sendPasswordReset, verifyResetCode, confirmPasswordReset, exportUserData, deleteAccount } = useAuth();
  const { syncToCloud, importLocalToCloud, uploadPdf, persistPaperPdfAttachment, clearUserContent, deleteUserCollection } = useFirebaseSync();
  
  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password'>('login');
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [guestModeEnabled, setGuestModeEnabled] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('marginalia_guest_mode_v1') === 'true'
  );

  // Use Firebase user profile or fall back to neutral guest defaults
  const profile: ResearcherProfile = {
    ...RESEARCHER_PROFILE,
    name: userProfile?.displayName || userProfile?.name || (!user ? 'Guest Scholar' : RESEARCHER_PROFILE.name),
    title: userProfile?.title || (!user ? 'Scholar & Reader' : RESEARCHER_PROFILE.title),
    email: userProfile?.email || '',
    photoURL: userProfile?.photoURL || null,
    primaryAffiliation: userProfile?.primaryAffiliation || (!user ? 'Personal Archive' : RESEARCHER_PROFILE.primaryAffiliation),
    researchPillars: userProfile?.researchPillars || (!user ? [] : RESEARCHER_PROFILE.researchPillars),
    academicBackground: !user ? [] : RESEARCHER_PROFILE.academicBackground,
    secondaryAffiliations: !user ? [] : RESEARCHER_PROFILE.secondaryAffiliations,
    verifiedLinks: !user ? [] : RESEARCHER_PROFILE.verifiedLinks,
    ...(userProfile && { settings: userProfile.settings || {} }),
  } as ResearcherProfile;
  
  // Local profile setter (delegates to Firebase)
  const setProfile = (update: Partial<ResearcherProfile> | ((prev: ResearcherProfile) => ResearcherProfile)) => {
    // Profile updates are handled via onUpdateProfile in modal
  };

  // Main View Mode (Defaults to 'shelf' - the defining physical vintage bookshelf experience)
  const [activeView, setActiveView] = useState<MainViewMode>('shelf');
  const [readerReturnView, setReaderReturnView] = useState<MainViewMode>('shelf');
  const [collectionsSelection, setCollectionsSelection] = useState('all');
  const [catalogDisplayFormat, setCatalogDisplayFormat] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    let isCurrent = true;
    fetch('/api/gemini-status', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('AI status unavailable');
        const status = await response.json();
        if (isCurrent) setGeminiConfigured(status.configured === true);
      })
      .catch(() => {
        if (isCurrent) setGeminiConfigured(false);
      });
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (activeView === 'assistant' && geminiConfigured === false) {
      setShowApiKeyPrompt(true);
    }
  }, [activeView, geminiConfigured]);

  // Shelf Navigation & Search States
  const [activeCategory, setActiveCategory] = useState<ResearchCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shelfIndex, setShelfIndex] = useState<number>(7); // Index 7 is 'item-01' (centerpiece volume)

  // Persistent Shelf Material & Book Appearance Customization
  const [shelfMaterial, setShelfMaterial] = useState<ShelfWoodMaterial>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('marginalia_shelf_material_v1') as ShelfWoodMaterial | null;
      if (saved) return saved;
    }
    return 'walnut';
  });

  const [shelfSortMode, setShelfSortMode] = useState<ShelfSortMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('marginalia_shelf_sort_v1') as ShelfSortMode | null;
      if (saved) return saved;
    }
    return 'custom';
  });

  // Local profile state for reset functionality
  const [, forceProfileUpdate] = useState(0);
  const triggerProfileUpdate = () => forceProfileUpdate((c) => c + 1);

  const [categoryAppearances, setCategoryAppearances] = useState<
    Record<string, CollectionAppearance>
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('marginalia_category_appearances_v1');
        if (saved) {
          return { ...DEFAULT_CATEGORY_APPEARANCES, ...JSON.parse(saved) };
        }
      } catch {}
    }
    return DEFAULT_CATEGORY_APPEARANCES;
  });

  // Active Reader Paper
  const [activeReaderPaper, setActiveReaderPaper] = useState<ResearchItem | null>(null);
  const [readerQueueIds, setReaderQueueIds] = useState<string[]>([]);
  const [readerScope, setReaderScope] = useState<string | null>(null);
  const [activeBookPaperIds, setActiveBookPaperIds] = useState<string[] | null>(null);
  const [activeBookTitle, setActiveBookTitle] = useState('Research Papers');
  const [activeBookCollectionId, setActiveBookCollectionId] = useState<string | null>(null);
  const [importCollectionIds, setImportCollectionIds] = useState<string[]>([]);

  // Modals & Sheets
  const [activeDetailItem, setActiveDetailItem] = useState<ResearchItem | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isArticleEditorOpen, setIsArticleEditorOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ResearchItem | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState<boolean>(false);
  const [isCompanionToolsOpen, setIsCompanionToolsOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [customizerTargetBook, setCustomizerTargetBook] = useState<ResearchItem | null>(null);

  // Sound & Cursor state
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const settingsLoadedForUid = useRef<string | null>(null);
  const [cursorState, setCursorState] = useState<{
    isHoveringActive?: boolean;
    label?: string;
    isInteractive?: boolean;
  }>({
    isHoveringActive: false,
    label: 'OPEN / EXPLORE',
    isInteractive: false,
  });

  // Load cloud settings before syncing local state so login cannot replace an
  // existing user's preferences with this device's defaults.
  useEffect(() => {
    if (!user) {
      settingsLoadedForUid.current = null;
      return;
    }
    if (!userProfile || userProfile.uid !== user.uid) return;

    if (settingsLoadedForUid.current !== user.uid) {
      const settings = userProfile.settings;
      const shelfMaterials: ShelfWoodMaterial[] = [
        'walnut', 'oak', 'mahogany', 'ebony', 'light_wood', 'paper',
      ];
      const shelfSortModes: ShelfSortMode[] = [
        'custom', 'recent', 'year', 'title', 'author', 'status',
      ];
      if (shelfMaterials.some((value) => value === settings.shelfMaterial)) {
        setShelfMaterial(settings.shelfMaterial);
      }
      if (shelfSortModes.some((value) => value === settings.shelfSortMode)) {
        setShelfSortMode(settings.shelfSortMode);
      }
      setSoundActive(settings.soundEnabled);
      settingsLoadedForUid.current = user.uid;
      return;
    }

    void updateUserSettings({ shelfMaterial, shelfSortMode, soundEnabled: soundActive })
      .catch((error: unknown) => console.error('Could not save account settings:', error));
  }, [
    user?.uid,
    userProfile?.uid,
    userProfile?.settings.shelfMaterial,
    userProfile?.settings.shelfSortMode,
    userProfile?.settings.soundEnabled,
    shelfMaterial,
    shelfSortMode,
    soundActive,
    updateUserSettings,
  ]);

  // Persistent Research Library (Clean slate by default for fresh users & guests)
  const [researchItems, setResearchItems] = useState<ResearchItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('academic_archive_items_v3');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Persistent Collections (Clean slate by default)
  const [collections, setCollections] = useState<ResearchCollection[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('academic_archive_collections_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Persistent Notes
  const [notes, setNotes] = useState<ResearchNote[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('academic_archive_notes_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Persistent Highlights
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('academic_archive_highlights_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Persistent Reading Sessions
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('academic_archive_sessions_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Persistent Reading Goals
  const [goals, setGoals] = useState<ReadingGoal[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('academic_archive_goals_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Persistent Activity Logs
  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('academic_archive_activities_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Persistent Categories
  const [categories, setCategories] = useState<CategoryDefinition[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('academic_archive_categories_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_CATEGORIES;
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('academic_archive_items_v3', JSON.stringify(researchItems));
    } catch {}
  }, [researchItems]);

  useEffect(() => {
    try {
      localStorage.setItem('marginalia_shelf_material_v1', shelfMaterial);
    } catch {}
  }, [shelfMaterial]);

  useEffect(() => {
    try {
      localStorage.setItem('marginalia_shelf_sort_v1', shelfSortMode);
    } catch {}
  }, [shelfSortMode]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'marginalia_category_appearances_v1',
        JSON.stringify(categoryAppearances)
      );
    } catch {}
  }, [categoryAppearances]);

  useEffect(() => {
    try {
      localStorage.setItem('academic_archive_collections_v2', JSON.stringify(collections));
    } catch {}
  }, [collections]);

  useEffect(() => {
    try {
      localStorage.setItem('academic_archive_notes_v2', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('academic_archive_highlights_v2', JSON.stringify(highlights));
    } catch {}
  }, [highlights]);

  useEffect(() => {
    try {
      localStorage.setItem('academic_archive_sessions_v2', JSON.stringify(readingSessions));
    } catch {}
  }, [readingSessions]);

  useEffect(() => {
    try {
      localStorage.setItem('academic_archive_goals_v2', JSON.stringify(goals));
    } catch {}
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem('academic_archive_activities_v2', JSON.stringify(activities));
    } catch {}
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem('academic_archive_categories_v2', JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('academic_archive_profile_v2', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Auth handlers
  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
    } catch (err: unknown) {
      console.error('Google sign-in failed:', err);
      throw err;
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      setShowAuthModal(false);
    } catch (err: any) {
      console.error('Email sign-in failed:', err);
      throw err;
    }
  };

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    try {
      await signUp(email, password, displayName);
      setShowAuthModal(false);
    } catch (err: any) {
      console.error('Sign-up failed:', err);
      throw err;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await sendPasswordReset(email);
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      throw err;
    }
  };

  const handleVerifyResetCode = async (code: string) => {
    try {
      return await verifyResetCode(code);
    } catch (err: any) {
      console.error('Verify reset code failed:', err);
      throw err;
    }
  };

  const handleConfirmPasswordReset = async (code: string, newPassword: string) => {
    try {
      await confirmPasswordReset(code, newPassword);
    } catch (err: any) {
      console.error('Confirm password reset failed:', err);
      throw err;
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await exportUserData();
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marginalia-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Export failed:', err);
      throw err;
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      await deleteAccount(password);
    } catch (err: any) {
      console.error('Delete account failed:', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Clear local data on logout
      localStorage.removeItem('academic_archive_items_v3');
      localStorage.removeItem('academic_archive_collections_v2');
      localStorage.removeItem('academic_archive_notes_v2');
      localStorage.removeItem('academic_archive_highlights_v2');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Sync data to Firebase when user logs in for the first time
  useEffect(() => {
    if (user && userProfile?.uid === user.uid && !userProfile.createdAt) {
      // First time login - import local data to cloud
      importLocalToCloud(
        user.uid,
        researchItems,
        collections,
        notes,
        highlights,
        readingSessions,
        goals,
        activities,
        [profile],
        {
          shelfMaterial,
          shelfSortMode,
          soundEnabled: soundActive,
          aiConfigured: false,
        }
      ).catch(console.error);
    }
  }, [user, userProfile?.createdAt]);

  // Show auth modal when user is not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      localStorage.removeItem('marginalia_guest_mode_v1');
      setGuestModeEnabled(false);
      setShowAuthModal(false);
    } else if (!guestModeEnabled) {
      setShowAuthModal(true);
      setAuthMode('login');
    }
  }, [user, authLoading, guestModeEnabled]);

  // Log activity helper
  const logActivity = useCallback(
    (type: ActivityLog['type'], description: string, paperId?: string, paperTitle?: string) => {
      const newLog: ActivityLog = {
        id: 'act-' + Date.now(),
        type,
        description,
        timestamp: new Date().toISOString(),
        paperId,
        paperTitle,
      };
      setActivities((prev) => [newLog, ...prev.slice(0, 49)]);
    },
    []
  );

  // Filter and sort shelf items by active category, search query, and shelfSortMode
  const filteredShelfItems = useMemo(() => {
    let list = researchItems;

    if (activeCategory !== 'ALL') {
      list = list.filter(
        (item) =>
          item.category === activeCategory ||
          item.secondaryCategories?.includes(activeCategory)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.shortTitle.toLowerCase().includes(q) ||
          item.field.toLowerCase().includes(q) ||
          item.authors.some((a) => a.toLowerCase().includes(q)) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.year.includes(q)
      );
    }

    if (shelfSortMode === 'custom') {
      return list;
    }

    const sorted = [...list];
    if (shelfSortMode === 'year') {
      sorted.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (shelfSortMode === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (shelfSortMode === 'author') {
      sorted.sort((a, b) =>
        (a.authors[0] || '').localeCompare(b.authors[0] || '')
      );
    } else if (shelfSortMode === 'status') {
      const order: Record<string, number> = {
        reading: 1,
        to_read: 2,
        inbox: 3,
        completed: 4,
        reference_only: 5,
        paused: 6,
        archived: 7,
      };
      sorted.sort(
        (a, b) =>
          (order[a.readingStatus] || 9) - (order[b.readingStatus] || 9)
      );
    } else if (shelfSortMode === 'recent') {
      sorted.reverse();
    }
    return sorted;
  }, [researchItems, activeCategory, searchQuery, shelfSortMode]);

  // Collection folders become grouped shelf volumes. Unfiled articles share one
  // library volume, while existing monographs and research projects stay intact.
  const filteredShelfBooks = useMemo(() => {
    const papers = filteredShelfItems.filter(isIndividualResearchPaper);
    if (papers.length === 0) return filteredShelfItems;
    const otherVolumes = filteredShelfItems.filter((item) => !isIndividualResearchPaper(item));
    const bookCollections = collections.filter((item) => !item.isSmart && item.kind !== 'area');
    const knownCollectionIds = new Set(bookCollections.map((item) => item.id));
    const groupedVolumes: ResearchItem[] = [];

    const buildGroupedVolume = (id: string, title: string, groupPapers: ResearchItem[], collectionId?: string): ResearchItem => {
      const representative = groupPapers[0];
      const years = groupPapers.map((paper) => Number.parseInt(paper.year, 10)).filter(Number.isFinite).sort((a, b) => a - b);
      const completedCount = groupPapers.filter((paper) => paper.readingStatus === 'completed').length;
      return {
        ...representative,
        id,
        bookPaperIds: groupPapers.map((paper) => paper.id),
        number: `${groupPapers.length} PAPERS`,
        title,
        shortTitle: title,
        authors: [`${groupPapers.length} collected ${groupPapers.length === 1 ? 'paper' : 'papers'}`],
        year: years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years.length === 1 ? String(years[0]) : 'n.d.',
        type: 'Collected Research Papers',
        category: collectionId ? title.toUpperCase() : 'RESEARCH PAPERS',
        field: 'ACADEMIC LIBRARY',
        secondaryCategories: [],
        collectionIds: collectionId ? [collectionId] : [],
        tags: [],
        topics: [],
        methods: [],
        abstract: '',
        pages: undefined,
        pageCount: undefined,
        storagePath: undefined,
        guestPdfId: undefined,
        readingStatus: completedCount === groupPapers.length ? 'completed' : completedCount > 0 ? 'reading' : 'to_read',
        readingProgress: {
          ...representative.readingProgress,
          currentPage: completedCount,
          totalPages: groupPapers.length,
          percent: Math.round((completedCount / groupPapers.length) * 100),
        },
      };
    };

    bookCollections.forEach((collection) => {
      const members = papers.filter((paper) => paper.collectionIds?.find((id) => knownCollectionIds.has(id)) === collection.id);
      const mode = collection.appearance?.sortingMode || 'custom';
      const compareText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });
      if (mode === 'recent') members.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
      else if (mode === 'year') members.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
      else if (mode === 'title') members.sort((a, b) => compareText(a.title, b.title));
      else if (mode === 'author') members.sort((a, b) => compareText(a.authors?.[0] || '', b.authors?.[0] || ''));
      else if (mode === 'status') members.sort((a, b) => compareText(a.readingStatus || 'inbox', b.readingStatus || 'inbox'));
      if (!members.length) return;
      groupedVolumes.push(buildGroupedVolume(`shelf-volume:collection:${collection.id}`, collection.name, members, collection.id));
    });

    const unfiledPapers = papers.filter((paper) => !paper.collectionIds?.some((id) => knownCollectionIds.has(id)));
    if (unfiledPapers.length) {
      groupedVolumes.push(buildGroupedVolume('shelf-volume:research-papers', 'Research Papers', unfiledPapers));
    }

    const firstPaperIndex = filteredShelfItems.findIndex(isIndividualResearchPaper);
    const before = filteredShelfItems.slice(0, firstPaperIndex).filter((item) => !isIndividualResearchPaper(item));
    const after = otherVolumes.filter((item) => !before.some((prior) => prior.id === item.id));
    return [...before, ...groupedVolumes, ...after];
  }, [filteredShelfItems, collections]);

  // Clamp shelfIndex when filtered shelf volumes change.
  useEffect(() => {
    if (shelfIndex >= filteredShelfBooks.length && filteredShelfBooks.length > 0) {
      setShelfIndex(Math.max(0, Math.floor(filteredShelfBooks.length / 2)));
    }
  }, [filteredShelfBooks.length, shelfIndex]);

  const activeShelfBook = filteredShelfBooks[shelfIndex] || filteredShelfBooks[0] || null;
  const activeShelfItem = activeShelfBook?.bookPaperIds
    ? filteredShelfItems.find((paper) => paper.id === activeShelfBook.bookPaperIds?.[0]) || null
    : activeShelfBook;

  const openBookContents = useCallback((book: ResearchItem) => {
    if (book.bookPaperIds?.length) {
      setActiveBookPaperIds(book.bookPaperIds);
      setActiveBookTitle(book.title);
      setActiveBookCollectionId(book.collectionIds?.[0] || null);
      return true;
    }
    return false;
  }, []);

  const handleOpenShelfBook = useCallback((book: ResearchItem) => {
    if (!openBookContents(book)) setActiveDetailItem(book);
  }, [openBookContents]);


  // Sound handler
  const handleToggleSound = useCallback(() => {
    const updated = toggleSound();
    setSoundActive(updated);
    if (updated) playTactileClick();
  }, []);

  // Customization handlers
  const handleUpdateCategoryAppearance = useCallback(
    (categoryId: string, appearance: CollectionAppearance) => {
      setCategoryAppearances((prev) => ({
        ...prev,
        [categoryId]: appearance,
      }));
    },
    []
  );

  const handleUpdateBookAppearance = useCallback(
    (paperId: string, override: BookAppearanceOverride | undefined) => {
      setResearchItems((prev) =>
        prev.map((p) =>
          p.id === paperId ? { ...p, bookAppearance: override } : p
        )
      );
    },
    []
  );

  const handleMoveBookOrder = useCallback(
    (paperId: string, direction: 'up' | 'down') => {
      setResearchItems((prev) => {
        const idx = prev.findIndex((p) => p.id === paperId);
        if (idx < 0) return prev;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(idx, 1);
        next.splice(targetIdx, 0, moved);
        return next;
      });
    },
    []
  );

  // Open paper in reader
  const handleOpenInReader = useCallback(
    (paper: ResearchItem, readingQueue: ResearchItem[] = [paper], scopeName?: string) => {
      playSheetExpand();
      setActiveReaderPaper(paper);
      const queue = readingQueue.some((item) => item.id === paper.id) ? readingQueue : [...readingQueue, paper];
      setReaderQueueIds([...new Set(queue.map((item) => item.id))]);
      setReaderScope(scopeName || null);
      setReaderReturnView(activeView);
      setActiveView('reader');
      if (paper.readingStatus === 'inbox' || paper.readingStatus === 'to_read') {
        setResearchItems((prev) =>
          prev.map((p) => (p.id === paper.id ? { ...p, readingStatus: 'reading' } : p))
        );
        logActivity('changed_status', `Started reading ${paper.title}`, paper.id, paper.title);
      }
    },
    [activeView, logActivity]
  );

  const handleReadShelfBook = useCallback((book: ResearchItem) => {
    if (!openBookContents(book)) handleOpenInReader(book, [book]);
  }, [openBookContents, handleOpenInReader]);

  const handleBookContentsRead = useCallback((paper: ResearchItem, readingQueue: ResearchItem[]) => {
    setActiveBookPaperIds(null);
    handleOpenInReader(paper, readingQueue, activeBookTitle);
  }, [activeBookTitle, handleOpenInReader]);

  const handleNavigateReaderPaper = useCallback((paper: ResearchItem) => {
    setActiveReaderPaper(paper);
    if (paper.readingStatus === 'inbox' || paper.readingStatus === 'to_read') {
      setResearchItems((items) => items.map((item) => item.id === paper.id ? { ...item, readingStatus: 'reading' } : item));
      logActivity('changed_status', `Started reading ${paper.title}`, paper.id, paper.title);
    }
  }, [logActivity]);

  const handleAddPapersToCollection = useCallback((collectionId: string) => {
    setImportCollectionIds([collectionId]);
    setIsImportModalOpen(true);
  }, []);

  const handleUpdateCollectionFolders = useCallback((nextCollections: ResearchCollection[]) => {
    const removedIds = collections.filter((collection) => !nextCollections.some((next) => next.id === collection.id)).map((collection) => collection.id);
    setCollections(nextCollections);
    if (user) {
      void syncToCloud(user.uid, {
        researchItems: [], collections: nextCollections, notes: [], highlights: [],
        readingSessions: [], goals: [], activities: [], profiles: [], options: {},
      });
      removedIds.forEach((collectionId) => void deleteUserCollection(user.uid, collectionId).catch((error: unknown) => {
        console.error('Could not remove the deleted folder from cloud storage:', error);
      }));
    }
  }, [collections, deleteUserCollection, syncToCloud, user]);

  const handleUpdatePaperCollections = useCallback((updatedPapers: ResearchItem[]) => {
    const previousById = new Map(researchItems.map((paper) => [paper.id, paper]));
    const changedMemberships = updatedPapers.filter((paper) =>
      JSON.stringify(previousById.get(paper.id)?.collectionIds || []) !== JSON.stringify(paper.collectionIds || [])
      || previousById.get(paper.id)?.readingStatus !== paper.readingStatus
    );
    setResearchItems(updatedPapers);
    if (user && changedMemberships.length) {
      void syncToCloud(user.uid, {
        researchItems: changedMemberships, collections: [], notes: [], highlights: [],
        readingSessions: [], goals: [], activities: [], profiles: [], options: {},
      });
    }
  }, [researchItems, syncToCloud, user]);

  const handleTogglePaperRead = useCallback((paper: ResearchItem) => {
    const isRead = paper.readingStatus === 'completed';
    const totalPages = paper.readingProgress?.totalPages || paper.pageCount || 0;
    const nextPaper = {
      ...paper,
      readingStatus: isRead ? 'to_read' as ReadingStatus : 'completed' as ReadingStatus,
      readingProgress: {
        ...paper.readingProgress,
        currentPage: isRead ? 0 : totalPages,
        totalPages,
        percent: isRead ? 0 : 100,
        lastReadAt: new Date().toISOString(),
        totalReadingTimeMinutes: paper.readingProgress?.totalReadingTimeMinutes || 0,
      },
    };
    handleUpdatePaperCollections(researchItems.map((item) => item.id === paper.id ? nextPaper : item));
    if (!isRead) logActivity('changed_status', `Marked ${paper.title} as read`, paper.id, paper.title);
  }, [handleUpdatePaperCollections, logActivity, researchItems]);

  const handleMovePaperFromBook = useCallback((paper: ResearchItem, targetCollectionId: string) => {
    const nextIds = [targetCollectionId];
    handleUpdatePaperCollections(researchItems.map((item) => item.id === paper.id ? { ...item, collectionIds: nextIds } : item));
    setActiveBookPaperIds(null);
    setCollectionsSelection(targetCollectionId);
    setActiveView('collections');
  }, [activeBookCollectionId, handleUpdatePaperCollections, researchItems]);

  const handleAddPapersToActiveBook = useCallback(() => {
    if (activeBookCollectionId) handleAddPapersToCollection(activeBookCollectionId);
    else {
      setImportCollectionIds([]);
      setIsImportModalOpen(true);
    }
    setActiveBookPaperIds(null);
  }, [activeBookCollectionId, handleAddPapersToCollection]);

  const handleBookContentsDetails = useCallback((paper: ResearchItem) => {
    setActiveBookPaperIds(null);
    setActiveDetailItem(paper);
  }, []);

  // Inquire paper in AI Assistant
  const handleAskAiAboutPaper = useCallback(() => {
    playTactileClick();
    setActiveView('assistant');
  }, []);

  // Bulk status update
  const handleBulkUpdateStatus = useCallback(
    (paperIds: string[], status: ReadingStatus) => {
      playTactileClick();
      setResearchItems((prev) =>
        prev.map((p) => (paperIds.includes(p.id) ? { ...p, readingStatus: status } : p))
      );
      logActivity('changed_status', `Updated reading status to ${status} for ${paperIds.length} items`);
    },
    [logActivity]
  );

  // Bulk delete
  const handleBulkDelete = useCallback(
    (paperIds: string[]) => {
      playTactileClick();
      setResearchItems((prev) => prev.filter((p) => !paperIds.includes(p.id)));
      if (activeReaderPaper && paperIds.includes(activeReaderPaper.id)) {
        setActiveReaderPaper(null);
      }
      if (activeDetailItem && paperIds.includes(activeDetailItem.id)) {
        setActiveDetailItem(null);
      }
    },
    [activeReaderPaper, activeDetailItem]
  );

  // Import papers from Ingestion Studio
  const handleImportPapers = useCallback(
    (newPapers: ResearchItem[], destination: ImportDestination) => {
      const nextCollections = [...collections];
      let areaId = destination.areaId;
      if (destination.newAreaName?.trim()) {
        const existingArea = nextCollections.find((collection) => collection.kind === 'area' && collection.name.trim().toLocaleLowerCase() === destination.newAreaName?.trim().toLocaleLowerCase());
        areaId = existingArea?.id || `area-${crypto.randomUUID()}`;
        if (!existingArea) nextCollections.push({ id: areaId, name: destination.newAreaName.trim(), kind: 'area', color: '#1F3FB0' });
      }

      let bookId = destination.bookId;
      if (destination.newBookName?.trim()) {
        const existingBook = nextCollections.find((collection) => collection.kind !== 'area' && !collection.isSmart && collection.parentId === areaId && collection.name.trim().toLocaleLowerCase() === destination.newBookName?.trim().toLocaleLowerCase());
        bookId = existingBook?.id || `book-${crypto.randomUUID()}`;
        if (!existingBook) nextCollections.push({ id: bookId, name: destination.newBookName.trim(), kind: 'book', ...(areaId ? { parentId: areaId } : {}), color: '#1F3FB0' });
      }
      if (!bookId || !nextCollections.some((collection) => collection.id === bookId && collection.kind !== 'area' && !collection.isSmart)) return;

      const filedPapers = newPapers.map((paper) => ({ ...paper, collectionIds: [bookId as string] }));
      if (nextCollections.length !== collections.length) setCollections(nextCollections);
      playPaperRustle();
      setResearchItems((prev) => [...filedPapers, ...prev]);
      logActivity(
        'imported',
        `Imported ${filedPapers.length} papers into ${nextCollections.find((collection) => collection.id === bookId)?.name || 'a book'}`,
        filedPapers[0]?.id,
        filedPapers[0]?.title
      );
      setShelfIndex(0);
      setCollectionsSelection(bookId);
      setActiveView('collections');
      if (user) {
        void syncToCloud(user.uid, {
          researchItems: filedPapers,
          collections: nextCollections,
          notes: [],
          highlights: [],
          readingSessions: [],
          goals: [],
          activities: [],
          profiles: [],
          options: {},
        });
      }
    },
    [collections, logActivity, syncToCloud, user]
  );

  const handleStorePdf = useCallback(async (file: File): Promise<PdfDocumentReference> => {
    const reference: PdfDocumentReference = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
    };

    if (user) {
      reference.storagePath = await uploadPdf(user.uid, file);
    } else {
      reference.guestPdfId = await storeGuestPdfFile(file);
    }
    return reference;
  }, [uploadPdf, user]);

  const handleAttachPdfToActivePaper = useCallback(async (file: File): Promise<void> => {
    const targetPaper = activeReaderPaper || researchItems[0];
    if (!targetPaper) throw new Error('No library paper is selected.');

    const reference: PdfDocumentReference = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
    };
    if (user) reference.storagePath = await uploadPdf(user.uid, file);
    else reference.guestPdfId = await storeGuestPdfFile(file);

    const updatedPaper: ResearchItem = {
      ...targetPaper,
      ...reference,
      pdfFileName: file.name,
      ...(user ? { guestPdfId: undefined } : {}),
    };
    if (user && updatedPaper.storagePath) {
      await persistPaperPdfAttachment(user.uid, updatedPaper);
    }

    setResearchItems((items) => items.map((item) => item.id === updatedPaper.id ? updatedPaper : item));
    setActiveReaderPaper(updatedPaper);
    setActiveDetailItem((current) => current?.id === updatedPaper.id ? updatedPaper : current);
  }, [activeReaderPaper, researchItems, user, uploadPdf, persistPaperPdfAttachment]);

  // Save / Update Note
  const handleSaveNote = useCallback(
    (note: ResearchNote) => {
      playTactileClick();
      setNotes((prev) => {
        const idx = prev.findIndex((n) => n.id === note.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = note;
          return next;
        }
        return [note, ...prev];
      });
      logActivity('created_note', `Updated research note: "${note.title}"`);
    },
    [logActivity]
  );

  // Delete Note
  const handleDeleteNote = useCallback((id: string) => {
    playTactileClick();
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Highlights handlers
  const handleAddHighlight = useCallback(
    (hl: Highlight) => {
      playTactileClick();
      setHighlights((prev) => [hl, ...prev]);
      logActivity('highlighted', `Saved highlight on page ${hl.pageNumber}`, hl.paperId);
    },
    [logActivity]
  );

  const handleDeleteHighlight = useCallback((id: string) => {
    playTactileClick();
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  // Update Reading Progress
  const handleUpdateReadingProgress = useCallback(
    (paperId: string, page: number, percent: number, totalPages: number) => {
      setResearchItems((prev) =>
        prev.map((p) => {
          if (p.id !== paperId) return p;
          const isDone = percent >= 98;
          return {
            ...p,
            pageCount: totalPages,
            readingStatus: isDone ? 'completed' : p.readingStatus,
            readingProgress: {
              ...p.readingProgress,
              currentPage: page,
              totalPages,
              percent,
              lastReadAt: new Date().toISOString(),
            },
          };
        })
      );
    },
    []
  );

  // Article authoring/edit actions
  const handleSaveArticle = useCallback(
    (savedItem: ResearchItem, destination?: ImportDestination) => {
      const exists = researchItems.some((item) => item.id === savedItem.id);
      let itemToSave = savedItem;
      let nextCollections = collections;
      if (!exists) {
        if (!destination) return;
        nextCollections = [...collections];
        let areaId = destination.areaId;
        if (destination.newAreaName?.trim()) {
          const area = nextCollections.find((collection) => collection.kind === 'area' && collection.name.trim().toLocaleLowerCase() === destination.newAreaName?.trim().toLocaleLowerCase());
          areaId = area?.id || `area-${crypto.randomUUID()}`;
          if (!area) nextCollections.push({ id: areaId, name: destination.newAreaName.trim(), kind: 'area', color: '#1F3FB0' });
        }
        let bookId = destination.bookId;
        if (destination.newBookName?.trim()) {
          const book = nextCollections.find((collection) => collection.kind !== 'area' && !collection.isSmart && collection.parentId === areaId && collection.name.trim().toLocaleLowerCase() === destination.newBookName?.trim().toLocaleLowerCase());
          bookId = book?.id || `book-${crypto.randomUUID()}`;
          if (!book) nextCollections.push({ id: bookId, name: destination.newBookName.trim(), kind: 'book', ...(areaId ? { parentId: areaId } : {}), color: '#1F3FB0' });
        }
        if (!bookId || !nextCollections.some((collection) => collection.id === bookId && collection.kind !== 'area' && !collection.isSmart)) return;
        itemToSave = { ...savedItem, collectionIds: [bookId] };
        if (nextCollections.length !== collections.length) setCollections(nextCollections);
        setCollectionsSelection(bookId);
        setActiveView('collections');
        if (user) {
          void syncToCloud(user.uid, {
            researchItems: [itemToSave], collections: nextCollections, notes: [], highlights: [],
            readingSessions: [], goals: [], activities: [], profiles: [], options: {},
          });
        }
      }
      setResearchItems((prev) => {
        const existsIndex = prev.findIndex((x) => x.id === itemToSave.id);
        if (existsIndex >= 0) {
          const next = [...prev];
          next[existsIndex] = itemToSave;
          return next;
        }
        return [itemToSave, ...prev];
      });

      setActiveDetailItem((current) =>
        current && current.id === itemToSave.id ? itemToSave : current
      );

      setCategories((prev) => {
        if (!prev.some((c) => c.id === itemToSave.category)) {
          return [...prev, { id: itemToSave.category, label: itemToSave.category, isCustom: true }];
        }
        return prev;
      });

      logActivity('added_paper', `Saved publication record "${itemToSave.title}"`, itemToSave.id, itemToSave.title);
    },
    [collections, logActivity, researchItems, syncToCloud, user]
  );

  const handleDeleteArticle = useCallback((itemId: string) => {
    playTactileClick();
    setResearchItems((prev) => prev.filter((x) => x.id !== itemId));
    setActiveDetailItem((curr) => (curr?.id === itemId ? null : curr));
  }, []);

  // Clear saved library content while preserving sign-in and personal preferences.
  const handleClearContent = useCallback(async () => {
    playTactileClick();
    if (user) await clearUserContent(user.uid);
    await clearGuestPdfFiles();

    const emptyKeys = [
      'academic_archive_items_v3', 'academic_archive_collections_v2',
      'academic_archive_notes_v2', 'academic_archive_highlights_v2',
      'academic_archive_sessions_v2', 'academic_archive_goals_v2',
      'academic_archive_activities_v2',
    ];
    for (const key of emptyKeys) localStorage.setItem(key, '[]');
    localStorage.removeItem('academic_archive_items_v2');
    localStorage.removeItem('academic_archive_categories_v2');

    setResearchItems([]);
    setCollections([]);
    setNotes([]);
    setHighlights([]);
    setReadingSessions([]);
    setGoals([]);
    setActivities([]);
    setCategories(INITIAL_CATEGORIES);
    setActiveCategory('ALL');
    setSearchQuery('');
    setActiveReaderPaper(null);
    setActiveDetailItem(null);
    setShelfIndex(0);
  }, [clearUserContent, user]);

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  const handleLoadTopicPapers = useCallback(
    (newPapers: ResearchItem[], newCollection: ResearchCollection) => {
      playPaperRustle();
      setResearchItems((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const toAdd = newPapers.filter((p) => !existingIds.has(p.id));
        return [...prev, ...toAdd];
      });
      setCollections((prev) => {
        if (prev.some((c) => c.id === newCollection.id)) return prev;
        return [...prev, newCollection];
      });
      setShelfIndex(0);
      setActiveCategory('ALL');
      logActivity(
        'imported',
        `Harvested ${newPapers.length} open-access volumes for "${newCollection.name}"`
      );
    },
    [logActivity]
  );

  // Global Keyboard Navigation on Bookshelf
  useEffect(() => {
    if (activeView !== 'shelf') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      const anyModalOpen =
        activeDetailItem ||
        activeBookPaperIds ||
        isAboutOpen ||
        isMethodologyOpen ||
        isArticleEditorOpen ||
        isCategoryManagerOpen ||
        isCompanionToolsOpen ||
        isImportModalOpen ||
        isCustomizerOpen ||
        isTopicModalOpen ||
        isCommandPaletteOpen;

      if (e.key === 'ArrowLeft' && !anyModalOpen) {
        e.preventDefault();
        if (shelfIndex > 0) {
          playPaperRustle();
          setShelfIndex((prev) => prev - 1);
        }
      } else if (e.key === 'ArrowRight' && !anyModalOpen) {
        e.preventDefault();
        if (shelfIndex < filteredShelfBooks.length - 1) {
          playPaperRustle();
          setShelfIndex((prev) => prev + 1);
        }
      } else if ((e.key === 'Enter' || e.key === ' ') && !anyModalOpen) {
        e.preventDefault();
        if (activeShelfBook) {
          playSheetExpand();
          handleOpenShelfBook(activeShelfBook);
        }
      } else if (e.key === 'Escape') {
        if (activeDetailItem) setActiveDetailItem(null);
        if (activeBookPaperIds) setActiveBookPaperIds(null);
        if (isAboutOpen) setIsAboutOpen(false);
        if (isMethodologyOpen) setIsMethodologyOpen(false);
        if (isArticleEditorOpen) setIsArticleEditorOpen(false);
        if (isCategoryManagerOpen) setIsCategoryManagerOpen(false);
        if (isCompanionToolsOpen) setIsCompanionToolsOpen(false);
        if (isImportModalOpen) setIsImportModalOpen(false);
        if (isCustomizerOpen) setIsCustomizerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeView,
    shelfIndex,
    filteredShelfBooks.length,
    activeShelfBook,
    activeBookPaperIds,
    handleOpenShelfBook,
    activeDetailItem,
    isAboutOpen,
    isMethodologyOpen,
    isArticleEditorOpen,
    isCategoryManagerOpen,
    isCompanionToolsOpen,
    isImportModalOpen,
    isCustomizerOpen,
  ]);

  const readingNowCount = useMemo(
    () => researchItems.filter((p) => p.readingStatus === 'reading').length,
    [researchItems]
  );

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Omnibox / Command Palette keyboard listener (Cmd+K / Ctrl+K / slash)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExportMasterBibtex = useCallback(() => {
    playTactileClick();
    const bib = exportMasterBibtex(researchItems);
    downloadFile(bib, 'marginalia_library.bib', 'text/x-bibtex');
  }, [researchItems]);

  const handleExportObsidianVault = useCallback(async () => {
    playTactileClick();
    const blob = await exportObsidianVault(researchItems, collections, notes, highlights);
    downloadFile(blob, 'marginalia_obsidian_vault.zip', 'application/zip');
  }, [researchItems, collections, notes, highlights]);

  return (
    <>
      <Suspense fallback={<VintageSkeleton fullscreen />}>
    {/* Auth Modal - shown when user is not authenticated */}
    <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        onExportData={handleExportData}
        onDeleteAccount={handleDeleteAccount}
      />

    {!user && (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinueAsGuest={() => {
          localStorage.setItem('marginalia_guest_mode_v1', 'true');
          setGuestModeEnabled(true);
          setShowAuthModal(false);
        }}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onForgotPassword={handleForgotPassword}
        onVerifyResetCode={handleVerifyResetCode}
        onConfirmPasswordReset={handleConfirmPasswordReset}
        defaultMode={authMode}
      />
    )}

    <div className="relative min-h-screen flex flex-col justify-between bg-[#EDE8DD] text-[#141414] paper-grain selection:bg-[#1F3FB0] selection:text-white">
      {/* Editorial Custom Cursor (desktop only) */}
      <CustomCursor
        isHoveringActive={cursorState.isHoveringActive}
        label={cursorState.label}
        isInteractive={cursorState.isInteractive}
      />

      {/* Omnibox & Scholar Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        papers={researchItems}
        onSelectPaper={(paper) => {
          playSheetExpand();
          setActiveDetailItem(paper);
        }}
        onOpenReader={handleOpenInReader}
        onNavigateView={(view) => {
          if (view === 'shelf') {
            setActiveView('shelf');
          } else if (view === 'catalog') {
            setActiveView('catalog');
          } else {
            setActiveView(view);
          }
        }}
        onOpenImport={() => {
          playTactileClick();
          setIsImportModalOpen(true);
        }}
        onOpenTopicSamples={() => {
          playTactileClick();
          setIsTopicModalOpen(true);
        }}
        onOpenCustomizer={() => {
          playTactileClick();
          setIsCustomizerOpen(true);
        }}
        onExportBibtex={handleExportMasterBibtex}
        onExportObsidian={handleExportObsidianVault}
        shelfMaterial={shelfMaterial}
        onChangeShelfMaterial={setShelfMaterial}
      />

      {/* Top Editorial Navigation */}
      <TopNav
        researcherName={profile.name}
        researcherTitle={profile.title}
        affiliation={`${profile.primaryAffiliation} · FutureData4EU`}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenAbout={() => {
          playTactileClick();
          setIsAboutOpen(true);
        }}
        onOpenMethodologies={() => {
          playTactileClick();
          setIsMethodologyOpen(true);
        }}
        onOpenNewArticle={() => {
          playTactileClick();
          setEditingItem(null);
          setIsArticleEditorOpen(true);
        }}
        onOpenImport={() => {
          playTactileClick();
          setIsImportModalOpen(true);
        }}
        onOpenCompanionTools={() => {
          playTactileClick();
          setIsCompanionToolsOpen(true);
        }}
        onOpenCustomizer={() => {
          playTactileClick();
          setCustomizerTargetBook(activeShelfItem);
          setIsCustomizerOpen(true);
        }}
        onOpenCommandPalette={() => {
          playTactileClick();
          setIsCommandPaletteOpen(true);
        }}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setShelfIndex(0);
        }}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
        readingNowCount={readingNowCount}
        totalNotesCount={notes.length}
        isGuest={!user}
        onOpenProfile={() => {
          playTactileClick();
          if (!user) {
            setAuthMode('login');
            setShowAuthModal(true);
          } else {
            setIsAboutOpen(true);
          }
        }}
        onOpenAccountSettings={() => {
          playTactileClick();
          setIsAccountSettingsOpen(true);
        }}
      />

      {/* PRIMARY STAGE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 1. PHYSICAL VINTAGE BOOKSHELF ARCHIVE (Primary Default View) */}
        {activeView === 'shelf' && (
          <main className="flex-1 flex flex-col justify-between animate-fadeIn">
            {/* Sub-header Library Counter + Category Folder Tabs */}
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                if (cat === 'ALL') {
                  const defaultCenter = researchItems.findIndex((i) => i.id === 'item-01');
                  setShelfIndex(defaultCenter >= 0 ? defaultCenter : 0);
                } else {
                  setShelfIndex(0);
                }
              }}
              items={researchItems}
              onOpenCategoryManager={() => {
                playTactileClick();
                setIsCategoryManagerOpen(true);
              }}
              onOpenImport={() => {
                playTactileClick();
                setIsImportModalOpen(true);
              }}
              onOpenNewArticle={() => {
                playTactileClick();
                setEditingItem(null);
                setIsArticleEditorOpen(true);
              }}
              onOpenCustomizer={() => {
                playTactileClick();
                setCustomizerTargetBook(activeShelfItem);
                setIsCustomizerOpen(true);
              }}
              viewMode="shelf"
              onChangeViewMode={(mode) => {
                if (mode === 'shelf') {
                  setActiveView('shelf');
                } else {
                  setCatalogDisplayFormat(mode);
                  setActiveView('catalog');
                }
              }}
            />

            {/* Central 3D Physical Vintage Bookshelf */}
            <div className="flex-1 flex flex-col justify-center my-auto">
              {filteredShelfBooks.length === 0 ? (
                <section className="mx-auto my-12 max-w-lg border border-[#141414]/15 bg-[#F4F2ED] p-8 text-center shadow-sm" aria-label="Empty library">
                  <BookOpen className="mx-auto mb-3 h-8 w-8 text-[#1F3FB0]" />
                  <h2 className="font-serif text-2xl text-[#141414]">Your library is empty</h2>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-[#77736B]">
                    Welcome to Marginalia. Import research papers (DOI, PDF, BibTeX/RIS) or load sample books to explore the vintage bookshelf.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={() => setIsImportModalOpen(true)} className="bg-[#141414] px-4 py-2 font-mono text-xs uppercase text-white hover:bg-[#1F3FB0] transition-colors cursor-pointer">
                      Add Papers
                    </button>
                    <button type="button" onClick={() => setIsTopicModalOpen(true)} className="border border-[#141414]/25 bg-white px-4 py-2 font-mono text-xs uppercase text-[#141414] hover:border-[#1F3FB0] hover:text-[#1F3FB0] transition-colors cursor-pointer flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#1F3FB0]" />
                      <span>Explore Topic Samples (Open Access)</span>
                    </button>
                    {researchItems.length > 0 && <button type="button" onClick={() => setActiveCategory('ALL')} className="border border-[#141414]/25 bg-white px-4 py-2 font-mono text-xs uppercase">Show all papers</button>}
                  </div>
                </section>
              ) : <>
              <ShelfArchive
                items={filteredShelfBooks}
                activeIndex={shelfIndex}
                onSelectIndex={(idx) => {
                  setShelfIndex(idx);
                }}
                onOpenDetail={(item) => {
                  playSheetExpand();
                  handleOpenShelfBook(item);
                }}
                onReadPaper={handleReadShelfBook}
                onCustomizeBook={(item) => {
                  playTactileClick();
                  setCustomizerTargetBook(item.bookPaperIds?.[0]
                    ? researchItems.find((paper) => paper.id === item.bookPaperIds?.[0]) || null
                    : item);
                  setIsCustomizerOpen(true);
                }}
                shelfMaterial={shelfMaterial}
                categoryAppearances={categoryAppearances}
                onCursorChange={setCursorState}
              />

              {/* Research Caption under Wooden Shelf */}
              <ResearchCaption
                item={activeShelfBook}
                currentIndex={shelfIndex}
                totalItems={filteredShelfBooks.length}
                onPrev={() => setShelfIndex((prev) => Math.max(0, prev - 1))}
                onNext={() =>
                  setShelfIndex((prev) =>
                    Math.min(filteredShelfBooks.length - 1, prev + 1)
                  )
                }
                onSelectIndex={(idx) => setShelfIndex(idx)}
                onOpen={(item) => {
                  playSheetExpand();
                  handleOpenShelfBook(item);
                }}
                onReadPaper={handleReadShelfBook}
                onAskAi={handleAskAiAboutPaper}
                onCustomizeBook={(item) => {
                  playTactileClick();
                  setCustomizerTargetBook(item.bookPaperIds?.[0]
                    ? researchItems.find((paper) => paper.id === item.bookPaperIds?.[0]) || null
                    : item);
                  setIsCustomizerOpen(true);
                }}
              />
              </>}
            </div>
          </main>
        )}

        {/* 2. CATALOG / INDEX VIEW (Grid or List View) */}
        {activeView === 'catalog' && (
          <div className="flex-1 animate-fadeIn">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
              }}
              items={researchItems}
              onOpenCategoryManager={() => {
                playTactileClick();
                setIsCategoryManagerOpen(true);
              }}
              onOpenImport={() => {
                playTactileClick();
                setIsImportModalOpen(true);
              }}
              onOpenNewArticle={() => {
                playTactileClick();
                setEditingItem(null);
                setIsArticleEditorOpen(true);
              }}
              onOpenCustomizer={() => {
                playTactileClick();
                setCustomizerTargetBook(activeShelfItem);
                setIsCustomizerOpen(true);
              }}
              viewMode={catalogDisplayFormat}
              onChangeViewMode={(mode) => {
                if (mode === 'shelf') {
                  setActiveView('shelf');
                } else {
                  setCatalogDisplayFormat(mode);
                  setActiveView('catalog');
                }
              }}
            />
            <LibraryView
              papers={filteredShelfItems}
              collections={collections}
              categories={categories}
              onSelectPaper={(paper) => {
                playSheetExpand();
                setActiveDetailItem(paper);
              }}
              onOpenReader={handleOpenInReader}
              onOpenImport={() => {
                playTactileClick();
                setIsImportModalOpen(true);
              }}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkDelete={handleBulkDelete}
              onCursorChange={setCursorState}
            />
          </div>
        )}

        {activeBookPaperIds && (
          <BookContentsModal
            bookTitle={activeBookTitle}
            collectionId={activeBookCollectionId}
            collections={collections}
            papers={activeBookPaperIds
              .map((id) => researchItems.find((paper) => paper.id === id))
              .filter((paper): paper is ResearchItem => Boolean(paper))}
            onClose={() => setActiveBookPaperIds(null)}
            onAddPapers={handleAddPapersToActiveBook}
            onMovePaper={handleMovePaperFromBook}
            onToggleRead={handleTogglePaperRead}
            onReadPaper={handleBookContentsRead}
            onOpenDossier={handleBookContentsDetails}
          />
        )}

        {/* 3. DEDICATED ACADEMIC READER */}
        {activeView === 'reader' && (
          <DedicatedReader
            paper={activeReaderPaper || researchItems[0] || null}
            readingQueue={readerQueueIds.map((id) => researchItems.find((paper) => paper.id === id)).filter((paper): paper is ResearchItem => Boolean(paper))}
            readingScope={readerScope}
            onNavigatePaper={handleNavigateReaderPaper}
            onClose={() => setActiveView(readerReturnView)}
            highlights={highlights.filter(
              (h) => h.paperId === (activeReaderPaper?.id || researchItems[0]?.id)
            )}
            onAddHighlight={handleAddHighlight}
            onDeleteHighlight={handleDeleteHighlight}
        onUpdateReadingProgress={handleUpdateReadingProgress}
            onAttachPdf={handleAttachPdfToActivePaper}
          />
        )}

        {/* 4. RESEARCH NOTEBOOK & LITERATURE SYNTHESIS */}
        {activeView === 'notes' && (
          <div className="flex-1 animate-fadeIn">
            <NotesView
              notes={notes}
              papers={researchItems}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onSelectPaper={(paper) => {
                playSheetExpand();
                setActiveDetailItem(paper);
              }}
            />
          </div>
        )}

        {/* 5. READING TRACKER & HABIT GOALS */}
        {activeView === 'tracker' && (
          <div className="flex-1 animate-fadeIn">
            <ReadingTrackerView
              papers={researchItems}
              goals={goals}
              readingSessions={readingSessions}
              highlights={highlights}
              notes={notes}
              onUpdateGoals={(newGoals) => {
                playTactileClick();
                setGoals(newGoals);
              }}
            />
          </div>
        )}

        {/* 6. AI RESEARCH ASSISTANT (Ask Your Library) */}
        {activeView === 'assistant' && (
          <div className="flex-1 animate-fadeIn">
            {geminiConfigured === true ? (
              <AiAssistantView
                onShowApiKeyPrompt={() => setShowApiKeyPrompt(true)}
                papers={researchItems}
                onOpenPaperInReader={handleOpenInReader}
                onOpenPaperDetail={(paper) => {
                  playSheetExpand();
                  setActiveDetailItem(paper);
                }}
              />
            ) : (
              <section className="mx-auto mt-16 max-w-2xl border border-[#141414]/15 bg-[#F4F1EA] p-8 text-center shadow-sm">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#1F3FB0]">Optional feature</p>
                <h1 className="mt-3 font-serif text-3xl text-[#141414]">AI Research Assistant is locked</h1>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#4A433B]">
                  Add your Gemini API key to enable research questions and literature synthesis. Without a key, the AI workspace stays unavailable and the rest of Marginalia continues to work.
                </p>
                <button
                  type="button"
                  onClick={() => setShowApiKeyPrompt(true)}
                  className="mt-6 border border-[#1F3FB0] bg-[#1F3FB0] px-5 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-[#18338f]"
                >
                  Configure AI access
                </button>
              </section>
            )}
          </div>
        )}

        {/* 7. RESEARCH MAP (Interactive Citation & Topic Topography) */}
        {activeView === 'graph' && (
          <div className="flex-1 animate-fadeIn">
            <ResearchMapView
              papers={researchItems}
              onOpenPaperInReader={handleOpenInReader}
              onOpenPaperDetail={(paper) => {
                playSheetExpand();
                setActiveDetailItem(paper);
              }}
            />
          </div>
        )}

        {/* 8. COLLECTIONS & TAGS TAXONOMY */}
        {activeView === 'collections' && (
          <div className="flex-1 animate-fadeIn">
            <CollectionsView
              papers={researchItems}
              collections={collections}
              initialSelectedCollectionId={collectionsSelection}
              onSelectedCollectionChange={setCollectionsSelection}
              onUpdateCollections={(cols) => {
                playTactileClick();
                handleUpdateCollectionFolders(cols);
              }}
              onUpdatePapers={handleUpdatePaperCollections}
              onTogglePaperRead={handleTogglePaperRead}
              onOpenPaperInReader={handleOpenInReader}
              onOpenPaperDetail={(paper) => {
                playSheetExpand();
                setActiveDetailItem(paper);
              }}
              onAddPapersToCollection={handleAddPapersToCollection}
            />
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Screens < 768px) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#EDE8DD]/95 backdrop-blur-md border-t border-[#141414]/20 py-1.5 px-3 flex items-center justify-around text-[10px] font-mono select-none"
        aria-label="Mobile Navigation"
      >
        <button
          onClick={() => {
            playTactileClick();
            setActiveView('shelf');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 cursor-pointer ${
            activeView === 'shelf' ? 'text-[#1F3FB0] font-semibold' : 'text-[#141414]/65'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Shelf</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveView('catalog');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 cursor-pointer ${
            activeView === 'catalog' ? 'text-[#1F3FB0] font-semibold' : 'text-[#141414]/65'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveView('reader');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 cursor-pointer ${
            activeView === 'reader' ? 'text-[#1F3FB0] font-semibold' : 'text-[#141414]/65'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Reader</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveView('notes');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 cursor-pointer ${
            activeView === 'notes' ? 'text-[#1F3FB0] font-semibold' : 'text-[#141414]/65'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notes</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setIsImportModalOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 p-1 text-[#1F3FB0] cursor-pointer font-bold"
        >
          <Upload className="w-4 h-4" />
          <span>Ingest</span>
        </button>
      </nav>

      {/* Minimal Editorial Footer (Shown when in shelf or catalog mode) */}
      <div className="pb-14 md:pb-0">
        <Footer affiliation={`${profile.primaryAffiliation} · FutureData4EU`} madeBy="Made by Amine" />
      </div>

      {/* MODALS & WORKSPACES */}

      {/* API Key Prompt for AI Features */}
      {showApiKeyPrompt && (
        <ApiKeyPrompt
          onDismiss={() => setShowApiKeyPrompt(false)}
          onConfigured={() => {
            setGeminiConfigured(true);
            setShowApiKeyPrompt(false);
          }}
        />
      )}

      {/* Onboarding Modal */}
      {isOnboardingOpen && (
        <Onboarding
          onComplete={() => setIsOnboardingOpen(false)}
          onSkip={() => setIsOnboardingOpen(false)}
        />
      )}

      {/* 0. Vintage Library & Bookbinding Customizer Studio */}
      <LibraryCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        items={researchItems}
        categories={categories}
        initialSelectedBook={customizerTargetBook || activeShelfItem}
        shelfMaterial={shelfMaterial}
        onChangeShelfMaterial={setShelfMaterial}
        sortMode={shelfSortMode}
        onChangeSortMode={setShelfSortMode}
        categoryAppearances={categoryAppearances}
        onUpdateCategoryAppearance={handleUpdateCategoryAppearance}
        onUpdateBookAppearance={handleUpdateBookAppearance}
        onMoveBookOrder={handleMoveBookOrder}
      />

      {/* 1. Dedicated Ingestion Studio (DOI Crossref, PDF, BibTeX, RIS, CSV) */}
      <DedicatedImportModal
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setImportCollectionIds([]); }}
        existingPapers={researchItems}
        onImportPapers={handleImportPapers}
        onStorePdf={handleStorePdf}
        categories={categories}
        collections={collections}
        defaultCollectionIds={importCollectionIds}
      />

      {/* 1.1 Open-Access Dynamic Topic Harvesting Modal */}
      <TopicSampleModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onLoadPapers={handleLoadTopicPapers}
      />

      {/* 2. Immersive Paper-like Detail Sheet Modal with Scroll Progress Bar */}
      {activeDetailItem && (
        <ResearchDetailSheet
          item={activeDetailItem}
          onClose={() => setActiveDetailItem(null)}
          onNavigatePrev={() => {
            const idx = filteredShelfItems.findIndex((x) => x.id === activeDetailItem.id);
            if (idx > 0) {
              setActiveDetailItem(filteredShelfItems[idx - 1]);
              setShelfIndex(idx - 1);
            }
          }}
          onNavigateNext={() => {
            const idx = filteredShelfItems.findIndex((x) => x.id === activeDetailItem.id);
            if (idx < filteredShelfItems.length - 1) {
              setActiveDetailItem(filteredShelfItems[idx + 1]);
              setShelfIndex(idx + 1);
            }
          }}
          hasPrev={filteredShelfItems.findIndex((x) => x.id === activeDetailItem.id) > 0}
          hasNext={
            filteredShelfItems.findIndex((x) => x.id === activeDetailItem.id) <
            filteredShelfItems.length - 1
          }
          onEdit={() => {
            setEditingItem(activeDetailItem);
            setIsArticleEditorOpen(true);
          }}
          onDelete={handleDeleteArticle}
          onStatusChange={(newStatus: ReadingStatus) => {
            handleBulkUpdateStatus([activeDetailItem.id], newStatus);
            setActiveDetailItem((curr) => (curr ? { ...curr, readingStatus: newStatus } : null));
          }}
          onOpenInReader={handleOpenInReader}
        />
      )}

      {/* 3. Article Authoring / Editing Modal */}
      {isArticleEditorOpen && (
        <ArticleEditorModal
          isOpen={isArticleEditorOpen}
          initialItem={editingItem}
          categories={categories}
          collections={collections}
          defaultBookId={collections.some((collection) => collection.id === collectionsSelection && collection.kind !== 'area' && !collection.isSmart) ? collectionsSelection : undefined}
          onClose={() => {
            setIsArticleEditorOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveArticle}
        />
      )}

      {/* 4. Category Manager Modal */}
      {isCategoryManagerOpen && (
        <CategoryManagerModal
          isOpen={isCategoryManagerOpen}
          categories={categories}
          researchItems={researchItems}
          onClose={() => setIsCategoryManagerOpen(false)}
          onUpdateCategories={(newCats: CategoryDefinition[]) => {
            setCategories(newCats);
          }}
          onReassignCategory={(oldCat, newCat) => {
            setResearchItems((prev) =>
              prev.map((i) => (i.category === oldCat ? { ...i, category: newCat } : i))
            );
          }}
        />
      )}

      {/* 5. Researcher Profile Modal */}
      {isAboutOpen && (
        <ResearcherProfileModal
          isOpen={isAboutOpen}
          profile={profile}
          onClose={() => setIsAboutOpen(false)}
          onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
        />
      )}

      {/* 6. Methodology Archive Modal */}
      {isMethodologyOpen && (
        <MethodologyArchiveModal
          isOpen={isMethodologyOpen}
          methodologies={METHODOLOGY_CARDS}
          allResearchItems={researchItems}
          onClose={() => setIsMethodologyOpen(false)}
          onSelectResearchItem={(item) => {
            setIsMethodologyOpen(false);
            setActiveDetailItem(item);
          }}
        />
      )}

      {/* 7. Companion Archive Tools (Export BibTeX, Backup, Restore) */}
      {isCompanionToolsOpen && (
        <CompanionToolsModal
          isOpen={isCompanionToolsOpen}
          onClose={() => setIsCompanionToolsOpen(false)}
          researchItems={researchItems}
          categories={categories}
          profile={profile}
          onImportData={(imported) => {
            if (imported.researchItems) setResearchItems(imported.researchItems);
            if (imported.categories) setCategories(imported.categories);
            if (imported.profile) setProfile(imported.profile);
          }}
          onClearContent={handleClearContent}
        />
      )}
    </div>
    </Suspense>
  </>);
}
