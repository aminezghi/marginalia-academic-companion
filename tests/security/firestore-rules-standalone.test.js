/**
 * Standalone Firestore Security Rules Tests using @firebase/rules-unit-testing
 * Uses the emulator with host/port configuration
 */

const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const fs = require('fs');

const PROJECT_ID = 'marginalia-test-emulator';
const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 18080;
const FIRESTORE_RULES = fs.readFileSync('./firestore-emulator.rules', 'utf8');

let testEnv;

function createTestUser(uid, timestamp = new Date()) {
  return {
    uid: uid,
    email: `${uid}@example.com`,
    createdAt: timestamp
  };
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: FIRESTORE_HOST,
      port: FIRESTORE_PORT,
      rules: FIRESTORE_RULES
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv?.cleanup();
});

describe('Firestore Security Rules - Authentication Tests', () => {
  
  test('FS-AUTH-001: should deny read users/{uid} unauthenticated', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const userRef = doc(db, 'users/any-uid');
    await assertFails(getDoc(userRef));
  });

  test('should deny unauthenticated profile creation and updates', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const userRef = doc(db, 'users/unauthenticated-user');
    await assertFails(setDoc(userRef, createTestUser('unauthenticated-user')));
    await assertFails(updateDoc(userRef, { displayName: 'Intruder' }));
  });

  test('FS-AUTH-002: should deny read other users data', async () => {
    const uid1 = 'test-user-1-read';
    const uid2 = 'test-user-2-read';
    
    const db1 = testEnv.authenticatedContext(uid1).firestore();
    await setDoc(doc(db1, `users/${uid1}`), createTestUser(uid1));
    
    const db2 = testEnv.authenticatedContext(uid2).firestore();
    const userRef = doc(db2, `users/${uid1}`);
    await assertFails(getDoc(userRef));
  });

  test('should allow read own user document', async () => {
    const uid = 'test-user-read-own';
    const db = testEnv.authenticatedContext(uid).firestore();
    
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
    await assertSucceeds(getDoc(doc(db, `users/${uid}`)));
  });

  test('FS-AUTH-003: should deny write to another user\'s document', async () => {
    const user1Uid = 'test-user-1';
    const user2Uid = 'test-user-2';
    
    const db1 = testEnv.authenticatedContext(user1Uid).firestore();
    await setDoc(doc(db1, `users/${user1Uid}`), createTestUser(user1Uid));
    
    const db2 = testEnv.authenticatedContext(user2Uid).firestore();
    const user1Ref = doc(db2, `users/${user1Uid}`);
    await assertFails(updateDoc(user1Ref, { email: 'hacked@example.com' }));
  });
});

