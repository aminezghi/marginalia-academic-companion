import { ResearchItem, ResearchCollection, ResearchNote, Highlight, ReadingSession, ReadingGoal, ActivityLog, ResearcherProfile } from '../types/research';

interface GuestExportData {
  researchItems: ResearchItem[];
  collections: ResearchCollection[];
  notes: ResearchNote[];
  highlights: Highlight[];
  readingSessions: ReadingSession[];
  goals: ReadingGoal[];
  activities: ActivityLog[];
  categories: any[];
  profile: ResearcherProfile | null;
  settings: any;
  isGuest: boolean;
  guestId: string;
  guestCreatedAt: string;
}

interface MigrationResult {
  success: boolean;
  message: string;
  mergedCounts: {
    items: number;
    collections: number;
    notes: number;
    highlights: number;
    sessions: number;
    goals: number;
  };
  duplicates: {
    items: number;
    collections: number;
  };
}

// Detect duplicate papers by DOI, title, or URL
const findDuplicateItems = (
  localItems: ResearchItem[],
  cloudItems: ResearchItem[]
): { local: ResearchItem; cloud: ResearchItem }[] => {
  const duplicates: { local: ResearchItem; cloud: ResearchItem }[] = [];
  
  cloudItems.forEach(cloudItem => {
    localItems.forEach(localItem => {
      // Check DOI match
      if (cloudItem.doi && localItem.doi && cloudItem.doi === localItem.doi) {
        duplicates.push({ local: localItem, cloud: cloudItem });
        return;
      }
      // Check URL match
      if (cloudItem.url && localItem.url && cloudItem.url === localItem.url) {
        duplicates.push({ local: localItem, cloud: cloudItem });
        return;
      }
      // Check title match (fuzzy)
      if (cloudItem.title && localItem.title) {
        const titleDiff = Math.abs(cloudItem.title.length - localItem.title.length);
        if (titleDiff < 20 && cloudItem.title.toLowerCase() === localItem.title.toLowerCase()) {
          duplicates.push({ local: localItem, cloud: cloudItem });
        }
      }
    });
  });
  
  return duplicates;
};

export const migrateGuestToCloud = async (
  guestData: GuestExportData,
  cloudSync: (uid: string, data: any) => Promise<void>,
  uid: string
): Promise<MigrationResult> => {
  try {
    // First, fetch existing cloud data
    // This would typically be done via the API
    // For now, we'll assume we have access to existing cloud items
    const existingItems: ResearchItem[] = []; // Would be fetched from cloud
    const existingCollections: ResearchCollection[] = []; // Would be fetched from cloud
    
    // Find duplicates
    const itemDuplicates = findDuplicateItems(guestData.researchItems, existingItems);
    const collectionDuplicates: { local: ResearchCollection; cloud: ResearchCollection }[] = [];
    
    // Merge items - use a map to track seen IDs
    const mergedItemsMap = new Map<string, ResearchItem>();
    
    // Add cloud items first
    existingItems.forEach(item => {
      mergedItemsMap.set(item.id, item);
    });
    
    // Add guest items, merging or adding
    guestData.researchItems.forEach(guestItem => {
      const duplicate = itemDuplicates.find(d => d.local.id === guestItem.id);
      if (duplicate) {
        // Merge: preserve local reading status and add cloud data
        mergedItemsMap.set(guestItem.id, {
          ...duplicate.local,
          ...duplicate.cloud,
          readingStatus: duplicate.cloud.readingStatus || duplicate.local.readingStatus,
          authors: duplicate.cloud.authors?.length ? duplicate.cloud.authors : duplicate.local.authors,
        });
      } else if (!mergedItemsMap.has(guestItem.id)) {
        mergedItemsMap.set(guestItem.id, guestItem);
      }
    });
    
    const mergedItems = Array.from(mergedItemsMap.values());
    
    // Merge collections
    const mergedCollectionsMap = new Map<string, ResearchCollection>();
    
    existingCollections.forEach(collection => {
      mergedCollectionsMap.set(collection.id, collection);
    });
    
    guestData.collections.forEach(guestCollection => {
      if (!mergedCollectionsMap.has(guestCollection.id)) {
        mergedCollectionsMap.set(guestCollection.id, guestCollection);
      }
    });
    
    const mergedCollections = Array.from(mergedCollectionsMap.values());
    
    // Prepare migration payload - structured to match Firestore rules
    const migrationPayload = {
      uid,
      researchItems: mergedItems,
      collections: mergedCollections,
      notes: guestData.notes,
      highlights: guestData.highlights,
      readingSessions: guestData.readingSessions,
      goals: guestData.goals,
      activities: guestData.activities,
      categories: guestData.categories || [],
      profile: guestData.profile || {
        uid,
        displayName: `User ${uid.substring(0, 8)}`,
        primaryAffiliation: '',
        researchPillars: [],
        settings: guestData.settings || {
          shelfMaterial: 'walnut',
          shelfSortMode: 'custom',
          soundEnabled: true,
          aiConfigured: false,
        },
      },
      isMigrated: true,
      migratedFromGuest: true,
      guestId: guestData.guestId,
      guestCreatedAt: guestData.guestCreatedAt,
    };
    
    // Sync to cloud
    await cloudSync(uid, migrationPayload);
    
    return {
      success: true,
      message: 'Successfully migrated guest library to cloud account',
      mergedCounts: {
        items: mergedItems.length,
        collections: mergedCollections.length,
        notes: guestData.notes.length,
        highlights: guestData.highlights.length,
        sessions: guestData.readingSessions.length,
        goals: guestData.goals.length,
      },
      duplicates: {
        items: itemDuplicates.length,
        collections: collectionDuplicates.length,
      },
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Migration failed',
      mergedCounts: {
        items: 0,
        collections: 0,
        notes: 0,
        highlights: 0,
        sessions: 0,
        goals: 0,
      },
      duplicates: {
        items: 0,
        collections: 0,
      },
    };
  }
};
