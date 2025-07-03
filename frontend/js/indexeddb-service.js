// indexeddb-service.js
// Basic IndexedDB setup for WrenchFlow
const DB_NAME = 'wrenchflow';
const DB_VERSION = 1;
const STORE_NAMES = [
  'shops', 'platform_users', 'shop_users', 'customers', 'equipment', 'parts', 'vendors',
  'part_vendor_relations', 'parts_orders', 'parts_order_line_items', 'parts_order_receipts',
  'work_orders', 'work_order_parts', 'work_order_services', 'employees', 'appointments',
  'sales', 'sale_line_items', 'themes', 'shop_settings'
];

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      STORE_NAMES.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id', autoIncrement: false });
        }
      });
    };
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

async function addData(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).add(data);
    tx.oncomplete = () => resolve(true);
    tx.onerror = e => reject(e);
  });
}

async function getData(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e);
  });
}

async function updateData(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
    tx.oncomplete = () => resolve(true);
    tx.onerror = e => reject(e);
  });
}

async function deleteData(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = e => reject(e);
  });
}

// Store master data for offline use
async function cacheMasterData(storeName, dataArr) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  dataArr.forEach(data => tx.objectStore(storeName).put(data));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = e => reject(e);
  });
}
async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e);
  });
}
window.WrenchFlowDB = { openDB, addData, getData, updateData, deleteData, cacheMasterData, getAll };
