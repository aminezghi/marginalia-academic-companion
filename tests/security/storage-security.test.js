/**
 * Canonical Storage Security Tests
 * Tests against emulator with external rules file
 */
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { getStorage, ref, uploadBytes, getMetadata, deleteObject, listAll } = require('@firebase/storage');
const fs = require('fs');

const PROJECT_ID = 'marginalia-test-emulator';
const STORAGE_HOST = '127.0.0.1';
const STORAGE_PORT = 19199;

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    storage: {
      host: STORAGE_HOST,
      port: STORAGE_PORT
    }
  });
});

beforeEach(async () => {
  await testEnv.clearStorage();
});

afterAll(async () => {
  await testEnv?.cleanup();
});

describe('Storage Security - PDF Tests (Private, Owner-Only)', () => {
  const uid = 'pdf-owner';
  
  describe('PDF Upload', () => {
    test('Owner can upload valid PDF with correct filename pattern', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_valid.pdf`);
      
      const pdfContent = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 56]);
      
      await assertSucceeds(uploadBytes(pdfRef, pdfContent, {
        contentType: 'application/pdf'
      }));
    });
    
    test('Owner cannot upload non-PDF MIME type', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const txtRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_test.txt`);
      
      const txtContent = new Uint8Array([116, 101, 115, 116]);
      
      await assertFails(uploadBytes(txtRef, txtContent, {
        contentType: 'text/plain'
      }));
    });
    
    test('Owner cannot upload with invalid filename (no timestamp_uuid pattern)', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pdfRef = ref(storage, `pdfs/${uid}/myfile.pdf`);
      
      const pdfContent = new Uint8Array([37, 80, 68, 70, 49, 46, 56, 10]);
      
      await assertFails(uploadBytes(pdfRef, pdfContent, {
        contentType: 'application/pdf'
      }));
    });
    
    test('Owner cannot upload empty file', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_empty.pdf`);
      
      await assertFails(uploadBytes(pdfRef, new Uint8Array([]), {
        contentType: 'application/pdf'
      }));
    });
    
    test('Owner cannot upload oversized file (>100MB)', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_large.pdf`);
      
      // 101MB
      const largeContent = new Uint8Array(101 * 1024 * 1024).fill(0);
      
      await assertFails(uploadBytes(pdfRef, largeContent, {
        contentType: 'application/pdf'
      }));
    });
  });
  
  describe('PDF Read', () => {
    test('Owner can list their own PDF objects for library reset', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_list.pdf`);
      await uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70]), { contentType: 'application/pdf' });
      let listedPaths = [];
      await assertSucceeds(listAll(ref(storage, `pdfs/${uid}`)).then((result) => {
        listedPaths = result.items.map((item) => item.fullPath);
      }));
      expect(listedPaths).toContain(`pdfs/${uid}/1700000000000_abc12345_list.pdf`);
    });

    test('Another user cannot list owner PDF objects', async () => {
      const ownerStorage = testEnv.authenticatedContext(uid).storage();
      await uploadBytes(ref(ownerStorage, `pdfs/${uid}/1700000000000_abc12345_private.pdf`), new Uint8Array([37, 80, 68, 70]), { contentType: 'application/pdf' });
      const otherStorage = testEnv.authenticatedContext('another-user').storage();
      await assertFails(listAll(ref(otherStorage, `pdfs/${uid}`)));
    });

    test('Owner can read their PDF', async () => {
      // Upload via rules-disabled context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_read.pdf`);
        await uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70]), {
          contentType: 'application/pdf'
        });
      });
      
      const storage = testEnv.authenticatedContext(uid).storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_read.pdf`);
      
      await assertSucceeds(getMetadata(pdfRef));
    });
    
    test('Another authenticated user cannot read owner PDF', async () => {
      // Upload via rules-disabled context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_other.pdf`);
        await uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70]), {
          contentType: 'application/pdf'
        });
      });
      
      const storage = testEnv.authenticatedContext('other-user').storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_other.pdf`);
      
      await assertFails(getMetadata(pdfRef));
    });
    
    test('Unauthenticated user cannot read PDF', async () => {
      // Upload via rules-disabled context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_unauth.pdf`);
        await uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70]), {
          contentType: 'application/pdf'
        });
      });
      
      const storage = testEnv.unauthenticatedContext().storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_unauth.pdf`);
      
      await assertFails(getMetadata(pdfRef));
    });
  });
  
  describe('PDF Update/Overwrite', () => {
    test('Another authenticated user cannot overwrite owner PDF', async () => {
      // Upload via rules-disabled context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_overwrite.pdf`);
        await uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70]), {
          contentType: 'application/pdf'
        });
      });
      
      // Other user tries to overwrite
      const storage = testEnv.authenticatedContext('other-user').storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_overwrite.pdf`);
      
      await assertFails(uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70, 49]), {
        contentType: 'application/pdf'
      }));
    });
    
    test('Unauthenticated user cannot overwrite PDF', async () => {
      // Upload via rules-disabled context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_unauth_overwrite.pdf`);
        await uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70]), {
          contentType: 'application/pdf'
        });
      });
      
      // Unauthenticated user tries to overwrite
      const storage = testEnv.unauthenticatedContext().storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_unauth_overwrite.pdf`);
      
      await assertFails(uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70, 49]), {
        contentType: 'application/pdf'
      }));
    });
  });
  
  describe('PDF Delete', () => {
    test('Another authenticated user cannot delete owner PDF', async () => {
      // Upload via rules-disabled context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_delete.pdf`);
        await uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70]), {
          contentType: 'application/pdf'
        });
      });
      
      // Other user tries to delete
      const storage = testEnv.authenticatedContext('other-user').storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_delete.pdf`);
      
      await assertFails(deleteObject(pdfRef));
    });
    
    test('Unauthenticated user cannot delete PDF', async () => {
      // Upload via rules-disabled context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_unauth_delete.pdf`);
        await uploadBytes(pdfRef, new Uint8Array([37, 80, 68, 70]), {
          contentType: 'application/pdf'
        });
      });
      
      // Unauthenticated user tries to delete
      const storage = testEnv.unauthenticatedContext().storage();
      const pdfRef = ref(storage, `pdfs/${uid}/1700000000000_abc12345_unauth_delete.pdf`);
      
      await assertFails(deleteObject(pdfRef));
    });
  });
  
  describe('PDF Path Validation', () => {
    test('Access to files outside pdfs/ path is denied', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const otherRef = ref(storage, 'other-path/file.pdf');
      
      await assertFails(getMetadata(otherRef));
    });
  });
});

