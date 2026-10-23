/**
 * Petit adaptateur IndexedDB basé sur des promesses.
 * Aucune logique métier ici : uniquement l'ouverture de la base, les migrations
 * et des opérations élémentaires.
 */
const DB_NAME = 'edulab';
const DB_VERSION = 1;

export const STORES = Object.freeze({
  SUBJECTS: 'subjects',
  COURSES: 'courses',
  SIMULATIONS: 'simulations',
  EXERCISES: 'exercises',
  FAQ: 'faq',
  ATTEMPTS: 'attempts',
  META: 'meta',
});

/** Magasins remplacés en bloc à chaque synchronisation du contenu. */
export const CONTENT_STORES = Object.freeze([
  STORES.SUBJECTS,
  STORES.COURSES,
  STORES.SIMULATIONS,
  STORES.EXERCISES,
  STORES.FAQ,
]);

/**
 * Migrations : pour faire évoluer le schéma, incrémenter DB_VERSION et ajouter
 * un bloc `if (oldVersion < N)` dans `migrate`, sans modifier les blocs précédents.
 */
function migrate(request, oldVersion) {
  const db = request.result;
  const tx = request.transaction;

  if (oldVersion < 1) {
    for (const name of CONTENT_STORES) db.createObjectStore(name, { keyPath: 'id' });
    tx.objectStore(STORES.COURSES).createIndex('subject_id', 'subject_id');
    tx.objectStore(STORES.SIMULATIONS).createIndex('subject_id', 'subject_id');
    tx.objectStore(STORES.EXERCISES).createIndex('course_id', 'course_id');
    tx.objectStore(STORES.EXERCISES).createIndex('simulation_id', 'simulation_id');

    // `synced` vaut 0, 1 ou 2 (nombres) : les booléens ne sont pas des clés IndexedDB valides.
    const attempts = db.createObjectStore(STORES.ATTEMPTS, { keyPath: 'id' });
    attempts.createIndex('owner_id', 'owner_id');
    attempts.createIndex('owner_synced', ['owner_id', 'synced']);

    db.createObjectStore(STORES.META, { keyPath: 'key' });
  }
}

let dbPromise = null;

function openDatabase() {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => migrate(request, event.oldVersion);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Ouverture de la base locale bloquée par un autre onglet.'));
  }).catch((error) => {
    dbPromise = null; // permet une nouvelle tentative
    throw error;
  });
  return dbPromise;
}

/**
 * Exécute `schedule(tx)` dans une transaction. `schedule` doit être synchrone :
 * elle programme les requêtes et peut renvoyer une IDBRequest dont le résultat
 * est retourné une fois la transaction validée.
 */
async function transact(storeNames, mode, schedule) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, mode);
    let output;
    try {
      output = schedule(tx);
    } catch (error) {
      tx.abort();
      reject(error);
      return;
    }
    tx.oncomplete = () => resolve(output instanceof IDBRequest ? output.result : output);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transaction locale annulée.'));
  });
}

export const get = (store, key) => transact(store, 'readonly', (tx) => tx.objectStore(store).get(key));

export const getAll = (store) => transact(store, 'readonly', (tx) => tx.objectStore(store).getAll());

export const getAllByIndex = (store, index, key) =>
  transact(store, 'readonly', (tx) => tx.objectStore(store).index(index).getAll(key));

export const put = (store, value) => transact(store, 'readwrite', (tx) => tx.objectStore(store).put(value));

export const putMany = (store, values) =>
  transact(store, 'readwrite', (tx) => {
    const objectStore = tx.objectStore(store);
    values.forEach((value) => objectStore.put(value));
  });

export const countByIndex = (store, index, key) =>
  transact(store, 'readonly', (tx) => tx.objectStore(store).index(index).count(key));

export const getMeta = async (key) => (await get(STORES.META, key))?.value ?? null;

export const setMeta = (key, value) => put(STORES.META, { key, value });

/**
 * Remplace tout le contenu pédagogique en une seule transaction : en cas
 * d'échec, l'ancien contenu reste intact (pas d'état à moitié mis à jour).
 */
export function replaceContent(collections, version) {
  return transact([...CONTENT_STORES, STORES.META], 'readwrite', (tx) => {
    for (const name of CONTENT_STORES) {
      const store = tx.objectStore(name);
      store.clear();
      (collections[name] ?? []).forEach((row) => store.put(row));
    }
    tx.objectStore(STORES.META).put({ key: 'content_version', value: version });
  });
}
