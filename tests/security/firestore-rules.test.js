/**
 * Firestore Security Rules Tests
 * Marginalia Academic Companion - Version 2.0
 * 
 * Run with: npx jest tests/security/firestore-rules.test.js --no-coverage
 */

const { initializeTestApp, initializeAdminApp, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { getFirestore, doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } = require('firebase/firestore');

const PROJECT_ID = 'marginalia-test-emulator';

// Helper to generate deterministic IDs
const generateDeterministicId = (sourceId, uid) => {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(`${sourceId}|${uid}`).digest('hex');
  return `paper_${hash.substring(0, 12)}${Date.now().toString().slice(-6)}`;
};

describe('Firestore Security Rules - Authentication Tests', () => {
  
  describe('FS-AUTH-001: Unauthenticated read denied', () => {
    test('should deny read users/{uid}', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: null
      });
      
      const db = getFirestore(app);
      const userRef = doc(db, 'users/any-uid');
      
      await assertFails(getDoc(userRef));
    });
  });

  describe('FS-AUTH-002: Authenticated read own data', () => {
    const uid = 'test-user-1';
    
    beforeEach(async () => {
      const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
      const adminDb = getFirestore(adminApp);
      await setDoc(doc(adminDb, `users/${uid}`), {
        uid: uid,
        email: 'test1@example.com',
        createdAt: new Date()
      });
    });
    
    test('should allow read users/{uid}', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid }
      });
      
      const db = getFirestore(app);
      const userRef = doc(db, `users/${uid}`);
      
      await assertSucceeds(getDoc(userRef));
    });
  });

  describe('FS-AUTH-004: Authenticated write another\'s data denied', () => {
    const user1Uid = 'test-user-1';
    const user2Uid = 'test-user-2';
    
    beforeEach(async () => {
      const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
      const adminDb = getFirestore(adminApp);
      await setDoc(doc(adminDb, `users/${user1Uid}`), {
        uid: user1Uid,
        email: 'user1@example.com',
        createdAt: new Date()
      });
    });
    
    test('should deny write to another user\'s document', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid: user2Uid }
      });
      
      const db = getFirestore(app);
      const user1Ref = doc(db, `users/${user1Uid}`);
      
      const newData = {
        uid: user1Uid,
        email: 'hacked@example.com',
        createdAt: new Date()
      };
      
      await assertFails(setDoc(user1Ref, newData));
    });
  });
});

describe('Firestore Security Rules - Paper Tests', () => {
  const uid = 'test-user-papers';
  
  beforeEach(async () => {
    const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
    const adminDb = getFirestore(adminApp);
    await setDoc(doc(adminDb, `users/${uid}`), {
      uid: uid,
      email: 'papers@example.com',
      createdAt: new Date()
    });
  });

  describe('FS-PAPER-004: Invalid paper fields denied', () => {
    const paperId = 'paper-123';
    
    test('should deny paper with empty title', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid }
      });
      
      const db = getFirestore(app);
      const paperData = {
        id: paperId,
        title: '',  // Invalid: empty
        authors: ['Test Author'],
        year: '2023',
        readingStatus: 'reading',
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const paperRef = doc(db, `users/${uid}/papers/${paperId}`);
      await assertFails(setDoc(paperRef, paperData));
    });

    test('should deny paper with invalid readingStatus', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid }
      });
      
      const db = getFirestore(app);
      const paperData = {
        id: paperId,
        title: 'Valid Title',
        authors: ['Test Author'],
        year: '2023',
        readingStatus: 'invalid_status',  // Invalid
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const paperRef = doc(db, `users/${uid}/papers/${paperId}`);
      await assertFails(setDoc(paperRef, paperData));
    });
  });

  describe('FS-PAPER-002: Authenticated read own paper', () => {
    const paperId = 'paper-valid-001';
    
    test('should allow read own paper', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid }
      });
      
      const db = getFirestore(app);
      
      // First create the paper
      const validPaper = {
        id: paperId,
        title: 'Valid Test Paper',
        authors: ['Test Author'],
        year: '2023',
        readingStatus: 'reading',
        source: 'manual',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const paperRef = doc(db, `users/${uid}/papers/${paperId}`);
      await setDoc(paperRef, validPaper);
      
      // Now read it
      await assertSucceeds(getDoc(paperRef));
    });
  });
});

describe('Firestore Security Rules - Settings Tests', () => {
  const uid = 'test-user-settings';
  
  beforeEach(async () => {
    const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
    const adminDb = getFirestore(adminApp);
    await setDoc(doc(adminDb, `users/${uid}`), {
      uid: uid,
      email: 'settings@example.com',
      createdAt: new Date()
    });
  });

  test('should allow read/write own settings', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const db = getFirestore(app);
    const settingsData = {
      userId: uid,
      shelfMaterial: 'walnut',
      shelfSortMode: 'custom',
      soundEnabled: true,
      aiConfigured: false,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    const settingsRef = doc(db, `users/${uid}/settings`, 'current');
    await assertSucceeds(setDoc(settingsRef, settingsData));
    await assertSucceeds(getDoc(settingsRef));
  });
});

describe('Firestore Security Rules - Migration Tests', () => {
  const uid = 'test-user-migration';
  
  beforeEach(async () => {
    const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
    const adminDb = getFirestore(adminApp);
    await setDoc(doc(adminDb, `users/${uid}`), {
      uid: uid,
      email: 'migration@example.com',
      createdAt: new Date()
    });
  });

  test('should allow create migration job for own user', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }
    });
    
    const db = getFirestore(app);
    const migrationData = {
      id: `mig_${uid}_20261103`,
      uid: uid,
      type: 'guest_to_account',
      status: 'pending',
      progress: 0,
      startedAt: new Date(),
      entityCounts: { papers: 0, collections: 0, notes: 0 },
      processedCounts: { papers: 0, collections: 0, notes: 0 },
      retryCount: 0
    };
    
    const migrationRef = doc(db, `users/${uid}/migrations`, `mig_${uid}_20261103`);
    await assertSucceeds(setDoc(migrationRef, migrationData));
  });

  test('should deny create migration for another user', async () => {
    const otherUid = 'other-user-123';
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid }  // Authenticated as uid, but creating for otherUid
    });
    
    const db = getFirestore(app);
    const migrationData = {
      id: `mig_${otherUid}_20261103`,
      uid: otherUid,
      type: 'guest_to_account',
      status: 'pending'
    };
    
    const migrationRef = doc(db, `users/${otherUid}/migrations`, `mig_${otherUid}_20261103`);
    await assertFails(setDoc(migrationRef, migrationData));
  });
});

// Cleanup after each test
afterEach(async () => {
  // Close the mock auth instance
  // This is handled automatically by rules-unit-testing
});

// Export for CI/CD integration
module.exports = {
  PROJECT_ID,
  generateDeterministicId
};
