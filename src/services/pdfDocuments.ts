import { deleteObject, getBytes, listAll, ref } from 'firebase/storage';
import { auth, storage } from '../config/firebase';
import { ResearchItem } from '../types/research';

const DATABASE_NAME = 'marginalia-local-pdfs';
const STORE_NAME = 'documents';

export interface PdfDocumentReference {
  storagePath?: string;
  guestPdfId?: string;
  fileName: string;
  fileSize: number;
  mimeType: 'application/pdf';
  uploadedAt: string;
}

function openPdfDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local PDF storage.'));
  });
}

export async function storeGuestPdfFile(file: File): Promise<string> {
  const id = crypto.randomUUID();
  const database = await openPdfDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(file, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not store this PDF locally.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Local PDF storage was interrupted.'));
  });

  database.close();
  return id;
}

export async function clearGuestPdfFiles(): Promise<void> {
  const database = await openPdfDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not clear locally stored PDFs.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Local PDF cleanup was interrupted.'));
  });
  database.close();
}

async function listCurrentUsersPdfFiles(uid: string) {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) {
    throw new Error('PDF storage access requires the matching signed-in account.');
  }
  return listAll(ref(storage, `pdfs/${uid}`));
}

export async function clearCurrentUsersPdfFiles(uid: string): Promise<void> {
  const listing = await listCurrentUsersPdfFiles(uid);
  for (let index = 0; index < listing.items.length; index += 25) {
    await Promise.all(listing.items.slice(index, index + 25).map((file) => deleteObject(file)));
  }
}

export async function listCurrentUsersPdfPaths(uid: string): Promise<string[]> {
  const listing = await listCurrentUsersPdfFiles(uid);
  return listing.items.map((file) => file.fullPath);
}

async function loadGuestPdfBytes(id: string): Promise<Uint8Array> {
  const database = await openPdfDatabase();
  const file = await new Promise<Blob>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
    request.onsuccess = () => {
      if (request.result instanceof Blob) resolve(request.result);
      else reject(new Error('The locally stored PDF is missing. Reimport the file to continue.'));
    };
    request.onerror = () => reject(request.error ?? new Error('Could not read this local PDF.'));
  });
  database.close();
  return new Uint8Array(await file.arrayBuffer());
}

export async function loadPdfBytes(paper: ResearchItem): Promise<Uint8Array> {
  if (paper.storagePath) {
    const user = auth.currentUser;
    if (!user) throw new Error('Sign in to read this private PDF.');
    if (!paper.storagePath.startsWith(`pdfs/${user.uid}/`)) {
      throw new Error('This PDF belongs to a different account.');
    }
    const bytes = await getBytes(ref(storage, paper.storagePath), paper.fileSize ? paper.fileSize + 1 : undefined);
    return new Uint8Array(bytes);
  }

  if (paper.guestPdfId) return loadGuestPdfBytes(paper.guestPdfId);
  throw new Error('This paper record has no PDF attached. Choose the original PDF below to read this paper.');
}
