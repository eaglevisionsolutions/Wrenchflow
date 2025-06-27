// IndexedDB service for WrenchFlow application
const dbName = 'WrenchFlowDB';
const dbVersion = 1;
let db;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('customers', { keyPath: 'id' });
            db.createObjectStore('equipment', { keyPath: 'id' });
            db.createObjectStore('parts', { keyPath: 'id' });
            db.createObjectStore('workOrders', { keyPath: 'id' });
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Example usage
openDatabase()
    .then((db) => console.log('Database opened successfully:', db))
    .catch((error) => console.error(error));