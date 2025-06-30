console.log('App.js loaded.');

// ===========================
// CSRF Token Management
// ===========================
async function fetchAndStoreCsrfToken() {
    if (navigator.onLine) {
        try {
            const response = await fetch('/api/csrf-token', { credentials: 'same-origin' });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('csrfToken', data.csrf_token);
            }
        } catch (e) {
            console.error('Failed to fetch CSRF token:', e);
        }
    }
}
fetchAndStoreCsrfToken();

// Helper to get CSRF token
function getCsrfToken() {
    return localStorage.getItem('csrfToken');
}

// Helper for CSRF-protected fetch
async function csrfFetch(url, options = {}) {
    const method = options.method ? options.method.toUpperCase() : 'GET';
    const needsCsrf = ['POST', 'PUT', 'DELETE'].includes(method);
    const headers = options.headers || {};

    if (needsCsrf) {
        headers['X-CSRF-TOKEN'] = getCsrfToken();
    }
    // Always send credentials for session
    return fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
    });
}

// ===========================
// UI Feedback Helpers
// ===========================
function showLoadingSpinner() {
    let spinner = document.getElementById('loadingSpinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loadingSpinner';
        spinner.style.position = 'fixed';
        spinner.style.top = '0';
        spinner.style.left = '0';
        spinner.style.width = '100vw';
        spinner.style.height = '100vh';
        spinner.style.background = 'rgba(255,255,255,0.7)';
        spinner.style.display = 'flex';
        spinner.style.alignItems = 'center';
        spinner.style.justifyContent = 'center';
        spinner.style.zIndex = '9999';
        spinner.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '10000';
        toast.style.minWidth = '200px';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '6px';
        toast.style.color = '#fff';
        toast.style.fontWeight = 'bold';
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff';
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ===========================
// Modal Helpers (if you use modals)
// ===========================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
    }
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

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

        const response = await csrfFetch(SYNC_API_URL, {
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
    tableBody.innerHTML = '';
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

// Example: Add vendor (POST)
async function addVendor(vendorData) {
    const response = await csrfFetch(VENDOR_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData),
    });
    // ...handle response...
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
    tableBody.innerHTML = '';
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

// Example: Add work order (POST)
async function addWorkOrder(orderData) {
    const response = await csrfFetch(WORK_ORDER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
    });
    // ...handle response...
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
    tableBody.innerHTML = '';
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

// Example: Add appointment (POST)
async function addAppointment(appointmentData) {
    const response = await csrfFetch(APPOINTMENT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
    });
    // ...handle response...
}

// ===========================
// Customer Management
// ===========================
const CUSTOMER_API_URL = '/api/customers';

async function fetchCustomers() {
    try {
        showLoadingSpinner();
        const response = await fetch(`${CUSTOMER_API_URL}?shop_id=${shopId}`);
        const customers = await response.json();
        populateCustomerTable(customers);
        hideLoadingSpinner();
    } catch (error) {
        hideLoadingSpinner();
        showToast('Error fetching customers', 'error');
        console.error('Error fetching customers:', error);
    }
}

function populateCustomerTable(customers) {
    const tableBody = document.getElementById('customerTableBody');
    tableBody.innerHTML = '';
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.phone || ''}</td>
            <td>${customer.email || ''}</td>
            <td>${customer.address || ''}</td>
            <td>
                <button class="btn btn-sm btn-warning btn-edit-customer" data-id="${customer.id}">Edit</button>
                <button class="btn btn-sm btn-danger btn-delete-customer" data-id="${customer.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add customer (POST)
async function addCustomer(customerData) {
    try {
        showLoadingSpinner();
        const response = await csrfFetch(CUSTOMER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData),
        });
        hideLoadingSpinner();
        if (response.ok) {
            showToast('Customer added', 'success');
            fetchCustomers();
        } else {
            showToast('Failed to add customer', 'error');
        }
    } catch (error) {
        hideLoadingSpinner();
        showToast('Error adding customer', 'error');
    }
}

