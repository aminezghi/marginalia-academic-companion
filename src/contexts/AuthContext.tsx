import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyPasswordResetCode,
  confirmPasswordReset,
  deleteUser,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { auth, db, googleProvider, shouldUseEmulators } from '../config/firebase';
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';
import {
  ensureUserProfileAndSettings,
  initializeNewUserProfileAndSettings,
  updateUserProfileDocument,
  updateUserSettingsDocument,
  clearUserProfileInitializationCache,
  UserProfileUpdate,
  UserProfileView,
  UserSettingsUpdate,
} from '../services/userProfile';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  userProfile: UserProfileView | null;
  updateUserProfile: (data: UserProfileUpdate) => Promise<void>;
  updateUserSettings: (data: UserSettingsUpdate) => Promise<void>;
  // Password reset functions
  sendPasswordReset: (email: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<string>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  // Account management functions
  exportUserData: () => Promise<Blob>;
  deleteAccount: (password: string) => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfileView | null>(null);
  const authOperationInProgress = useRef(false);

  useEffect(() => {
    let authChange = 0;
    // Resolve redirect errors after Google sends the browser back. Successful
    // redirects are also observed below; profile initialization stays in the
    // single idempotent auth-state path.
    void getRedirectResult(auth).catch((error: unknown) => {
      console.error('Error completing Google sign-in redirect:', error);
      window.dispatchEvent(new CustomEvent('marginalia:google-auth-error', { detail: error }));
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentAuthChange = ++authChange;
      if (user) {
        setUser(user);
        if (authOperationInProgress.current) {
          setUserProfile(null);
          if (currentAuthChange === authChange) setLoading(false);
          return;
        }
        try {
          const profile = await ensureUserProfileAndSettings(db, user);
          if (currentAuthChange === authChange && auth.currentUser?.uid === user.uid) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error initializing user profile:', error);
          if (currentAuthChange === authChange && auth.currentUser?.uid === user.uid) {
            setUserProfile(null);
          }
        }
      } else {
        clearUserProfileInitializationCache();
        setUser(null);
        setUserProfile(null);
      }
      if (currentAuthChange === authChange) setLoading(false);
    });

    return () => {
      authChange += 1;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    authOperationInProgress.current = true;
    try {
      // The hosted web app uses a top-level navigation so Chrome popup
      // blockers cannot interrupt sign-in. Keep popup behavior for the Auth
      // Emulator, which is explicitly exercised by the E2E suite, and local
      // development. Production authDomain is same-site and proxied by Vercel.
      const isProductionHost = window.location.hostname === 'marginalia-academic.vercel.app' || window.location.hostname === 'marginalia-academic-knowledge-compa.vercel.app';
      if (!shouldUseEmulators() && isProductionHost) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      const result = await signInWithPopup(auth, googleProvider);
      const profile = getAdditionalUserInfo(result)?.isNewUser
        ? await initializeNewUserProfileAndSettings(db, result.user)
        : await ensureUserProfileAndSettings(db, result.user);
      setUser(result.user);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      authOperationInProgress.current = false;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    authOperationInProgress.current = true;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await ensureUserProfileAndSettings(db, result.user);
      setUser(result.user);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    } finally {
      authOperationInProgress.current = false;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    authOperationInProgress.current = true;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: displayName.trim() });
      const profile = await initializeNewUserProfileAndSettings(db, user);
      setUser(user);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      authOperationInProgress.current = false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  // Send password reset email
  const sendPasswordReset = async (email: string) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      // Don't reveal if email exists - use generic message for security
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        // Still resolve to prevent email enumeration
        return;
      }
      throw error;
    }
  };

  // Verify password reset code
  const verifyResetCode = async (code: string) => {
    if (!code || code.trim().length === 0) {
      throw new Error('Invalid reset code');
    }
    try {
      const email = await verifyPasswordResetCode(auth, code);
      return email;
    } catch (error: any) {
      console.error('Error verifying reset code:', error);
      if (error.code === 'auth/invalid-action-code' || error.code === 'auth/expired-action-code') {
        throw new Error('This reset link is invalid or has expired. Please request a new one.');
      }
      throw new Error('Unable to verify reset code. Please try again.');
    }
  };

  // Confirm password reset with new password
  const confirmPasswordResetFn = async (code: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    try {
      await confirmPasswordReset(auth, code, newPassword);
    } catch (error: any) {
      console.error('Error confirming password reset:', error);
      if (error.code === 'auth/invalid-action-code' || error.code === 'auth/expired-action-code') {
        throw new Error('This reset link is invalid or has expired. Please request a new one.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password.');
      }
      throw error;
    }
  };

  // Reauthenticate user for sensitive operations
  const reauthenticate = async (password: string) => {
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    } catch (error: any) {
      console.error('Reauthentication failed:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      }
      throw error;
    }
  };

  // Export all user data
  const exportUserData = async (): Promise<Blob> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const uid = user.uid;
      const exportData: any = {
        exportDate: new Date().toISOString(),
        userId: uid,
        profile: userProfile,
        papers: [],
        collections: [],
        notes: [],
        highlights: [],
        readingSessions: [],
        goals: [],
        activities: [],
        settings: userProfile?.settings || {},
      };

      // Fetch papers from users/{uid}/papers
      const papersCol = collection(db, 'users', uid, 'papers');
      const papersSnap = await getDocs(papersCol);
      exportData.papers = papersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch collections
      const collectionsCol = collection(db, 'users', uid, 'collections');
      const collectionsSnap = await getDocs(collectionsCol);
      exportData.collections = collectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch notes
      const notesCol = collection(db, 'users', uid, 'notes');
      const notesSnap = await getDocs(notesCol);
      exportData.notes = notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch highlights
      const highlightsCol = collection(db, 'users', uid, 'highlights');
      const highlightsSnap = await getDocs(highlightsCol);
      exportData.highlights = highlightsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch reading sessions
      const sessionsCol = collection(db, 'users', uid, 'readingSessions');
      const sessionsSnap = await getDocs(sessionsCol);
      exportData.readingSessions = sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch goals
      const goalsCol = collection(db, 'users', uid, 'goals');
      const goalsSnap = await getDocs(goalsCol);
      exportData.goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch activities
      const activitiesCol = collection(db, 'users', uid, 'activities');
      const activitiesSnap = await getDocs(activitiesCol);
      exportData.activities = activitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch user-owned PDFs from Storage
      const storage = getStorage();
      const userPdfsRef = ref(storage, `pdfs/${uid}`);
      try {
        const pdfsList = await listAll(userPdfsRef);
        exportData.pdfFiles = pdfsList.items.map(item => ({
          name: item.name,
          fullPath: item.fullPath,
          bucket: item.bucket,
        }));
      } catch (storageError) {
        console.warn('Could not list PDF files:', storageError);
        exportData.pdfFiles = [];
      }

      // Create a Blob with the JSON data
      const jsonString = JSON.stringify(exportData, null, 2);
      return new Blob([jsonString], { type: 'application/json' });
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export user data');
    }
  };

  // Delete user account and all associated data
  const deleteAccount = async (password: string) => {
    if (!user || !user.email) throw new Error('User not authenticated');
    
    const uid = user.uid;
    
    try {
      // First reauthenticate
      await reauthenticate(password);
      
      // Delete user's PDF files from Storage
      const storage = getStorage();
      const userPdfsRef = ref(storage, `pdfs/${uid}`);
      try {
        const pdfsList = await listAll(userPdfsRef);
        for (const item of pdfsList.items) {
          await deleteObject(item);
        }
      } catch (storageError) {
        console.warn('Could not delete PDF files:', storageError);
      }

      // Delete Firestore subcollections
      const subcollections = [
        'papers',
        'collections',
        'notes',
        'highlights',
        'readingSessions',
        'goals',
        'activities',
      ];

      for (const colName of subcollections) {
        const colRef = collection(db, 'users', uid, colName);
        const snap = await getDocs(colRef);
        for (const docSnap of snap.docs) {
          await deleteDoc(docSnap.ref);
        }
      }

      // Delete user document
      await deleteDoc(doc(db, 'users', uid));

      // Delete the Firebase Auth user
      await deleteUser(user);
      
      // Clear local data
      localStorage.removeItem('academic_archive_items_v3');
      localStorage.removeItem('academic_archive_collections_v2');
      localStorage.removeItem('academic_archive_notes_v2');
      localStorage.removeItem('academic_archive_highlights_v2');
      localStorage.removeItem('academic_archive_sessions_v2');
      localStorage.removeItem('academic_archive_goals_v2');
      localStorage.removeItem('academic_archive_activities_v2');
      localStorage.removeItem('academic_archive_categories_v2');
      
    } catch (error: any) {
      console.error('Account deletion failed:', error);
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please log in again before deleting your account');
      }
      throw error;
    }
  };

  const updateUserProfile = useCallback(async (data: UserProfileUpdate) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const profile = await updateUserProfileDocument(db, user, data);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }, [user]);

  const updateUserSettings = useCallback(async (data: UserSettingsUpdate) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const settings = await updateUserSettingsDocument(db, user, data);
      setUserProfile((previous) => (previous ? { ...previous, settings } : previous));
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }, [user]);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    logout,
    userProfile,
    updateUserProfile,
    updateUserSettings,
    sendPasswordReset,
    verifyResetCode,
    confirmPasswordReset: confirmPasswordResetFn,
    exportUserData,
    deleteAccount,
    reauthenticate,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