describe('Storage Security - Avatar Tests (Public Read, Owner-Write)', () => {
  const uid = 'avatar-owner';
  
  describe('Avatar Upload', () => {
    test('Owner can upload valid PNG avatar', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
      
      const pngContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      
      await assertSucceeds(uploadBytes(pngRef, pngContent, {
        contentType: 'image/png'
      }));
    });
    
    test('Owner cannot upload non-PNG avatar', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const jpgRef = ref(storage, `avatars/${uid}/avatar.jpg`);
      
      await assertFails(uploadBytes(jpgRef, new Uint8Array([255, 216, 255]), {
        contentType: 'image/jpeg'
      }));
    });
    
    test('Owner cannot upload avatar with wrong content type', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
      
      await assertFails(uploadBytes(pngRef, new Uint8Array([137, 80, 78, 71]), {
        contentType: 'image/jpeg'
      }));
    });
    
    test('Owner cannot upload empty avatar', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
      
      await assertFails(uploadBytes(pngRef, new Uint8Array([]), {
        contentType: 'image/png'
      }));
    });
    
    test('Owner cannot upload oversized avatar (>2MB)', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
      
      const largeContent = new Uint8Array(3 * 1024 * 1024).fill(0);
      
      await assertFails(uploadBytes(pngRef, largeContent, {
        contentType: 'image/png'
      }));
    });
  });
  
  describe('Avatar Read', () => {
    test('Public avatar read - unauthenticated user can read', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
        await uploadBytes(pngRef, new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), {
          contentType: 'image/png'
        });
      });
      
      const storage = testEnv.unauthenticatedContext().storage();
      const avatarRef = ref(storage, `avatars/${uid}/avatar.png`);
      
      await assertSucceeds(getMetadata(avatarRef));
    });
    
    test('Authenticated user can read any avatar', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
        await uploadBytes(pngRef, new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), {
          contentType: 'image/png'
        });
      });
      
      const storage = testEnv.authenticatedContext('any-user').storage();
      const avatarRef = ref(storage, `avatars/${uid}/avatar.png`);
      
      await assertSucceeds(getMetadata(avatarRef));
    });
  });
  
  describe('Avatar Delete', () => {
    test('Owner can delete their avatar', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
        await uploadBytes(pngRef, new Uint8Array([137, 80, 78, 71]), {
          contentType: 'image/png'
        });
      });
      
      const storage = testEnv.authenticatedContext(uid).storage();
      const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
      
      await assertSucceeds(deleteObject(pngRef));
    });
    
    test('Another user cannot delete owner avatar', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
        await uploadBytes(pngRef, new Uint8Array([137, 80, 78, 71]), {
          contentType: 'image/png'
        });
      });
      
      const storage = testEnv.authenticatedContext('other-user').storage();
      const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
      
      await assertFails(deleteObject(pngRef));
    });
    
    test('Unauthenticated user cannot delete avatar', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
        await uploadBytes(pngRef, new Uint8Array([137, 80, 78, 71]), {
          contentType: 'image/png'
        });
      });
      
      const storage = testEnv.unauthenticatedContext().storage();
      const pngRef = ref(storage, `avatars/${uid}/avatar.png`);
      
      await assertFails(deleteObject(pngRef));
    });
  });
});

