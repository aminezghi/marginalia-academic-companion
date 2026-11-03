import { useState, useCallback } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';
import { ResearchItem, ResearchCollection, ResearchNote, Highlight, ReadingSession, ReadingGoal, ActivityLog, ResearcherProfile } from '../types/research';

interface SyncOptions {
  shelfMaterial?: string;
  shelfSortMode?: string;
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
      const userRef = doc(db, 'users', uid);
      
      // Check if user document exists
      const existingDoc = await getDoc(userRef);
      
      const userData = {
        uid,
        researchItems: data.researchItems || [],
        collections: data.collections || [],
        notes: data.notes || [],
        highlights: data.highlights || [],
        readingSessions: data.readingSessions || [],
        goals: data.goals || [],
        activities: data.activities || [],
        profiles: data.profiles || [],
        settings: {
          shelfMaterial: options.shelfMaterial || 'walnut',
          shelfSortMode: options.shelfSortMode || 'custom',
          soundEnabled: options.soundEnabled !== undefined ? options.soundEnabled : true,
          aiConfigured: options.aiConfigured || false,
        },
        lastSynced: new Date().toISOString(),
      };

      if (existingDoc.exists()) {
        // Update existing document
        await updateDoc(userRef, {
          ...userData,
          lastSynced: new Date().toISOString(),
        });
      } else {
        // Create new document
        await setDoc(userRef, userData);
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
      const userRef = doc(db, 'users', uid);
      
      const userData = {
        uid,
        researchItems,
        collections,
        notes,
        highlights,
        readingSessions,
        goals,
        activities,
        profiles: profiles.length > 0 ? profiles : [{
          uid,
          displayName: 'User',
          primaryAffiliation: '',
          researchPillars: [],
          settings: {
            shelfMaterial: options.shelfMaterial || 'walnut',
            shelfSortMode: options.shelfSortMode || 'custom',
            soundEnabled: options.soundEnabled !== undefined ? options.soundEnabled : true,
            aiConfigured: options.aiConfigured || false,
          },
        }],
        settings: {
          shelfMaterial: options.shelfMaterial || 'walnut',
          shelfSortMode: options.shelfSortMode || 'custom',
          soundEnabled: options.soundEnabled !== undefined ? options.soundEnabled : true,
          aiConfigured: options.aiConfigured || false,
        },
        lastSynced: new Date().toISOString(),
        migratedFromGuest: false,
      };

      await setDoc(userRef, userData, { merge: true });
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
  const updateField = useCallback(async (uid: string, field: string, value: any) => {
    if (!uid) return;

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        [field]: value,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }, []);

  // Upload PDF to Firebase Storage
  const uploadPdf = useCallback(async (uid: string, file: File): Promise<string> => {
    if (!uid) throw new Error('User not authenticated');

    try {
      const storage = getStorage();
      const fileName = `${uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('PDF upload error:', error);
      throw error;
    }
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
    fetchUserData,
    syncing,
    syncError,
    syncStatus,
  };
};