describe('Firestore Security Rules - Paper Tests', () => {
  const uid = 'test-user-papers';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow read own paper', async () => {
    const paperId = 'paper-test-001';
    const db = testEnv.authenticatedContext(uid).firestore();
    const paperRef = doc(db, `users/${uid}/papers/${paperId}`);
    
    await setDoc(paperRef, {
      id: paperId,
      title: 'Test Paper',
      authors: ['Test Author'],
      year: '2023',
      readingStatus: 'reading',
      priority: 'medium',
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await assertSucceeds(getDoc(paperRef));
  });

  test('should deny read other user paper', async () => {
    const paperId = 'paper-test-001';
    const dbUser1 = testEnv.authenticatedContext(uid).firestore();
    const paperRef = doc(dbUser1, `users/${uid}/papers/${paperId}`);
    
    await setDoc(paperRef, {
      id: paperId,
      title: 'Test Paper',
      authors: ['Test Author'],
      year: '2023',
      readingStatus: 'reading',
      priority: 'medium',
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const dbUser2 = testEnv.authenticatedContext('other-user').firestore();
    const paperRefOther = doc(dbUser2, `users/${uid}/papers/${paperId}`);
    await assertFails(getDoc(paperRefOther));
  });

  test('should allow create valid paper', async () => {
    const newPaperId = 'paper-new-001';
    const db = testEnv.authenticatedContext(uid).firestore();
    const paperRef = doc(db, `users/${uid}/papers/${newPaperId}`);
    
    await assertSucceeds(setDoc(paperRef, {
      id: newPaperId,
      title: 'New Paper',
      authors: ['Author One'],
      year: '2024',
      readingStatus: 'inbox',
      priority: 'medium',
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });

  test('should allow an owner to add papers to bounded folder memberships', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const paperId = 'paper-with-folders';
    const paperRef = doc(db, `users/${uid}/papers/${paperId}`);
    await assertSucceeds(setDoc(paperRef, {
      id: paperId,
      title: 'Paper filed in folders',
      authors: ['Author One'],
      year: '2024',
      readingStatus: 'inbox',
      priority: 'medium',
      source: 'import',
      collectionIds: ['folder-one', 'folder-two'],
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });

  test('should deny paper with empty title', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const paperRef = doc(db, `users/${uid}/papers/paper-no-title`);
    
    await assertFails(setDoc(paperRef, {
      id: 'paper-no-title',
      title: '',
      authors: ['Author'],
      year: '2024',
      readingStatus: 'inbox',
      priority: 'medium',
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });

  test('should deny paper with invalid readingStatus', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const paperRef = doc(db, `users/${uid}/papers/paper-invalid-status`);
    
    await assertFails(setDoc(paperRef, {
      id: 'paper-invalid-status',
      title: 'Invalid Status Paper',
      authors: ['Author'],
      year: '2024',
      readingStatus: 'invalid_status',
      priority: 'medium',
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });

  test('should deny paper with invalid priority', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const paperRef = doc(db, `users/${uid}/papers/paper-invalid-priority`);
    
    await assertFails(setDoc(paperRef, {
      id: 'paper-invalid-priority',
      title: 'Invalid Priority Paper',
      authors: ['Author'],
      year: '2024',
      readingStatus: 'inbox',
      priority: 'urgent',
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });
});

describe('Firestore Security Rules - Settings Tests', () => {
  const uid = 'test-user-settings';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow read/write own settings', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const settingsRef = doc(db, `users/${uid}/settings/current`);
    
    await assertSucceeds(setDoc(settingsRef, {
      userId: uid,
      createdAt: new Date(),
      lastUpdated: new Date(),
      shelfMaterial: 'wood',
      shelfSortMode: 'alpha',
      soundEnabled: true,
      aiConfigured: false,
      theme: 'light',
      language: 'en',
      notifications: true,
      appearance: 'default',
      lastSynced: null,
      version: '1.0'
    }));
    
    await assertSucceeds(getDoc(settingsRef));
  });

  test('should deny read other user settings', async () => {
    const settingsRef = doc(testEnv.unauthenticatedContext().firestore(), `users/other-user/settings/current`);
    await assertFails(getDoc(settingsRef));
  });

  test('should deny cross-user settings read and write', async () => {
    const otherDb = testEnv.authenticatedContext('different-user').firestore();
    const settingsRef = doc(otherDb, `users/${uid}/settings/current`);
    await assertFails(getDoc(settingsRef));
    await assertFails(setDoc(settingsRef, { userId: uid, createdAt: new Date() }));
  });

  test('should deny unauthenticated settings writes', async () => {
    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const settingsRef = doc(unauthenticatedDb, `users/${uid}/settings/current`);
    await assertFails(setDoc(settingsRef, { userId: uid, createdAt: new Date() }));
  });
});

describe('Firestore Security Rules - Volume Tests', () => {
  const uid = 'test-user-volumes';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow create and read own volume', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const volumeRef = doc(db, `users/${uid}/volumes/vol-001`);
    
    await assertSucceeds(setDoc(volumeRef, {
      id: 'vol-001',
      title: 'Test Volume',
      position: 1,
      paperIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await assertSucceeds(getDoc(volumeRef));
  });

  test('should deny cross-user volume access', async () => {
    const volumeRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/volumes/vol-001`);
    await assertFails(getDoc(volumeRef));
  });
});

describe('Firestore Security Rules - Collection Tests', () => {
  const uid = 'test-user-collections';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow create and read own collection', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const collectionRef = doc(db, `users/${uid}/collections/col-001`);
    
    await assertSucceeds(setDoc(collectionRef, {
      id: 'col-001',
      name: 'Test Collection',
      type: 'folder',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: uid
    }));
    
    await assertSucceeds(getDoc(collectionRef));
  });

  test('should deny cross-user collection access', async () => {
    const collectionRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/collections/col-001`);
    await assertFails(getDoc(collectionRef));
  });
});

describe('Firestore Security Rules - Annotation Tests', () => {
  const uid = 'test-user-annotations';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
    await setDoc(doc(db, `users/${uid}/papers/paper-001`), {
      id: 'paper-001',
      title: 'Test Paper',
      authors: ['Author'],
      year: '2024',
      readingStatus: 'reading',
      priority: 'medium',
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  test('should allow create and read own annotation', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const annRef = doc(db, `users/${uid}/papers/paper-001/annotations/ann-001`);
    
    await assertSucceeds(setDoc(annRef, {
      id: 'ann-001',
      paperId: 'paper-001',
      content: 'Test annotation content',
      type: 'highlight',
      color: 'yellow',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await assertSucceeds(getDoc(annRef));
  });

  test('should deny cross-user annotation access', async () => {
    const annRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/papers/paper-001/annotations/ann-001`);
    await assertFails(getDoc(annRef));
  });

  test('should deny invalid annotation type', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const annRef = doc(db, `users/${uid}/papers/paper-001/annotations/ann-invalid`);
    
    await assertFails(setDoc(annRef, {
      id: 'ann-invalid',
      paperId: 'paper-001',
      content: 'Invalid annotation',
      type: 'invalid_type',
      color: 'yellow',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });
});

describe('Firestore Security Rules - ReadingProgress Tests', () => {
  const uid = 'test-user-progress';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow create and read own reading progress', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const progressRef = doc(db, `users/${uid}/readingProgress/paper-001`);
    
    await assertSucceeds(setDoc(progressRef, {
      paperId: 'paper-001',
      status: 'reading',
      currentPage: 10,
      totalPages: 100,
      percent: 50,
      lastReadAt: new Date(),
      startedAt: new Date()
    }));
    
    await assertSucceeds(getDoc(progressRef));
  });

  test('should deny cross-user reading progress access', async () => {
    const progressRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/readingProgress/paper-001`);
    await assertFails(getDoc(progressRef));
  });
});

describe('Firestore Security Rules - Migration Tests', () => {
  const uid = 'test-user-migration';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow create migration job for own user', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const migrationRef = doc(db, `users/${uid}/migrations/mig-001`);
    
    const data = {
      id: 'mig-001',
      uid: uid,
      type: 'guest_to_account',
      status: 'pending',
      progress: 0,
      startedAt: new Date()
    };
    
    await assertSucceeds(setDoc(migrationRef, data));
  });

  test('should deny create migration for another user', async () => {
    const migrationRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/migrations/mig-001`);
    await assertFails(setDoc(migrationRef, {
      id: 'mig-001',
      type: 'guest-to-account',
      status: 'pending'
    }));
  });

  test('should deny unauthenticated migration access', async () => {
    const migrationRef = doc(testEnv.unauthenticatedContext().firestore(), `users/${uid}/migrations/mig-001`);
    await assertFails(getDoc(migrationRef));
  });
});

describe('Firestore Security Rules - Notes Tests', () => {
  const uid = 'test-user-notes';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow create and read own note', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const noteRef = doc(db, `users/${uid}/notes/note-001`);
    
    await assertSucceeds(setDoc(noteRef, {
      id: 'note-001',
      title: 'Test Note',
      content: 'Note content here',
      type: 'general',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await assertSucceeds(getDoc(noteRef));
  });

  test('should deny cross-user note access', async () => {
    const noteRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/notes/note-001`);
    await assertFails(getDoc(noteRef));
  });
});

describe('Firestore Security Rules - Highlights Tests', () => {
  const uid = 'test-user-highlights';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow create and read own highlight', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const highlightRef = doc(db, `users/${uid}/highlights/highlight-001`);
    
    await assertSucceeds(setDoc(highlightRef, {
      id: 'highlight-001',
      paperId: 'paper-001',
      pageNumber: 1,
      text: 'Highlighted text',
      color: 'yellow',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await assertSucceeds(getDoc(highlightRef));
  });

  test('should deny cross-user highlight access', async () => {
    const highlightRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/highlights/highlight-001`);
    await assertFails(getDoc(highlightRef));
  });
});

describe('Firestore Security Rules - Bookmarks Tests', () => {
  const uid = 'test-user-bookmarks';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow create and read own bookmark', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const bookmarkRef = doc(db, `users/${uid}/bookmarks/bookmark-001`);
    
    await assertSucceeds(setDoc(bookmarkRef, {
      id: 'bookmark-001',
      paperId: 'paper-001',
      pageNumber: 1,
      createdAt: new Date()
    }));
    
    await assertSucceeds(getDoc(bookmarkRef));
  });

  test('should deny cross-user bookmark access', async () => {
    const bookmarkRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/bookmarks/bookmark-001`);
    await assertFails(getDoc(bookmarkRef));
  });
});

describe('Firestore Security Rules - Goals Tests', () => {
  const uid = 'test-user-goals';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow create and read own goal', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const goalRef = doc(db, `users/${uid}/goals/goal-001`);
    
    await assertSucceeds(setDoc(goalRef, {
      id: 'goal-001',
      type: 'papers_per_week',
      label: 'Read 5 papers per week',
      target: 5,
      period: 'weekly',
      current: 0,
      endDate: new Date()
    }));
    
    await assertSucceeds(getDoc(goalRef));
  });

  test('should deny cross-user goal access', async () => {
    const goalRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/goals/goal-001`);
    await assertFails(getDoc(goalRef));
  });
});

describe('Firestore Security Rules - Activities Tests', () => {
  const uid = 'test-user-activities';
  
  beforeEach(async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    await setDoc(doc(db, `users/${uid}`), createTestUser(uid));
  });

  test('should allow create activity (append-only)', async () => {
    const db = testEnv.authenticatedContext(uid).firestore();
    const activityRef = doc(db, `users/${uid}/activities/activity-001`);
    
    await assertSucceeds(setDoc(activityRef, {
      id: 'activity-001',
      type: 'finished_paper',
      description: 'Read a paper',
      timestamp: new Date()
    }));
  });

  test('should allow deleting own activity history during a library reset', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `users/${uid}/activities/activity-001`), {
        id: 'activity-001', type: 'finished_paper', description: 'Read a paper', timestamp: new Date()
      });
    });
    const activityRef = doc(testEnv.authenticatedContext(uid).firestore(), `users/${uid}/activities/activity-001`);
    await assertSucceeds(deleteDoc(activityRef));
  });

  test('should deny deleting another user activity', async () => {
    const activityRef = doc(testEnv.authenticatedContext('other-user').firestore(), `users/${uid}/activities/activity-001`);
    await assertFails(deleteDoc(activityRef));
  });

  test('should deny read other user activities', async () => {
    const activityRef = doc(testEnv.unauthenticatedContext().firestore(), `users/other-user/activities/activity-001`);
    await assertFails(getDoc(activityRef));
  });
});
