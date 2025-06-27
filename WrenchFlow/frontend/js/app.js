console.log('App.js loaded.');

// ===========================
// IndexedDB Service
// ===========================
const dbName = 'WrenchFlowDB';
const dbVersion = 1;
let db;

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

function addPendingOperation(operation) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('pendingSync', 'readwrite');
        const store = transaction.objectStore('pendingSync');
        const request = store.add(operation);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

function getPendingOperations() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('pendingSync', 'readonly');
        const store = transaction.objectStore('pendingSync');
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function removePendingOperation(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('pendingSync', 'readwrite');
        const store = transaction.objectStore('pendingSync');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

// ===========================
// Sync Manager
// ===========================
const SYNC_API_URL = '/api/sync/data';
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

async function syncPendingOperations() {
    try {
        const pendingOperations = await getPendingOperations();

        if (pendingOperations.length === 0) {
            console.log('No pending operations to sync.');
            return;
        }

        console.log(`Syncing ${pendingOperations.length} pending operations...`);

        const response = await fetch(SYNC_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shop_id: shopId, operations: pendingOperations }),
        });

        if (response.ok) {
            const result = await response.json();

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

// Detect online/offline status
window.addEventListener('online', () => {
    console.log('Online: Syncing pending operations...');
    syncPendingOperations();
});

window.addEventListener('offline', () => {
    console.log('Offline: Changes will be queued for sync.');
});

// ===========================
// Theme Manager
// ===========================
const THEME_API_URL = '/api/themes';
const USER_API_URL = '/api/users';

async function fetchThemes() {
    try {
        const response = await fetch(THEME_API_URL);
        const themes = await response.json();
        return themes;
    } catch (error) {
        console.error('Error fetching themes:', error);
    }
}

async function applyTheme(themeId) {
    try {
        const response = await fetch(`${THEME_API_URL}?id=${themeId}`);
        const theme = await response.json();

        const root = document.documentElement;
        Object.entries(theme.theme_config).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    } catch (error) {
        console.error('Error applying theme:', error);
    }
}

// ===========================
// Vendor Management
// ===========================
const VENDOR_API_URL = '/api/vendors';

async function fetchVendors() {
    try {
        const response = await fetch(`${VENDOR_API_URL}?shop_id=${shopId}`);
        const vendors = await response.json();
        populateVendorTable(vendors);
    } catch (error) {
        console.error('Error fetching vendors:', error);
    }
}

function populateVendorTable(vendors) {
    const tableBody = document.getElementById('vendorTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    vendors.forEach(vendor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vendor.vendor_name}</td>
            <td>${vendor.contact_name || ''}</td>
            <td>${vendor.phone || ''}</td>
            <td>${vendor.email || ''}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editVendor(${vendor.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteVendor(${vendor.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===========================
// Work Order Management
// ===========================
const WORK_ORDER_API_URL = '/api/work-orders';

async function fetchWorkOrders() {
    try {
        const response = await fetch(`${WORK_ORDER_API_URL}?shop_id=${shopId}`);
        const workOrders = await response.json();
        populateWorkOrderTable(workOrders);
    } catch (error) {
        console.error('Error fetching work orders:', error);
    }
}

function populateWorkOrderTable(workOrders) {
    const tableBody = document.getElementById('workOrderTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    workOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer_name}</td>
            <td>${order.status}</td>
            <td>${order.total_cost}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewWorkOrder(${order.id})">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteWorkOrder(${order.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===========================
// Appointment Management
// ===========================
const APPOINTMENT_API_URL = '/api/appointments';

async function fetchAppointments() {
    try {
        const response = await fetch(`${APPOINTMENT_API_URL}?shop_id=${shopId}`);
        const appointments = await response.json();
        populateAppointmentTable(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
}

function populateAppointmentTable(appointments) {
    const tableBody = document.getElementById('appointmentTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>${appointment.customer_name}</td>
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewAppointment(${appointment.id})">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAppointment(${appointment.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===========================
// Customer Management
// ===========================
const CUSTOMER_API_URL = '/api/customers';

async function fetchCustomers() {
    try {
        const response = await fetch(`${CUSTOMER_API_URL}?shop_id=${shopId}`);
        const customers = await response.json();
        populateCustomerTable(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

function populateCustomerTable(customers) {
    const tableBody = document.getElementById('customerTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.phone || ''}</td>
            <td>${customer.email || ''}</td>
            <td>${customer.address || ''}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editCustomer(${customer.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===========================
// Equipment Management
// ===========================
const EQUIPMENT_API_URL = '/api/equipment';

async function fetchEquipment() {
    try {
        const response = await fetch(`${EQUIPMENT_API_URL}?shop_id=${shopId}`);
        const equipment = await response.json();
        populateEquipmentTable(equipment);
    } catch (error) {
        console.error('Error fetching equipment:', error);
    }
}

function populateEquipmentTable(equipment) {
    const tableBody = document.getElementById('equipmentTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    equipment.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.serial_number || ''}</td>
            <td>${item.customer_name || ''}</td>
            <td>${item.last_service_date || ''}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewEquipment(${item.id})">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEquipment(${item.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===========================
// Sales Management
// ===========================
const SALES_API_URL = '/api/sales';

async function fetchSales() {
    try {
        const response = await fetch(`${SALES_API_URL}?shop_id=${shopId}`);
        const sales = await response.json();
        populateSalesTable(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
    }
}

function populateSalesTable(sales) {
    const tableBody = document.getElementById('salesTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${sale.customer_name}</td>
            <td>${sale.date}</td>
            <td>${sale.total_amount}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewSale(${sale.id})">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===========================
// Service History
// ===========================
const SERVICE_HISTORY_API_URL = '/api/service-history';

async function fetchServiceHistory() {
    try {
        const response = await fetch(`${SERVICE_HISTORY_API_URL}?shop_id=${shopId}`);
        const history = await response.json();
        populateServiceHistoryTable(history);
    } catch (error) {
        console.error('Error fetching service history:', error);
    }
}

function populateServiceHistoryTable(history) {
    const tableBody = document.getElementById('serviceHistoryTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    history.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.equipment_name}</td>
            <td>${record.service_date}</td>
            <td>${record.description}</td>
            <td>${record.cost}</td>
        `;
        tableBody.appendChild(row);
    });
}

// ===========================
// Parts Management
// ===========================
const PARTS_API_URL = '/api/parts';

async function fetchParts() {
    try {
        const response = await fetch(`${PARTS_API_URL}?shop_id=${shopId}`);
        const parts = await response.json();
        populatePartsTable(parts);
    } catch (error) {
        console.error('Error fetching parts:', error);
    }
}

function populatePartsTable(parts) {
    const tableBody = document.getElementById('partsTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    parts.forEach(part => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${part.name}</td>
            <td>${part.sku || ''}</td>
            <td>${part.quantity || 0}</td>
            <td>${part.price || 0}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editPart(${part.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePart(${part.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===========================
// Parts Ordering
// ===========================
const PARTS_ORDER_API_URL = '/api/parts-orders';

async function fetchPartsOrders() {
    try {
        const response = await fetch(`${PARTS_ORDER_API_URL}?shop_id=${shopId}`);
        const orders = await response.json();
        populatePartsOrderTable(orders);
    } catch (error) {
        console.error('Error fetching parts orders:', error);
    }
}

function populatePartsOrderTable(orders) {
    const tableBody = document.getElementById('partsOrderTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.vendor_name}</td>
            <td>${order.order_date}</td>
            <td>${order.total_cost}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewPartsOrder(${order.id})">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===========================
// Initialize App
// ===========================
async function initializeApp() {
    try {
        await openDatabase();
        console.log('Database initialized.');

        // Fetch initial data
        fetchVendors();
        fetchThemes();
        fetchWorkOrders();
        fetchAppointments();
        syncPendingOperations();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

initializeApp();