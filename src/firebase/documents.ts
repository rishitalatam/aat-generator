import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { SavedDocumentMeta, ToolType } from '../types/academic';

const LOCAL_STORAGE_PREFIX = 'iare_academic_docs_';

function isSamvidhaOrUnauth(userId: string): boolean {
  return userId.startsWith('samvidha_') || !auth.currentUser;
}

function getLocalDocs(userId: string): SavedDocumentMeta[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalDocs(userId: string, docs: SavedDocumentMeta[]) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, JSON.stringify(docs));
    // Dispatch custom event so local subscribers update immediately
    window.dispatchEvent(new CustomEvent('iare_local_docs_change', { detail: { userId } }));
  } catch (e) {
    console.error('Failed to save local docs:', e);
  }
}

export async function saveAcademicDocument(
  userId: string,
  docData: {
    id?: string;
    title: string;
    toolType: ToolType;
    subjectName?: string;
    courseCode?: string;
    summary?: string;
    content: any;
  }
): Promise<string> {
  const documentId = docData.id || `doc_${Date.now()}`;
  const path = `users/${userId}/documents/${documentId}`;

  const payload: SavedDocumentMeta = {
    id: documentId,
    userId,
    title: docData.title,
    toolType: docData.toolType,
    subjectName: docData.subjectName || '',
    courseCode: docData.courseCode || '',
    summary: (docData.summary || docData.title).slice(0, 500),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contentJson: JSON.stringify(docData.content),
  };

  // If Samvidha login or unauthenticated with Firebase Auth, store in localStorage
  if (isSamvidhaOrUnauth(userId)) {
    const existing = getLocalDocs(userId);
    const updated = [payload, ...existing.filter((d) => d.id !== documentId)];
    saveLocalDocs(userId, updated);
    return documentId;
  }

  // Google OAuth authenticated user -> store in Firestore
  try {
    const docRef = doc(db, 'users', userId, 'documents', documentId);
    await setDoc(docRef, payload);
    return documentId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserDocuments(userId: string): Promise<SavedDocumentMeta[]> {
  if (isSamvidhaOrUnauth(userId)) {
    return getLocalDocs(userId);
  }

  const path = `users/${userId}/documents`;
  try {
    const colRef = collection(db, 'users', userId, 'documents');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SavedDocumentMeta);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeUserDocuments(
  userId: string,
  onData: (docs: SavedDocumentMeta[]) => void,
  onError?: (err: Error) => void
) {
  // If Samvidha login or unauthenticated, use local storage events
  if (isSamvidhaOrUnauth(userId)) {
    // Deliver initial documents
    onData(getLocalDocs(userId));

    const handleStorageChange = (e: Event) => {
      const custom = e as CustomEvent;
      if (!custom.detail || custom.detail.userId === userId) {
        onData(getLocalDocs(userId));
      }
    };

    window.addEventListener('iare_local_docs_change', handleStorageChange);
    return () => {
      window.removeEventListener('iare_local_docs_change', handleStorageChange);
    };
  }

  // Google OAuth authenticated user -> listen to Firestore
  const path = `users/${userId}/documents`;
  const colRef = collection(db, 'users', userId, 'documents');
  const q = query(colRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => d.data() as SavedDocumentMeta);
      onData(items);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
}

export async function deleteUserDocument(userId: string, documentId: string): Promise<void> {
  if (isSamvidhaOrUnauth(userId)) {
    const existing = getLocalDocs(userId);
    const updated = existing.filter((d) => d.id !== documentId);
    saveLocalDocs(userId, updated);
    return;
  }

  const path = `users/${userId}/documents/${documentId}`;
  try {
    const docRef = doc(db, 'users', userId, 'documents', documentId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
