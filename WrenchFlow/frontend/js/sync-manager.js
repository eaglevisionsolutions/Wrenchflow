const SYNC_API_URL = '/api/sync/data'; // Backend API endpoint for synchronization
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

// IndexedDB setup
const dbName = 'WrenchFlowDB';
const dbVersion = 1;
let db;

// Open IndexedDB
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object stores for each module
            if (!db.objectStoreNames.contains('pendingSync')) {
                db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
            }
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

// Add a pending operation to IndexedDB
function addPendingOperation(operation) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('pendingSync', 'readwrite');
        const store = transaction.objectStore('pendingSync');
        const request = store.add(operation);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

// Get all pending operations from IndexedDB
function getPendingOperations() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('pendingSync', 'readonly');
        const store = transaction.objectStore('pendingSync');
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Remove a pending operation from IndexedDB
function removePendingOperation(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('pendingSync', 'readwrite');
        const store = transaction.objectStore('pendingSync');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

// Detect online/offline status
function setupOnlineOfflineDetection() {
    window.addEventListener('online', () => {
        console.log('Online: Syncing pending operations...');
        syncPendingOperations();
    });

    window.addEventListener('offline', () => {
        console.log('Offline: Changes will be queued for sync.');
    });
}

// Sync pending operations with the backend
async function syncPendingOperations() {
    try {
        const pendingOperations = await getPendingOperations();

        if (pendingOperations.length === 0) {
            console.log('No pending operations to sync.');
            return;
        }

        console.log(`Syncing ${pendingOperations.length} pending operations...`);

        // Send pending operations to the backend in batches
        const response = await fetch(SYNC_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shop_id: shopId, operations: pendingOperations }),
        });

        if (response.ok) {
            const result = await response.json();

            // Remove successfully synced operations from IndexedDB
            for (const operation of result.synced) {
                await removePendingOperation(operation.id);
            }

            console.log('Pending operations synced successfully.');
        } else {
            console.error('Failed to sync pending operations:', await response.json());
        }
    } catch (error) {
        console.error('Error syncing pending operations:', error);
    }
}

// Queue a CRUD operation
async function queueOperation(module, action, data) {
    const operation = {
        module,
        action,
        data,
        timestamp: Date.now(),
    };

    try {
        await addPendingOperation(operation);
        console.log(`Operation queued: ${action} on ${module}`);
    } catch (error) {
        console.error('Error queuing operation:', error);
    }
}

// Initialize the sync manager
async function initializeSyncManager() {
    try {
        await openDatabase();
        setupOnlineOfflineDetection();

        // Attempt to sync pending operations if online
        if (navigator.onLine) {
            syncPendingOperations();
        }
    } catch (error) {
        console.error('Error initializing sync manager:', error);
    }
}

// Conflict resolution: "Last-Write-Wins"
function resolveConflict(localData, serverData) {
    return localData.timestamp > serverData.timestamp ? localData : serverData;
}

// Example usage
async function createCustomer(customerData) {
    if (navigator.onLine) {
        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shop_id: shopId, ...customerData }),
            });

            if (response.ok) {
                console.log('Customer created successfully.');
            } else {
                console.error('Failed to create customer:', await response.json());
            }
        } catch (error) {
            console.error('Error creating customer:', error);
        }
    } else {
        // Queue the operation for later sync
        await queueOperation('customers', 'create', customerData);
    }
}

// Initialize the sync manager on page load
initializeSyncManager();