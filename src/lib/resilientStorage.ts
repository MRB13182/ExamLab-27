const DB_NAME = "examlab-resilient-storage";
const STORE_NAME = "snapshots";
const SNAPSHOT_KEY = "latest";
const APP_KEY_PREFIX = "hsc_2027_";

interface StoredSnapshot {
  savedAt: string;
  entries: Record<string, string>;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open backup storage."));
    request.onblocked = () => reject(new Error("Backup storage upgrade is blocked."));
  });
}

function readSnapshot(database: IDBDatabase): Promise<StoredSnapshot | null> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(SNAPSHOT_KEY);
    request.onsuccess = () => {
      const value: unknown = request.result;
      if (
        value &&
        typeof value === "object" &&
        "entries" in value &&
        typeof value.entries === "object" &&
        value.entries !== null
      ) {
        resolve(value as StoredSnapshot);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error ?? new Error("Could not read backup storage."));
  });
}

/** Restore missing app keys from a second on-device store without overwriting newer localStorage values. */
export async function restoreMissingAppStorage(): Promise<number> {
  let database: IDBDatabase | undefined;
  try {
    database = await openDatabase();
    const snapshot = await readSnapshot(database);
    if (!snapshot) return 0;

    let restored = 0;
    for (const [key, value] of Object.entries(snapshot.entries)) {
      if (!key.startsWith(APP_KEY_PREFIX) || typeof value !== "string") continue;
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, value);
        restored += 1;
      }
    }
    return restored;
  } catch (error) {
    // localStorage and downloadable JSON backups remain available if IndexedDB is unsupported.
    console.warn("Redundant storage restore unavailable:", error);
    return 0;
  } finally {
    database?.close();
  }
}

/** Mirror app-owned localStorage entries into IndexedDB as a second on-device recovery copy. */
export async function saveRedundantAppStorage(): Promise<boolean> {
  let database: IDBDatabase | undefined;
  try {
    const entries: Record<string, string> = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(APP_KEY_PREFIX)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) entries[key] = value;
    }

    database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database!.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(
        { savedAt: new Date().toISOString(), entries } satisfies StoredSnapshot,
        SNAPSHOT_KEY,
      );
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not save backup storage."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Backup storage transaction was aborted."));
    });
    return true;
  } catch (error) {
    console.warn("Redundant storage save unavailable:", error);
    return false;
  } finally {
    database?.close();
  }
}
