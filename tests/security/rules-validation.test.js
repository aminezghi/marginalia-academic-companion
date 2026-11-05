/**
 * Security Rules Validation Tests (Syntax & Structure Only)
 * These tests validate rule structure and patterns without requiring the emulator
 */

const fs = require('fs');
const { validateFirestoreRules, validateStorageRules } = require('./rules-evaluator');

const FIRESTORE_RULES = fs.readFileSync('./firestore-emulator.rules', 'utf8');
const STORAGE_RULES = fs.readFileSync('./storage-emulator.rules', 'utf8');

describe('Rules File Validation', () => {
  describe('Firestore Rules', () => {
    test('Files exist and are readable', () => {
      expect(FIRESTORE_RULES).toBeDefined();
      expect(FIRESTORE_RULES.length).toBeGreaterThan(100);
    });
    
    test('Has valid rules_version', () => {
      expect(FIRESTORE_RULES).toContain("rules_version = '2'");
    });
    
    test('Has service declaration', () => {
      expect(FIRESTORE_RULES).toContain('service cloud.firestore');
    });
    
    test('Has isOwner helper function', () => {
      expect(FIRESTORE_RULES).toContain('function isOwner');
    });
    
    test('Has users collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}');
    });
    
    test('Users collection denies DELETE', () => {
      expect(FIRESTORE_RULES).toMatch(/allow delete: if false/);
    });
    
    test('Has papers collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/papers/{paperId}');
    });
    
    test('Has settings collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/settings/current');
    });
    
    test('Has volumes collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/volumes/{volumeId}');
    });
    
    test('Has collections collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/collections/{collectionId}');
    });
    
    test('Has annotations subcollection rules', () => {
      expect(FIRESTORE_RULES).toContain('annotations/{annotationId}');
    });
    
    test('Has readingProgress collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/readingProgress/{paperId}');
    });
    
    test('Has notes collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/notes/{noteId}');
    });
    
    test('Has highlights collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/highlights/{highlightId}');
    });
    
    test('Has bookmarks collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/bookmarks/{bookmarkId}');
    });
    
    test('Has goals collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/goals/{goalId}');
    });
    
    test('Has activities collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/activities/{activityId}');
    });
    
    test('Has migrations collection rules', () => {
      expect(FIRESTORE_RULES).toContain('match /users/{uid}/migrations/{migrationId}');
    });
  });
  
  describe('Storage Rules', () => {
    test('Files exist and are readable', () => {
      expect(STORAGE_RULES).toBeDefined();
      expect(STORAGE_RULES.length).toBeGreaterThan(100);
    });
    
    test('Has valid rules_version', () => {
      expect(STORAGE_RULES).toContain("rules_version = '2'");
    });
    
    test('Has service declaration', () => {
      expect(STORAGE_RULES).toContain('service firebase.storage');
    });
    
    // Storage rules may use inline ownership checks or a helper function
    test('Has ownership verification for PDFs', () => {
      expect(STORAGE_RULES).toMatch(/request\.auth\.uid.*uid/);
    });
    
    test('Has PDFs path rules', () => {
      expect(STORAGE_RULES).toContain('match /pdfs/{uid}/{fileName}');
    });
    
    // Avatar path uses {uid} as variable name
    test('Has avatars path rules', () => {
      expect(STORAGE_RULES).toMatch(/match \/avatars\/\{uid\}\/avatar\.png/);
    });
    
    // Cover path uses {fileName} as variable name in actual rules
    test('Has covers path rules', () => {
      expect(STORAGE_RULES).toMatch(/match \/covers\/\{userId\}\/\{fileName\}/);
    });
    
    test('Has default deny rule', () => {
      expect(STORAGE_RULES).toContain('allow read, write: if false');
    });
  });
  
  describe('Firestore Rules Structural Analysis', () => {
    test('validateFirestoreRules returns no critical issues', () => {
      const issues = validateFirestoreRules(FIRESTORE_RULES);
      console.log('Firestore issues:', issues);
      expect(issues.length).toBe(0);
    });
  });
  
  describe('Storage Rules Structural Analysis', () => {
    test('validateStorageRules returns no critical issues', () => {
      const issues = validateStorageRules(STORAGE_RULES);
      console.log('Storage issues:', issues);
      expect(issues.length).toBe(0);
    });
  });
});
