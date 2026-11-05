import type { User } from 'firebase/auth';
import { onIdTokenChanged } from 'firebase/auth';
import {
  doc,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ShelfSortMode, ShelfWoodMaterial } from '../types/research';
import { auth } from '../config/firebase';

export interface UserProfileDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  provider: string;
  createdAt: Timestamp;
  migratedFromGuest?: boolean;
  guestMigrationId?: string;
  lastLoginAt?: Timestamp;
  migratedAt?: Timestamp;
}

export interface UserSettings {
  userId: string;
  createdAt?: Timestamp;
  lastUpdated?: Timestamp;
  shelfMaterial: ShelfWoodMaterial;
  shelfSortMode: ShelfSortMode;
  soundEnabled: boolean;
  aiConfigured: boolean;
  theme?: string;
  language?: string;
  notifications?: boolean;
  appearance?: string;
  lastSynced?: string | null;
  version?: string;
}

export interface UserProfileView extends UserProfileDocument {
  settings: UserSettings;
  // Legacy profile fields remain readable for existing documents, but are not
  // written to the strict root profile document.
  name?: string;
  title?: string;
  primaryAffiliation?: string;
  researchPillars?: string[];
}

export type UserProfileUpdate = Partial<
  Pick<
    UserProfileDocument,
    'displayName' | 'photoURL' | 'provider' | 'migratedFromGuest' | 'guestMigrationId' | 'lastLoginAt' | 'migratedAt'
  >
>;

export type UserSettingsUpdate = Partial<
  Pick<
    UserSettings,
    | 'shelfMaterial'
    | 'shelfSortMode'
    | 'soundEnabled'
    | 'aiConfigured'
    | 'theme'
    | 'language'
    | 'notifications'
    | 'appearance'
    | 'lastSynced'
    | 'version'
  >
>;

const DEFAULT_SETTINGS: Pick<
  UserSettings,
  'shelfMaterial' | 'shelfSortMode' | 'soundEnabled' | 'aiConfigured'
> = {
  shelfMaterial: 'walnut',
  shelfSortMode: 'custom',
  soundEnabled: true,
  aiConfigured: false,
};

const SETTINGS_FIELDS = [
  'shelfMaterial',
  'shelfSortMode',
  'soundEnabled',
  'aiConfigured',
  'theme',
  'language',
  'notifications',
  'appearance',
  'lastSynced',
  'version',
] as const;

const PROFILE_FIELDS = [
  'displayName',
  'photoURL',
  'provider',
  'migratedFromGuest',
  'guestMigrationId',
  'lastLoginAt',
  'migratedAt',
] as const;

const profileInitializationByUid = new Map<string, Promise<UserProfileView>>();
const initializedProfilesByUid = new Map<string, UserProfileView>();

export function clearUserProfileInitializationCache(): void {
  profileInitializationByUid.clear();
  initializedProfilesByUid.clear();
}

async function waitForAuthenticatedUserToken(user: User): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let unsubscribe: () => void = () => {};
    unsubscribe = onIdTokenChanged(auth, (activeUser) => {
      if (activeUser?.uid === user.uid) {
        unsubscribe();
        resolve();
      } else if (activeUser) {
        unsubscribe();
        reject(new Error('The active Firebase user does not match the profile being initialized.'));
      }
    });
  });
  // Ensure a token has been issued for the user before the first Firestore write.
  await user.getIdToken(true);
}

function pickLegacySettings(value: unknown): UserSettingsUpdate {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};

  const legacy = value as Record<string, unknown>;
  const picked: UserSettingsUpdate = {};
  for (const key of SETTINGS_FIELDS) {
    const settingValue = legacy[key];
    if (settingValue !== undefined) {
      Object.assign(picked, { [key]: settingValue });
    }
  }
  return picked;
}

function validateProfileUpdate(update: UserProfileUpdate): void {
  const unsupported = Object.keys(update).filter(
    (key) => !PROFILE_FIELDS.some((allowedKey) => allowedKey === key),
  );
  if (unsupported.length > 0) {
    throw new Error(`Unsupported profile field: ${unsupported.join(', ')}`);
  }
}

function validateSettingsUpdate(update: UserSettingsUpdate): void {
  const unsupported = Object.keys(update).filter(
    (key) => !SETTINGS_FIELDS.some((allowedKey) => allowedKey === key),
  );
  if (unsupported.length > 0) {
    throw new Error(`Unsupported settings field: ${unsupported.join(', ')}`);
  }
}

