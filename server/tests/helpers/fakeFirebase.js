/*
 * In-memory test doubles for the subset of the Firestore Admin API and Firebase Auth that
 * the repositories use. Transactions are serialised with a mutex, which mirrors Firestore's
 * guarantee that conflicting transactions cannot both commit.
 */

const clone = (value) => (value === undefined ? undefined : structuredClone(value));
let autoId = 0;
const nextId = () => `id${(autoId += 1).toString(36)}${Math.random().toString(36).slice(2, 8)}`;

class DocSnapshot {
  constructor(id, data, ref) {
    this.id = id;
    this.ref = ref;
    this._data = data;
    this.exists = data !== undefined;
  }

  data() {
    return clone(this._data);
  }
}

class QuerySnapshot {
  constructor(docs) {
    this.docs = docs;
    this.size = docs.length;
    this.empty = docs.length === 0;
  }

  forEach(fn) {
    this.docs.forEach(fn);
  }
}

const compare = (a, b) => (a === b ? 0 : a === undefined || a === null ? -1 : b === undefined || b === null ? 1 : a < b ? -1 : 1);

const OPERATORS = {
  '==': (v, x) => v === x,
  '!=': (v, x) => v !== x,
  '<': (v, x) => v !== undefined && v < x,
  '<=': (v, x) => v !== undefined && v <= x,
  '>': (v, x) => v !== undefined && v > x,
  '>=': (v, x) => v !== undefined && v >= x,
  in: (v, x) => x.includes(v),
  'not-in': (v, x) => !x.includes(v),
  'array-contains': (v, x) => Array.isArray(v) && v.includes(x),
  'array-contains-any': (v, x) => Array.isArray(v) && v.some((item) => x.includes(item)),
};

class Query {
  constructor(store, name, filters = [], order = [], max = null) {
    this.store = store;
    this.name = name;
    this.filters = filters;
    this.order = order;
    this.max = max;
  }

  where(field, op, value) {
    if (!OPERATORS[op]) throw new Error(`Unsupported operator ${op}`);
    return new Query(this.store, this.name, [...this.filters, [field, op, value]], this.order, this.max);
  }

  orderBy(field, direction = 'asc') {
    return new Query(this.store, this.name, this.filters, [...this.order, [field, direction]], this.max);
  }

  limit(n) {
    return new Query(this.store, this.name, this.filters, this.order, n);
  }

  _run() {
    const collection = this.store._rawCollection(this.name);
    let rows = [...collection.entries()].filter(([, data]) => this.filters.every(([f, op, v]) => OPERATORS[op](data[f], v)));
    for (const [field, direction] of [...this.order].reverse()) {
      rows.sort((a, b) => compare(a[1][field], b[1][field]) * (direction === 'desc' ? -1 : 1));
    }
    if (this.max) rows = rows.slice(0, this.max);
    return rows.map(([id, data]) => new DocSnapshot(id, clone(data), new DocRef(this.store, this.name, id)));
  }

  async get() {
    return new QuerySnapshot(this._run());
  }

  count() {
    return { get: async () => ({ data: () => ({ count: this._run().length }) }) };
  }
}

class DocRef {
  constructor(store, collectionName, id) {
    this.store = store;
    this.collectionName = collectionName;
    this.id = id;
  }

  async get() {
    return new DocSnapshot(this.id, clone(this.store._rawCollection(this.collectionName).get(this.id)), this);
  }

  async set(data, options = {}) {
    const col = this.store._rawCollection(this.collectionName);
    const current = col.get(this.id);
    col.set(this.id, options.merge && current ? { ...current, ...clone(data) } : clone(data));
  }

  async update(data) {
    const col = this.store._rawCollection(this.collectionName);
    const current = col.get(this.id);
    if (!current) {
      const error = new Error(`No document to update: ${this.collectionName}/${this.id}`);
      error.code = 5;
      throw error;
    }
    col.set(this.id, { ...current, ...clone(data) });
  }

  async delete() {
    this.store._rawCollection(this.collectionName).delete(this.id);
  }
}

class CollectionRef extends Query {
  constructor(store, name) {
    super(store, name);
  }

  doc(id) {
    return new DocRef(this.store, this.name, id || nextId());
  }

  async add(data) {
    const ref = this.doc();
    await ref.set(data);
    return ref;
  }
}

class Transaction {
  constructor() {
    this.writes = [];
  }

  async get(target) {
    return target.get();
  }

  set(ref, data, options) {
    this.writes.push(() => ref.set(data, options));
    return this;
  }

  update(ref, data) {
    this.writes.push(() => ref.update(data));
    return this;
  }

  delete(ref) {
    this.writes.push(() => ref.delete());
    return this;
  }
}

export class FakeFirestore {
  constructor() {
    this.data = new Map();
    this.txQueue = Promise.resolve();
  }

  collection(name) {
    this._rawCollection(name);
    return new CollectionRef(this, name);
  }

  _rawCollection(name) {
    if (!this.data.has(name)) this.data.set(name, new Map());
    return this.data.get(name);
  }

  runTransaction(fn) {
    const run = async () => {
      const tx = new Transaction();
      const result = await fn(tx);
      for (const write of tx.writes) await write();
      return result;
    };
    const next = this.txQueue.then(run, run);
    this.txQueue = next.catch(() => {});
    return next;
  }

  batch() {
    const tx = new Transaction();
    return { set: tx.set.bind(tx), update: tx.update.bind(tx), delete: tx.delete.bind(tx), commit: async () => { for (const w of tx.writes) await w(); } };
  }

  /* Test conveniences */
  seed(collectionName, id, data) {
    this._rawCollection(collectionName).set(id, clone(data));
  }

  read(collectionName, id) {
    return clone(this.data.get(collectionName)?.get(id));
  }

  all(collectionName) {
    return [...(this.data.get(collectionName)?.entries() || [])].map(([id, d]) => ({ id, ...clone(d) }));
  }
}

export class FakeAuth {
  constructor() {
    this.users = new Map();
  }

  /** Tokens in tests are simply "token-<uid>". */
  async verifyIdToken(token) {
    const match = /^token-(.+)$/.exec(token || '');
    if (!match) throw new Error('invalid token');
    const user = this.users.get(match[1]) || { uid: match[1], email: `${match[1]}@test.pk` };
    return { uid: user.uid, email: user.email, email_verified: true };
  }

  addUser(uid, email) {
    this.users.set(uid, { uid, email });
  }

  async deleteUser(uid) {
    this.users.delete(uid);
  }

  async updateUser(uid, props) {
    this.users.set(uid, { ...(this.users.get(uid) || { uid }), ...props });
  }
}
