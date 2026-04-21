const DB_NAME = 'plateau-tech-ranch';
const DB_VERSION = 2;
const STORE_NAME = 'farmer-listings';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(mode, executor) {
  return openDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);

        executor(store, resolve, reject);

        transaction.onerror = () => {
          database.close();
          reject(transaction.error);
        };

        transaction.oncomplete = () => database.close();
      }),
  );
}

export function generateDigitalId() {
  const timestamp = new Date()
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replaceAll('T', '')
    .replaceAll('Z', '')
    .replaceAll('.', '')
    .slice(0, 14);
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `QH-DID-${timestamp}-${random}`;
}

export function isQinghaiLocation(watermark) {
  if (!watermark) {
    return false;
  }

  const label = `${watermark.region || ''} ${watermark.origin || ''}`;
  const matchesText =
    /青海|玉树|果洛|海东|海北|海西|海南州|黄南|西宁|柴达木/.test(label);

  if (matchesText) {
    return true;
  }

  const latitude = watermark.latitude;
  const longitude = watermark.longitude;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }

  return latitude >= 31 && latitude <= 40 && longitude >= 89 && longitude <= 104;
}

export function saveFarmerListing(listing) {
  return withStore('readwrite', (store, resolve) => {
    store.put(listing);
    resolve(listing);
  });
}

export function getFarmerListings() {
  return withStore('readonly', (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const listings = (request.result || []).sort(
        (left, right) =>
          new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
      );
      resolve(listings);
    };
    request.onerror = () => reject(request.error);
  });
}

export function updateFarmerListingStatus(id, status, reviewNote) {
  return withStore('readwrite', (store, resolve, reject) => {
    const request = store.get(id);

    request.onsuccess = () => {
      const current = request.result;
      if (!current) {
        resolve(null);
        return;
      }

      const next = {
        ...current,
        status,
        reviewNote,
        reviewedAt: new Date().toISOString(),
      };

      store.put(next);
      resolve(next);
    };

    request.onerror = () => reject(request.error);
  });
}
