// IndexedDB service for WrenchFlow application
const DB_NAME = 'WrenchFlowDB';
const DB_VERSION = 1;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object store for customers
            if (!db.objectStoreNames.contains('customers')) {
                const customerStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
                customerStore.createIndex('shop_id', 'shop_id', { unique: false });
            }

            // Create object store for equipment
            if (!db.objectStoreNames.contains('equipment')) {
                const equipmentStore = db.createObjectStore('equipment', { keyPath: 'id', autoIncrement: true });
                equipmentStore.createIndex('shop_id', 'shop_id', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(`Database error: ${event.target.errorCode}`);
        };
    });
}

// Example usage
openDatabase()
    .then((db) => console.log('Database opened successfully:', db))
    .catch((error) => console.error(error));