import { useState, useEffect, useCallback } from 'react';

const GUEST_ID_KEY = 'marginalia_guest_id';
const GUEST_PROFILE_KEY = 'marginalia_guest_profile';
const GUEST_DATA_KEY = 'marginalia_guest_data';

interface GuestProfile {
  id: string;
  name: string;
  email: string;
  displayName: string;
  createdAt: string;
}

interface GuestData {
  isGuest: boolean;
  profile: GuestProfile | null;
  dataMigrated: boolean;
}

export const useGuestMode = () => {
  const [guestState, setGuestState] = useState<GuestData>({
    isGuest: false,
    profile: null,
    dataMigrated: false,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Generate unique guest ID
  const generateGuestId = useCallback(() => {
    return 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }, []);

  // Initialize guest mode
  useEffect(() => {
    const initializeGuestMode = () => {
      try {
        // Check if already a guest or registered user
        const existingGuestId = localStorage.getItem(GUEST_ID_KEY);
        const existingProfile = localStorage.getItem(GUEST_PROFILE_KEY);
        
        if (existingGuestId) {
          setGuestState({
            isGuest: true,
            profile: existingProfile ? JSON.parse(existingProfile) : null,
            dataMigrated: false,
          });
        }
      } catch (error) {
        console.error('Error initializing guest mode:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeGuestMode();
  }, []);

  // Create or get guest profile
  const createGuestProfile = useCallback((name: string, email?: string) => {
    const guestId = generateGuestId();
    const profile: GuestProfile = {
      id: guestId,
      name,
      email: email || `${guestId}@guest.marginalia.local`,
      displayName: name,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(GUEST_ID_KEY, guestId);
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
      
      setGuestState({
        isGuest: true,
        profile,
        dataMigrated: false,
      });
    } catch (error) {
      console.error('Error creating guest profile:', error);
    }
  }, [generateGuestId]);

  // Clear guest data
  const clearGuestData = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_ID_KEY);
      localStorage.removeItem(GUEST_PROFILE_KEY);
      localStorage.removeItem(GUEST_DATA_KEY);
      
      setGuestState({
        isGuest: false,
        profile: null,
        dataMigrated: false,
      });
    } catch (error) {
      console.error('Error clearing guest data:', error);
    }
  }, []);

  // Mark data as migrated (guest to registered user)
  const markDataMigrated = useCallback(() => {
    setGuestState(prev => ({ ...prev, dataMigrated: true }));
  }, []);

  // Get guest export data
  const getGuestExportData = useCallback(() => {
    const researchItems = localStorage.getItem('academic_archive_items_v3');
    const collections = localStorage.getItem('academic_archive_collections_v2');
    const notes = localStorage.getItem('academic_archive_notes_v2');
    const highlights = localStorage.getItem('academic_archive_highlights_v2');
    const readingSessions = localStorage.getItem('academic_archive_sessions_v2');
    const goals = localStorage.getItem('academic_archive_goals_v2');
    const activities = localStorage.getItem('academic_archive_activities_v2');
    const categories = localStorage.getItem('academic_archive_categories_v2');
    const profile = localStorage.getItem('academic_archive_profile_v2');
    const settings = localStorage.getItem('marginalia_settings_v1');
    
    return {
      researchItems: researchItems ? JSON.parse(researchItems) : [],
      collections: collections ? JSON.parse(collections) : [],
      notes: notes ? JSON.parse(notes) : [],
      highlights: highlights ? JSON.parse(highlights) : [],
      readingSessions: readingSessions ? JSON.parse(readingSessions) : [],
      goals: goals ? JSON.parse(goals) : [],
      activities: activities ? JSON.parse(activities) : [],
      categories: categories ? JSON.parse(categories) : [],
      profile: profile ? JSON.parse(profile) : null,
      settings: settings ? JSON.parse(settings) : null,
      isGuest: true,
      guestId: localStorage.getItem(GUEST_ID_KEY),
      guestCreatedAt: guestState.profile?.createdAt || new Date().toISOString(),
    };
  }, [guestState.profile]);

  return {
    guestState,
    isInitialized,
    createGuestProfile,
    clearGuestData,
    markDataMigrated,
    getGuestExportData,
  };
};