export async function readUserProfileAndSettings(
  firestore: Firestore,
  uid: string,
): Promise<UserProfileView> {
  const documents = await readUserProfileDocuments(firestore, uid);

  return {
    ...documents.profile,
    settings: documents.settings,
  };
}

export async function readUserProfileDocuments(
  firestore: Firestore,
  uid: string,
): Promise<{ profile: UserProfileDocument; settings: UserSettings }> {
  const profileRef = doc(firestore, 'users', uid);
  const settingsRef = doc(firestore, 'users', uid, 'settings', 'current');
  const [profileSnapshot, settingsSnapshot] = await Promise.all([
    getDoc(profileRef),
    getDoc(settingsRef),
  ]);

  if (!profileSnapshot.exists()) {
    throw new Error('The authenticated user profile has not been initialized.');
  }

  const profileData = profileSnapshot.data() as UserProfileDocument & Record<string, unknown>;
  const settingsData = settingsSnapshot.exists() ? settingsSnapshot.data() : {};

  return {
    profile: profileData,
    settings: {
      ...DEFAULT_SETTINGS,
      ...settingsData,
      userId: uid,
    } as UserSettings,
  };
}

/** Create only missing documents. Existing profile/settings values are untouched. */
async function initializeMissingUserDocuments(
  firestore: Firestore,
  user: User,
): Promise<UserProfileView> {
  const email = user.email?.trim();
  if (!email) {
    throw new Error('A verified email address is required to create a Marginalia profile.');
  }
  // Ensure the auth emulator/token provider has observed a fresh credential
  // before the first owner-only Firestore reads after registration.
  await waitForAuthenticatedUserToken(user);

  const profileRef = doc(firestore, 'users', user.uid);
  const settingsRef = doc(firestore, 'users', user.uid, 'settings', 'current');

  const existingProfile = await getDoc(profileRef);
  let profileData: UserProfileDocument & Record<string, unknown>;
  if (existingProfile.exists()) {
    profileData = existingProfile.data() as UserProfileDocument & Record<string, unknown>;
  } else {
    const provider = user.providerData[0]?.providerId || 'password';
    const newProfile = {
      uid: user.uid,
      email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || null,
      provider,
      createdAt: Timestamp.now(),
    };
    try {
      await setDoc(profileRef, newProfile);
      profileData = newProfile;
    } catch (error) {
      const profileAfterConflict = await getDoc(profileRef);
      if (!profileAfterConflict.exists()) throw error;
      profileData = profileAfterConflict.data() as UserProfileDocument & Record<string, unknown>;
    }
  }

  const settingsSnapshot = await getDoc(settingsRef);
  let settingsData: UserSettings;
  if (settingsSnapshot.exists()) {
    settingsData = settingsSnapshot.data() as UserSettings;
  } else {
    const legacySettings = pickLegacySettings(profileData.settings);
    const newSettings: UserSettings = {
      userId: user.uid,
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      ...DEFAULT_SETTINGS,
      ...legacySettings,
    };
    try {
      await setDoc(settingsRef, {
        ...newSettings,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
    });
      settingsData = newSettings;
    } catch (error) {
      const settingsAfterConflict = await getDoc(settingsRef);
      if (!settingsAfterConflict.exists()) throw error;
      settingsData = settingsAfterConflict.data() as UserSettings;
    }
  }

  return {
    ...profileData,
    settings: {
      ...DEFAULT_SETTINGS,
      ...settingsData,
      userId: user.uid,
    },
  } as UserProfileView;
}

/**
 * Initialize the profile immediately after Firebase creates a brand-new Auth
 * user. The UID is newly allocated, so this path can safely create both docs
 * directly and avoids reading a missing profile while the Firestore Auth token
 * provider is still settling. Existing accounts always use the read-first
 * initializer above and never have settings overwritten during login.
 */
export async function initializeNewUserProfileAndSettings(
  firestore: Firestore,
  user: User,
): Promise<UserProfileView> {
  const email = user.email?.trim();
  if (!email) throw new Error('A verified email address is required to create a Marginalia profile.');

  await waitForAuthenticatedUserToken(user);
  const provider = user.providerData[0]?.providerId || 'password';
  const profile: UserProfileDocument = {
    uid: user.uid,
    email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || null,
    provider,
    createdAt: Timestamp.now(),
  };
  const settings: UserSettings = {
    userId: user.uid,
    createdAt: Timestamp.now(),
    lastUpdated: Timestamp.now(),
    ...DEFAULT_SETTINGS,
  };

  await setDoc(doc(firestore, 'users', user.uid), profile);
  await setDoc(doc(firestore, 'users', user.uid, 'settings', 'current'), {
    ...settings,
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });

  const initializedProfile = { ...profile, settings };
  initializedProfilesByUid.set(user.uid, initializedProfile);
  return initializedProfile;
}

