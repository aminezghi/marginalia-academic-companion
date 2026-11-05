import { useState, useCallback } from 'react';
import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { ResearchItem, ResearchCollection, ResearchNote, Highlight, ReadingSession, ReadingGoal, ActivityLog, ResearcherProfile, ShelfWoodMaterial, ShelfSortMode } from '../types/research';
import {
  ensureUserProfileAndSettings,
  updateUserField as updateProfileOrSettingsField,
  updateUserSettingsDocument,
} from '../services/userProfile';
import { clearCurrentUsersPdfFiles } from '../services/pdfDocuments';

interface SyncOptions {
  shelfMaterial?: ShelfWoodMaterial;
  shelfSortMode?: ShelfSortMode;
  soundEnabled?: boolean;
  aiConfigured?: boolean;
}

interface ImportOptions {
  researchItems: ResearchItem[];
  collections: ResearchCollection[];
  notes: ResearchNote[];
  highlights: Highlight[];
  readingSessions: ReadingSession[];
  goals: ReadingGoal[];
  activities: ActivityLog[];
  profiles: ResearcherProfile[];
  options: SyncOptions;
}

// Generate a random 8-character hexadecimal identifier
function generateHexId(): string {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Storage rules allow letters, digits, underscores and hyphens in the stem.
// Replace dots in publisher filenames (for example, `s2.0`) as well.
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Generate valid PDF filename matching storage rules pattern
// Format: {timestamp}_{8-char-hex-uuid}_{sanitized-filename}.pdf
function generatePdfFilename(uid: string, originalFilename: string): string {
  const timestamp = Date.now().toString(); // 13 digits
  if (timestamp.length !== 13) {
    throw new Error('Invalid timestamp length');
  }
  const hexId = generateHexId();
  const nameWithoutExt = sanitizeFilename(originalFilename);
  return `pdfs/${uid}/${timestamp}_${hexId}_${nameWithoutExt}.pdf`;
}

export const useFirebaseSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Sync local data to cloud
  const syncToCloud = useCallback(async (
    uid: string,
    data: ImportOptions,
    options: SyncOptions = {}
  ) => {
    if (!uid) return;

    setSyncing(true);
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        throw new Error('Cloud sync requires the matching authenticated user.');
      }
      await ensureUserProfileAndSettings(db, currentUser);
      await updateUserSettingsDocument(db, currentUser, {
        ...data.options,
        ...options,
        lastSynced: new Date().toISOString(),
      });

      // Store each entity in its proper subcollection
      // Papers go to users/{uid}/papers
      const papersCol = collection(db, 'users', uid, 'papers');
      for (const item of data.researchItems) {
        const paperRef = doc(papersCol, item.id);
        await setDoc(paperRef, {
          id: item.id,
          collectionIds: item.collectionIds || [],
          title: item.title,
          authors: item.authors,
          year: item.year,
          readingStatus: item.readingStatus === 'archived' ? 'archive' : item.readingStatus,
          priority: item.priority || item.evaluation?.priority || 'medium',
          source: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(item.storagePath && { storagePath: item.storagePath }),
          ...(item.pageCount && { pageCount: item.pageCount }),
        });
      }

      // Collections go to users/{uid}/collections
      const collectionsCol = collection(db, 'users', uid, 'collections');
      for (const coll of data.collections) {
        const colRef = doc(collectionsCol, coll.id);
        await setDoc(colRef, {
          id: coll.id,
          name: coll.name,
          type: coll.isSmart ? 'smart' : coll.kind === 'area' ? 'project' : 'folder',
          ...(coll.description !== undefined && { description: coll.description }),
          ...(coll.parentId !== undefined && { parentId: coll.parentId }),
          ...(coll.color !== undefined && { color: coll.color }),
          ...(coll.isSmart !== undefined && { isSmart: coll.isSmart }),
          ...(coll.smartFilter !== undefined && { smartFilter: coll.smartFilter }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setSyncStatus('synced');
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
      setSyncStatus('error');
    } finally {
      setSyncing(false);
    }
  }, []);

  // Import local data to cloud (for guest migration)
  const importLocalToCloud = useCallback(async (
    uid: string,
    researchItems: ResearchItem[],
    collections: ResearchCollection[],
    notes: ResearchNote[],
    highlights: Highlight[],
    readingSessions: ReadingSession[],
    goals: ReadingGoal[],
    activities: ActivityLog[],
    profiles: ResearcherProfile[],
    options: SyncOptions = {}
  ) => {
    if (!uid) return;

    setSyncing(true);
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      // Store in subcollections
      await syncToCloud(uid, {
        researchItems,
        collections,
        notes,
        highlights,
        readingSessions,
        goals,
        activities,
        profiles,
        options,
      });
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('Import error:', error);
      setSyncError(error instanceof Error ? error.message : 'Import failed');
      setSyncStatus('error');
    } finally {
      setSyncing(false);
    }
  }, []);

  // Update specific field in cloud
  const updateField = useCallback(async (uid: string, field: string, value: unknown) => {
    if (!uid) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        throw new Error('User updates require the matching authenticated user.');
      }
      await updateProfileOrSettingsField(db, currentUser, field, value);
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }, []);

  // Reset only the signed-in user's library and activity data. Account identity
  // and settings are intentionally retained.
  const clearUserContent = useCallback(async (uid: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('Reset requires the matching signed-in account.');
    }

    const deleteDocuments = async (path: string) => {
      const snapshot = await getDocs(collection(db, path));
      // Keep batches modest so large libraries do not overwhelm the browser
      // or trigger request limits. Rules still authorize each owner-only delete.
      for (let index = 0; index < snapshot.docs.length; index += 25) {
        await Promise.all(snapshot.docs.slice(index, index + 25).map((entry) => deleteDoc(entry.ref)));
      }
    };
    const userRoot = `users/${uid}`;

    // Remove private PDF bytes first. If Storage denies access or is unavailable,
    // stop before deleting Firestore metadata so the user can retry without a
    // half-cleared library.
    await clearCurrentUsersPdfFiles(uid);

    const papers = await getDocs(collection(db, `${userRoot}/papers`));
    for (const paper of papers.docs) {
      await Promise.all([
        deleteDocuments(`${userRoot}/papers/${paper.id}/PDFs`),
        deleteDocuments(`${userRoot}/papers/${paper.id}/annotations`),
      ]);
      await deleteDoc(paper.ref);
    }

    const userCollections = await getDocs(collection(db, `${userRoot}/collections`));
    for (const userCollection of userCollections.docs) {
      await deleteDocuments(`${userRoot}/collections/${userCollection.id}/memberships`);
      await deleteDoc(userCollection.ref);
    }

    await Promise.all([
      'volumes', 'readingProgress', 'notes', 'highlights', 'bookmarks', 'goals', 'migrations', 'activities',
    ].map((name) => deleteDocuments(`${userRoot}/${name}`)));
  }, []);

  const deleteUserCollection = useCallback(async (uid: string, collectionId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('Collection changes require the matching signed-in account.');
    }
    const membershipPath = `users/${uid}/collections/${collectionId}/memberships`;
    const memberships = await getDocs(collection(db, membershipPath));
    await Promise.all(memberships.docs.map((membership) => deleteDoc(membership.ref)));
    await deleteDoc(doc(db, 'users', uid, 'collections', collectionId));
  }, []);

  // Upload PDF to Firebase Storage
  const uploadPdf = useCallback(async (uid: string, file: File): Promise<string> => {
    if (!uid) throw new Error('User not authenticated');

    try {
      const fileName = generatePdfFilename(uid, file.name);
      const storageRef = ref(storage, fileName);
      
      // Validate MIME type before upload
      if (file.type && file.type !== 'application/pdf') {
        throw new Error('Invalid file type. Only PDFs are allowed.');
      }
      
      // Validate file size (100 MB limit)
      const MAX_SIZE = 100 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error('File too large. Maximum size is 100 MB.');
      }
      if (file.size <= 0) {
        throw new Error('File is empty.');
      }
      
      await uploadBytes(storageRef, file, { contentType: 'application/pdf' });
      
      // Return the Storage path, not a permanent download URL
      // Path format: pdfs/{uid}/{13-digit-timestamp}_{8-char-hex-uuid}_{sanitized-name}.pdf
      return fileName;
    } catch (error) {
      console.error('PDF upload error:', error);
      throw error;
    }
  }, []);

  const persistPaperPdfAttachment = useCallback(async (uid: string, paper: ResearchItem): Promise<void> => {
    if (!uid || !paper.storagePath) throw new Error('A signed-in owner and uploaded PDF path are required.');
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('PDF metadata can only be saved by the matching account.');
    }

    const paperRef = doc(db, 'users', uid, 'papers', paper.id);
    const existing = await getDoc(paperRef);
    const updatedAt = new Date().toISOString();
    const pdfMetadata = {
      storagePath: paper.storagePath,
      ...(paper.pageCount && paper.pageCount > 0 ? { pageCount: paper.pageCount } : {}),
      updatedAt,
    };
    if (existing.exists()) {
      await updateDoc(paperRef, pdfMetadata);
      return;
    }

    await setDoc(paperRef, {
      id: paper.id,
      collectionIds: paper.collectionIds || [],
      title: paper.title,
      authors: paper.authors,
      year: String(paper.year || new Date().getFullYear()),
      readingStatus: paper.readingStatus === 'archived' ? 'archive' : paper.readingStatus,
      priority: paper.priority || paper.evaluation?.priority || 'medium',
      source: 'user',
      storagePath: paper.storagePath,
      ...(paper.pageCount && paper.pageCount > 0 ? { pageCount: paper.pageCount } : {}),
      createdAt: updatedAt,
      updatedAt,
    });
  }, []);

  // Fetch cloud data for user
  const fetchUserData = useCallback(async (uid: string) => {
    if (!uid) return null;

    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }, []);

  return {
    syncToCloud,
    importLocalToCloud,
    updateField,
    uploadPdf,
    persistPaperPdfAttachment,
    clearUserContent,
    deleteUserCollection,
    fetchUserData,
    syncing,
    syncError,
    syncStatus,
  };
};
