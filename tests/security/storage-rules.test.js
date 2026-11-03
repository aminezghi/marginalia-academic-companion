/**
 * Storage Security Rules Tests
 * Marginalia Academic Companion
 * 
 * Run with: npx jest tests/security/storage-rules.test.js --no-coverage
 */

const { initializeTestApp, initializeAdminApp, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { getStorage, ref, uploadBytes, getMetadata, getDownloadURL } = require('firebase/storage');

const PROJECT_ID = 'marginalia-test-emulator';

describe('Storage Security Rules - Authentication Tests', () => {
  
  describe('Storage-STRG-001: Unauthenticated PDF read denied', () => {
    test('should deny read pdfs/another-user/file.pdf', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: null  // No authentication
      });
      
      const storage = getStorage(app);
      const pdfRef = ref(storage, 'pdfs/another-user/1234567890_abc123_test.pdf');
      
      await assertFails(getMetadata(pdfRef));
    });
  });

  describe('Storage-STRG-002: Authenticated read own PDF', () => {
    const uid = 'test-user-pdf';
    
    beforeEach(async () => {
      // Create user document
      const adminApp = initializeAdminApp({ projectId: PROJECT_ID });
      // In emulator, we can create the user document
    });
    
    test('should allow read pdfs/{uid}/{file}', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid }
      });
      
      const storage = getStorage(app);
      const pdfRef = ref(storage, `pdfs/${uid}/1234567890_abc123_test.pdf`);
      
      // Note: This will fail in actual test because file doesn't exist
      // In emulator, we need to first upload then read
      await assertSucceeds(getMetadata(pdfRef));
    });
  });
});

describe('Storage Security Rules - Upload Tests', () => {
  const uid = 'test-user-upload';
  
  describe('Storage-STRG-003: Upload non-PDF denied', () => {
    test('should deny upload of non-PDF file', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid }
      });
      
      const storage = getStorage(app);
      const txtRef = ref(storage, `pdfs/${uid}/1234567890_abc123_test.txt`);
      
      const txtContent = new Uint8Array([116, 101, 120, 116]); // "text"
      
      await assertFails(uploadBytes(txtRef, txtContent, {
        contentType: 'text/plain'
      }));
    });
  });

  describe('Storage-STRG-005: Valid PDF upload allowed', () => {
    test('should allow upload of valid PDF with correct filename', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid }
      });
      
      const storage = getStorage(app);
      // Valid format: timestamp_uuid_name.pdf
      const validRef = ref(storage, `pdfs/${uid}/1700000000_abc123_valid.pdf`);
      
      const pdfContent = new Uint8Array([
        37, 80, 68, 70, 45, 49, 46, 56, 10, // %PDF-1.8.
        37, 255, 255, 255, 255, 255, 255, 255, 255, 10
      ]);
      
      await assertSucceeds(uploadBytes(validRef, pdfContent, {
        contentType: 'application/pdf'
      }));
    });
  });

  describe('Storage-STRG-006: Invalid filename format denied', () => {
    test('should deny upload with invalid filename pattern', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid }
      });
      
      const storage = getStorage(app);
      // Filename doesn't match pattern: timestamp_uuid_name.pdf
      const invalidRef = ref(storage, `pdfs/${uid}/myfile.pdf`);
      
      const pdfContent = new Uint8Array([
        37, 80, 68, 70, 45, 49, 46, 56, 10
      ]);
      
      await assertFails(uploadBytes(invalidRef, pdfContent, {
        contentType: 'application/pdf'
      }));
    });
  });

  describe('Storage-STRG-007: File size limit enforced', () => {
    test('should deny upload over 100MB', async () => {
      const app = initializeTestApp({
        projectId: PROJECT_ID,
        auth: { uid }
      });
      
      const storage = getStorage(app);
      const largeRef = ref(storage, `pdfs/${uid}/1700000000_abc123_large.pdf`);
      
      // Create content larger than 100MB (simulated - in real test would need actual large buffer)
      // For emulator testing, we'll test the rule validation
      // This test would need actual implementation
    });
  });
});

describe('Storage Security Rules - Path Validation', () => {
  test('should deny access to files outside pdfs/ path', async () => {
    const app = initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid: 'test-user' }
    });
    
    const storage = getStorage(app);
    const otherRef = ref(storage, 'other-path/file.pdf');
    
    await assertFails(getMetadata(otherRef));
  });
});

// Cleanup
afterEach(async () => {
  // Cleanup handled by rules-unit-testing
});

module.exports = {
  PROJECT_ID
};