/** Share an in-flight initialization so auth observers and sync cannot race on first login. */
export function ensureUserProfileAndSettings(
  firestore: Firestore,
  user: User,
): Promise<UserProfileView> {
  const initializedProfile = initializedProfilesByUid.get(user.uid);
  if (initializedProfile) return Promise.resolve(initializedProfile);

  const existingInitialization = profileInitializationByUid.get(user.uid);
  if (existingInitialization) return existingInitialization;

  const initialization = initializeMissingUserDocuments(firestore, user);
  profileInitializationByUid.set(user.uid, initialization);
  void initialization.then((profile) => {
    initializedProfilesByUid.set(user.uid, profile);
  }).finally(() => {
    if (profileInitializationByUid.get(user.uid) === initialization) {
      profileInitializationByUid.delete(user.uid);
    }
  }).catch(() => undefined);
  return initialization;
}

export async function updateUserProfileDocument(
  firestore: Firestore,
  user: User,
  update: UserProfileUpdate,
): Promise<UserProfileView> {
  validateProfileUpdate(update);
  const initialized = await ensureUserProfileAndSettings(firestore, user);

  if (Object.keys(update).length > 0) {
    const profileRef = doc(firestore, 'users', user.uid);
    // ensureUserProfileAndSettings just confirmed or created this document.
    await updateDoc(profileRef, update);
  }

  const profile = { ...initialized, ...update };
  initializedProfilesByUid.set(user.uid, profile);
  return profile;
}

export async function updateUserSettingsDocument(
  firestore: Firestore,
  user: User,
  update: UserSettingsUpdate,
): Promise<UserSettings> {
  validateSettingsUpdate(update);
  const initialized = await ensureUserProfileAndSettings(firestore, user);

  if (Object.keys(update).length === 0) return initialized.settings;

  const settingsRef = doc(firestore, 'users', user.uid, 'settings', 'current');
  // Initialization confirms this document exists before updateDoc is called.
  await updateDoc(settingsRef, {
    ...update,
    lastUpdated: serverTimestamp(),
  });

  const settings = {
    ...initialized.settings,
    ...update,
    lastUpdated: Timestamp.now(),
    userId: user.uid,
  } as UserSettings;
  const profile = { ...initialized, settings };
  initializedProfilesByUid.set(user.uid, profile);
  return settings;
}

export async function updateUserField(
  firestore: Firestore,
  user: User,
  field: string,
  value: unknown,
): Promise<UserProfileView | UserSettings> {
  if (field === 'displayName' && typeof value === 'string') {
    return updateUserProfileDocument(firestore, user, { displayName: value });
  }
  if (field === 'photoURL' && (typeof value === 'string' || value === null)) {
    return updateUserProfileDocument(firestore, user, { photoURL: value });
  }
  if (field === 'migratedFromGuest' && typeof value === 'boolean') {
    return updateUserProfileDocument(firestore, user, { migratedFromGuest: value });
  }
  if (field === 'guestMigrationId' && typeof value === 'string') {
    return updateUserProfileDocument(firestore, user, { guestMigrationId: value });
  }
  if (field === 'shelfMaterial' && typeof value === 'string') {
    const shelfMaterial = ['walnut', 'oak', 'mahogany', 'ebony', 'light_wood', 'paper'].find(
      (candidate) => candidate === value,
    );
    if (shelfMaterial) {
      return updateUserSettingsDocument(firestore, user, {
        shelfMaterial: shelfMaterial as ShelfWoodMaterial,
      });
    }
  }
  if (field === 'shelfSortMode' && typeof value === 'string') {
    const shelfSortMode = ['custom', 'recent', 'year', 'title', 'author', 'status'].find(
      (candidate) => candidate === value,
    );
    if (shelfSortMode) {
      return updateUserSettingsDocument(firestore, user, {
        shelfSortMode: shelfSortMode as ShelfSortMode,
      });
    }
  }
  if (field === 'soundEnabled' && typeof value === 'boolean') {
    return updateUserSettingsDocument(firestore, user, { soundEnabled: value });
  }
  if (field === 'aiConfigured' && typeof value === 'boolean') {
    return updateUserSettingsDocument(firestore, user, { aiConfigured: value });
  }

  throw new Error(`Unsupported user field update: ${field}`);
}