async function updateCustomer(id, customerData) {
    try {
        showLoadingSpinner();
        const response = await csrfFetch(`${CUSTOMER_API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData),
        });
        hideLoadingSpinner();
        if (response.ok) {
            showToast('Customer updated', 'success');
            fetchCustomers();
        } else {
            showToast('Failed to update customer', 'error');
        }
    } catch (error) {
        hideLoadingSpinner();
        showToast('Error updating customer', 'error');
    }
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
        showLoadingSpinner();
        const response = await csrfFetch(`${CUSTOMER_API_URL}/${id}`, {
            method: 'DELETE'
        });
        hideLoadingSpinner();
        if (response.ok) {
            showToast('Customer deleted', 'success');
            fetchCustomers();
        } else {
            showToast('Failed to delete customer', 'error');
        }
    } catch (error) {
        hideLoadingSpinner();
        showToast('Error deleting customer', 'error');
    }
}

document.getElementById('customerTableBody')?.addEventListener('click', function(event) {
    if (event.target.matches('.btn-edit-customer')) {
        const id = event.target.dataset.id;
        // openModal('editCustomerModal'); // implement as needed
        // load customer data into modal for editing
    }
    if (event.target.matches('.btn-delete-customer')) {
        const id = event.target.dataset.id;
        deleteCustomer(id);
    }
});

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
    tableBody.innerHTML = '';
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

// Example: Add equipment (POST)
async function addEquipment(equipmentData) {
    const response = await csrfFetch(EQUIPMENT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentData),
    });
    // ...handle response...
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
    tableBody.innerHTML = '';
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

async function recordSale(saleData) {
    const response = await csrfFetch(SALES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
    });
    // ...handle response...
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
        hideLoadingSpinner();
        showToast('Error updating customer', 'error');
    }
}

function populateServiceHistoryTable(history) {
    const tableBody = document.getElementById('serviceHistoryTableBody');
    tableBody.innerHTML = '';
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
        hideLoadingSpinner();
        showToast('Error fetching parts', 'error');
    }
}

function populatePartsTable(parts) {
    const tableBody = document.getElementById('partsTableBody');
    tableBody.innerHTML = '';
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

// Example: Add part (POST)
async function addPart(partData) {
    const response = await csrfFetch(PARTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partData),
    });
    // ...handle response...
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
    tableBody.innerHTML = '';
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

// Example: Add parts order (POST)
async function addPartsOrder(orderData) {
    const response = await csrfFetch(PARTS_ORDER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
    });
    // ...handle response...
}

// ===========================
// Authentication
// ===========================
const LOGIN_API_URL = '/api/login';
const LOGOUT_API_URL = '/api/logout';

function checkAuthentication() {
    const userRole = localStorage.getItem('userRole');
    const isLoginPage = window.location.pathname.endsWith('login.html');
    if (!userRole && !isLoginPage) {
        window.location.href = 'login.html';
    }
}

function restrictAccess(allowedRoles) {
    const userRole = localStorage.getItem('userRole');
    if (!allowedRoles.includes(userRole)) {
        alert('You do not have permission to access this page.');
        window.location.href = 'index.html';
    }
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const csrfToken = localStorage.getItem('csrfToken');

    try {
        showLoadingSpinner();
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({ email, password }),
        });
        hideLoadingSpinner();

        if (response.ok) {
            const data = await response.json();
            showToast('Login successful!', 'success');
            localStorage.setItem('userRole', data.role);
            window.location.href = 'index.html';
        } else {
            let errorMsg = 'Login failed.';
            try {
                const error = await response.json();
                errorMsg = error.error || errorMsg;
            } catch {
                errorMsg = 'Server error. Please try again later.';
            }
            showToast(errorMsg, 'error');
            document.getElementById('errorMessage').textContent = errorMsg;
            document.getElementById('errorMessage').style.display = 'block';
        }
    } catch (error) {
        hideLoadingSpinner();
        showToast('An error occurred. Please try again.', 'error');
        document.getElementById('errorMessage').textContent = 'An error occurred. Please try again.';
        document.getElementById('errorMessage').style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                showLoadingSpinner();
                const response = await fetch(LOGOUT_API_URL, { method: 'POST', credentials: 'same-origin' });
                hideLoadingSpinner();
                if (response.ok) {
                    localStorage.removeItem('userRole');
                    showToast('Logged out', 'success');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                hideLoadingSpinner();
                showToast('Error during logout', 'error');
            }
        });
    }
});

// Automatically check authentication on every page load
checkAuthentication();

// ===========================
// Initialize App
// ===========================
async function initializeApp() {
    try {
        await openDatabase();
        console.log('Database initialized.');

        // Always fetch themes if you want theme switching everywhere
        fetchThemes();

        // Always try to sync pending operations when online
        syncPendingOperations();

        // Page-specific data loading
        const path = window.location.pathname;

        if (path.endsWith('vendor-management.html')) {
            fetchVendors();
        }
        if (path.endsWith('work-order-management.html')) {
            fetchWorkOrders();
        }
        if (path.endsWith('appointment-management.html')) {
            fetchAppointments();
            fetchCustomers();    // for dropdowns
            fetchEquipment();    // for dropdowns
        }
        if (path.endsWith('appointment-booking.html')) {
            fetchAppointments();
            fetchCustomers();
            fetchEquipment();
        }
        if (path.endsWith('customer-management.html')) {
            fetchCustomers();
        }
        if (path.endsWith('equipment-management.html')) {
            fetchEquipment();
        }
        if (path.endsWith('sales-management.html')) {
            fetchSales();
        }
        if (path.endsWith('service-history.html')) {
            fetchServiceHistory();
        }
        if (path.endsWith('parts-ordering.html')) {
            fetchParts();
            fetchPartsOrders();
        }
        if (path.endsWith('parts-management.html')) {
            fetchParts();
        }
        // Add more as needed for other pages

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

initializeApp();