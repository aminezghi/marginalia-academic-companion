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
): { local: ResearchItem[], cloud: ResearchItem[] }[] => {
  const duplicates: { local: ResearchItem, cloud: ResearchItem }[] = [];
  
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

// Merge papers with priority to cloud data
const mergeResearchItem = (local: ResearchItem, cloud: ResearchItem): ResearchItem => {
  return {
    ...local,
    ...cloud,
    // Preserve local reading status if not set in cloud
    readingStatus: cloud.readingStatus || local.readingStatus,
    // Merge authors (prefer cloud)
    authors: cloud.authors?.length ? cloud.authors : local.authors,
    // Merge highlights (combine both)
    highlights: [...new Set([...(cloud.highlights || []), ...(local.highlights || [])])],
    // Merge notes (combine both)
    notes: [...new Set([...(cloud.notes || []), ...(local.notes || [])])],
  };
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
    const collectionDuplicates = findDuplicateItems(guestData.collections, existingCollections);
    
    // Merge items
    const mergedItems: ResearchItem[] = [];
    const seenIds = new Set<string>();
    
    // Add cloud items first
    existingItems.forEach(item => {
      mergedItems.push(item);
      seenIds.add(item.id);
    });
    
    // Add guest items, merging or adding
    guestData.researchItems.forEach(guestItem => {
      const duplicate = itemDuplicates.find(d => d.local.id === guestItem.id);
      if (duplicate) {
        mergedItems.push(mergeResearchItem(duplicate.local, duplicate.cloud));
      } else if (!seenIds.has(guestItem.id)) {
        mergedItems.push(guestItem);
        seenIds.add(guestItem.id);
      }
    });
    
    // Merge collections (similar logic)
    const mergedCollections: ResearchCollection[] = [];
    const seenCollectionIds = new Set<string>();
    
    existingCollections.forEach(collection => {
      mergedCollections.push(collection);
      seenCollectionIds.add(collection.id);
    });
    
    guestData.collections.forEach(guestCollection => {
      if (!seenCollectionIds.has(guestCollection.id)) {
        mergedCollections.push(guestCollection);
        seenCollectionIds.add(guestCollection.id);
      }
    });
    
    // Merge other data
    const mergedNotes = [
      ...existingCollections.map(c => ({ type: 'collection', data: c })),
      ...guestData.collections
    ] as any[];
    
    // Prepare migration payload
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
        email: '',
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
