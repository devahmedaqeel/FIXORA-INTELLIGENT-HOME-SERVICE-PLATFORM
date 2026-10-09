import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

/*
 * Firebase Storage uploads. Paths match firebase/storage.rules:
 *   providers/{uid}/profile/*, users/{uid}/avatar/*, verification/{uid}/*, services/{uid}/*
 */

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOC_TYPES = [...IMAGE_TYPES, 'application/pdf'];

function assertFile(file, { types, maxMb }) {
  if (!file) throw new Error('Choose a file to upload');
  if (!types.includes(file.type)) throw new Error(`Unsupported file type. Allowed: ${types.map((t) => t.split('/')[1]).join(', ')}`);
  if (file.size > maxMb * 1024 * 1024) throw new Error(`File must be smaller than ${maxMb} MB`);
}

const safeName = (name) => `${Date.now()}-${name.replace(/[^\w.-]+/g, '_').slice(-80)}`;

async function upload(path, file) {
  if (!storage) throw new Error('File uploads are unavailable: Firebase Storage is not configured');
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, file, { contentType: file.type });
  return { url: await getDownloadURL(objectRef), path };
}

export function uploadProfilePhoto(uid, file, role = 'provider') {
  assertFile(file, { types: IMAGE_TYPES, maxMb: 2 });
  const folder = role === 'provider' ? `providers/${uid}/profile` : `users/${uid}/avatar`;
  return upload(`${folder}/${safeName(file.name)}`, file);
}

export function uploadVerificationDocument(uid, file) {
  assertFile(file, { types: DOC_TYPES, maxMb: 5 });
  return upload(`verification/${uid}/${safeName(file.name)}`, file);
}

export function uploadCommissionProof(uid, bookingId, file) {
  assertFile(file, { types: DOC_TYPES, maxMb: 5 });
  return upload(`commissions/${uid}/${bookingId}/${safeName(file.name)}`, file);
}

export async function deleteStoredFile(path) {
  if (!storage || !path) return;
  await deleteObject(ref(storage, path)).catch(() => {});
}