describe('Storage Security - Cover Tests (Private, Owner-Only)', () => {
  const uid = 'cover-owner';
  
  describe('Cover Upload', () => {
    test('Owner can upload valid JPEG cover', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      const jpgContent = new Uint8Array([255, 216, 255, 224]);
      
      await assertSucceeds(uploadBytes(jpgRef, jpgContent, {
        contentType: 'image/jpeg'
      }));
    });
    
    test('Owner can upload JPEG with .jpeg extension', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const jpegRef = ref(storage, `covers/${uid}/cover.jpeg`);
      
      const jpegContent = new Uint8Array([255, 216, 255, 224]);
      
      await assertSucceeds(uploadBytes(jpegRef, jpegContent, {
        contentType: 'image/jpeg'
      }));
    });
    
    test('Owner cannot upload non-JPEG cover', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const pngRef = ref(storage, `covers/${uid}/cover.png`);
      
      await assertFails(uploadBytes(pngRef, new Uint8Array([137, 80, 78, 71]), {
        contentType: 'image/png'
      }));
    });
    
    test('Owner cannot upload cover with wrong content type', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertFails(uploadBytes(jpgRef, new Uint8Array([255, 216, 255]), {
        contentType: 'image/png'
      }));
    });
    
    test('Owner cannot upload empty cover', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertFails(uploadBytes(jpgRef, new Uint8Array([]), {
        contentType: 'image/jpeg'
      }));
    });
    
    test('Owner cannot upload oversized cover (>5MB)', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      const largeContent = new Uint8Array(6 * 1024 * 1024).fill(0);
      
      await assertFails(uploadBytes(jpgRef, largeContent, {
        contentType: 'image/jpeg'
      }));
    });
    
    test('Another user cannot upload to owner cover path', async () => {
      const storage = testEnv.authenticatedContext('other-user').storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertFails(uploadBytes(jpgRef, new Uint8Array([255, 216, 255]), {
        contentType: 'image/jpeg'
      }));
    });
  });
  
  describe('Cover Read', () => {
    test('Owner can read their cover', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
        await uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 224]), {
          contentType: 'image/jpeg'
        });
      });
      
      const storage = testEnv.authenticatedContext(uid).storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertSucceeds(getMetadata(jpgRef));
    });
    
    test('Unauthenticated user cannot read cover', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
        await uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 224]), {
          contentType: 'image/jpeg'
        });
      });
      
      const storage = testEnv.unauthenticatedContext().storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertFails(getMetadata(jpgRef));
    });
    
    test('Another authenticated user cannot read owner cover', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
        await uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 224]), {
          contentType: 'image/jpeg'
        });
      });
      
      const storage = testEnv.authenticatedContext('other-user').storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertFails(getMetadata(jpgRef));
    });
  });
  
  describe('Cover Update/Overwrite', () => {
    test('Another user cannot overwrite owner cover', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
        await uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 224]), {
          contentType: 'image/jpeg'
        });
      });
      
      const storage = testEnv.authenticatedContext('other-user').storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertFails(uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 220]), {
        contentType: 'image/jpeg'
      }));
    });
    
    test('Unauthenticated user cannot overwrite cover', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
        await uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 224]), {
          contentType: 'image/jpeg'
        });
      });
      
      const storage = testEnv.unauthenticatedContext().storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertFails(uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 220]), {
        contentType: 'image/jpeg'
      }));
    });
  });
  
  describe('Cover Delete', () => {
    test('Owner can delete their cover', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
        await uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 224]), {
          contentType: 'image/jpeg'
        });
      });
      
      const storage = testEnv.authenticatedContext(uid).storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertSucceeds(deleteObject(jpgRef));
    });
    
    test('Another user cannot delete cover', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
        await uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 224]), {
          contentType: 'image/jpeg'
        });
      });
      
      const storage = testEnv.authenticatedContext('other-user').storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertFails(deleteObject(jpgRef));
    });
    
    test('Unauthenticated user cannot delete cover', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
        await uploadBytes(jpgRef, new Uint8Array([255, 216, 255, 224]), {
          contentType: 'image/jpeg'
        });
      });
      
      const storage = testEnv.unauthenticatedContext().storage();
      const jpgRef = ref(storage, `covers/${uid}/cover.jpg`);
      
      await assertFails(deleteObject(jpgRef));
    });
  });
  
  describe('Cover Path Validation', () => {
    test('Access to files outside covers/ path is denied', async () => {
      const storage = testEnv.authenticatedContext(uid).storage();
      const otherRef = ref(storage, 'invalid/cover.jpg');
      
      await assertFails(getMetadata(otherRef));
    });
  });
});

describe('Storage Security - Default Deny', () => {
  const uid = 'test-user';
  
  test('Unauthenticated access to undefined paths is denied', async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    const ref_ = ref(storage, 'undefined/path/file.txt');
    
    await assertFails(getMetadata(ref_));
  });
  
  test('Access to files with invalid extension is denied', async () => {
    const storage = testEnv.authenticatedContext(uid).storage();
    const invalidRef = ref(storage, 'other/file.exe');
    
    await assertFails(getMetadata(invalidRef));
  });
});
