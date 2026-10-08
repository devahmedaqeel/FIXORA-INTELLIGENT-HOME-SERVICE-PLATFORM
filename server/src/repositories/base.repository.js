import { getDb } from '../config/firebase.js';

export const snapshotToDoc = (snap) => (snap && snap.exists ? { id: snap.id, ...snap.data() } : null);

/**
 * Thin data-access layer over one Firestore collection.
 * Services never touch Firestore directly — they go through repositories.
 */
export class BaseRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  get collection() {
    return getDb().collection(this.collectionName);
  }

  ref(id) {
    return id ? this.collection.doc(id) : this.collection.doc();
  }

  newId() {
    return this.collection.doc().id;
  }

  async findById(id) {
    if (!id || typeof id !== 'string') return null;
    return snapshotToDoc(await this.ref(id).get());
  }

  async findByIds(ids = []) {
    const unique = [...new Set(ids.filter(Boolean))];
    const docs = await Promise.all(unique.map((id) => this.findById(id)));
    return docs.filter(Boolean);
  }

  /** Creates (or overwrites) a document. Returns the stored document. */
  async create(data, id) {
    const ref = this.ref(id);
    await ref.set(data);
    return { id: ref.id, ...data };
  }

  async update(id, data) {
    await this.ref(id).update(data);
    return this.findById(id);
  }

  async upsert(id, data) {
    await this.ref(id).set(data, { merge: true });
    return this.findById(id);
  }

  async delete(id) {
    await this.ref(id).delete();
  }

  buildQuery(filters = [], { orderBy, limit } = {}) {
    let query = this.collection;
    for (const [field, op, value] of filters) query = query.where(field, op, value);
    if (orderBy) query = query.orderBy(orderBy[0], orderBy[1] || 'asc');
    if (limit) query = query.limit(limit);
    return query;
  }

  async findWhere(filters = [], options = {}) {
    const snap = await this.buildQuery(filters, options).get();
    return snap.docs.map(snapshotToDoc);
  }

  async findOneWhere(filters = []) {
    const [doc] = await this.findWhere(filters, { limit: 1 });
    return doc || null;
  }

  async count(filters = []) {
    const snap = await this.buildQuery(filters).count().get();
    return snap.data().count;
  }
}
