// main.js - Central entry point for all WrenchFlow frontend logic

import { renderTable, showMessage } from './ui-components.js';
import { renderCalendar } from './calendar-view.js';
import * as WrenchFlowAPI from './api-service.js';
import { isOnline, queueSync } from './sync-manager.js';

// --- User/Shop Session Helpers ---
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('wf_user') || 'null');
}
function getCurrentShopId() {
  const user = getCurrentUser();
  return user && user.shop_id ? user.shop_id : '';
}

// --- Require Shop ID Helper ---
function requireShopId() {
  const shop_id = getCurrentShopId();
  if (!shop_id) {
    alert('Session expired or shop not found. Please log in again.');
    window.location.href = 'login.html';
    throw new Error('No shop_id in session');
  }
  return shop_id;
}

// --- Theme CSS Loader (Reusable) ---
/**
 * Loads and applies the theme CSS for a given themeId (string).
 * Removes any existing theme CSS link with id 'wf-theme-css'.
 * @param {string} themeId
 * @returns {Promise<void>}
 */
export async function loadThemeCss(themeId) {
  // Remove any existing theme CSS link
  const oldLink = document.getElementById('wf-theme-css');
  if (oldLink) oldLink.remove();
  if (!themeId) return;
  try {
    // Try to get theme config from API
    const res = await fetch('/api/themes?id=' + themeId);
    const theme = await res.json();
    if (theme && theme.config_json) {
      const config = JSON.parse(theme.config_json);
      if (config.css_url) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'wf-theme-css';
        link.href = config.css_url;
        document.head.appendChild(link);
      }
    }
  } catch (e) {
    // Fail silently
  }
}

// --- Global Dark Mode Toggle ---
function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('wf_dark_mode', '1');
    document.getElementById('darkmode-icon').textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.removeItem('wf_dark_mode');
    document.getElementById('darkmode-icon').textContent = '🌙';
  }
}

const globalDarkToggle = document.getElementById('global-darkmode-toggle');
if (globalDarkToggle) {
  const dark = localStorage.getItem('wf_dark_mode') === '1';
  setDarkMode(dark);
  globalDarkToggle.onclick = function() {
    setDarkMode(!document.body.classList.contains('dark-mode'));
  };
}

// Auth check: redirect to login if not logged in (for all pages except login/index)
const page = window.location.pathname.split('/').pop();
if (!['login.html', 'index.html', ''].includes(page)) {
  const user = JSON.parse(localStorage.getItem('wf_user') || 'null');
  if (!user || !user.shop_id) {
    window.location.href = 'login.html';
  }
}

// --- Per-page logic ---

// --- Login Page Logic ---
if (page === 'login.html') {
  const form = document.getElementById('login-form');
  if (form) {
    form.onsubmit = async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('login-error');
      errorDiv.style.display = 'none';
      try {
        // Call backend login API
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error('Invalid credentials');
        const user = await res.json();
        // Save user info and shop_id to localStorage
        localStorage.setItem('wf_user', JSON.stringify(user));
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } catch (err) {
        errorDiv.textContent = 'Login failed: ' + (err.message || 'Unknown error');
        errorDiv.style.display = 'block';
      }
    };
  }
}

if (page === 'workorders-advanced.html') {
  // ...existing workorders-advanced.js logic...
  const user = JSON.parse(localStorage.getItem('wf_user') || 'null');
  const shop_id = user.shop_id;
  const tableDiv = document.getElementById('workorder-table');
  const form = document.getElementById('workorder-form');
  const addBtn = document.getElementById('add-workorder-btn');
  const cancelBtn = document.getElementById('cancel-workorder-btn');
  let editingId = null;
  let equipmentList = [];
  let employeeList = [];
  let partList = [];
  let partsUsed = [];
  let services = [];

  async function loadDropdowns() {
    equipmentList = await WrenchFlowAPI.getEquipment(shop_id);
    employeeList = await WrenchFlowAPI.getEmployees(shop_id);
    partList = await WrenchFlowAPI.getParts(shop_id);
    form.equipment_id.innerHTML = '<option value="">Select Equipment</option>' + equipmentList.map(e => `<option value="${e.equipment_id}">${e.unit_type} - ${e.make} (${e.serial_number})</option>`).join('');
    form.technician_id.innerHTML = '<option value="">Select Technician</option>' + employeeList.filter(e => e.role === 'technician').map(e => `<option value="${e.shop_user_id}">${e.first_name} ${e.last_name}</option>`).join('');
    document.getElementById('part_id').innerHTML = '<option value="">Select Part</option>' + partList.map(p => `<option value="${p.part_id}">${p.part_name} (${p.part_number})</option>`).join('');
  }

  function renderPartsTable() {
    const tbody = document.getElementById('parts-table').querySelector('tbody');
    tbody.innerHTML = '';
    partsUsed.forEach((p, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.name}</td><td>${p.qty}</td><td><button class='btn btn-sm btn-danger' onclick='removePart(${i})'>Remove</button></td>`;
      tbody.appendChild(tr);
    });
  }

  function renderServicesTable() {
    const tbody = document.getElementById('services-table').querySelector('tbody');
    tbody.innerHTML = '';
    services.forEach((s, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.desc}</td><td>${s.hours}</td><td><button class='btn btn-sm btn-danger' onclick='removeService(${i})'>Remove</button></td>`;
      tbody.appendChild(tr);
    });
  }

  window.removePart = i => { partsUsed.splice(i, 1); renderPartsTable(); };
  window.removeService = i => { services.splice(i, 1); renderServicesTable(); };

  document.getElementById('add-part-btn').onclick = () => {
    const partId = form.part_id.value;
    const qty = parseFloat(form.part_qty.value);
    if (!partId || !qty) return;
    const part = partList.find(p => p.part_id === partId);
    partsUsed.push({ id: partId, name: part.part_name, qty });
    renderPartsTable();
    form.part_id.value = '';
    form.part_qty.value = '';
  };

  document.getElementById('add-service-btn').onclick = () => {
    const desc = form.service_desc.value;
    const hours = parseFloat(form.service_hours.value);
    if (!desc || !hours) return;
    services.push({ desc, hours });
    renderServicesTable();
    form.service_desc.value = '';
    form.service_hours.value = '';
  };

  function loadWorkOrders() {
    WrenchFlowAPI.getWorkOrders(shop_id)
      .then(data => {
        renderTable(tableDiv, data, [
          { key: 'date_created', label: 'Date' },
          { key: 'status', label: 'Status' },
          { key: 'reported_problem', label: 'Problem' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'repair_notes', label: 'Repair Notes' },
          { key: 'actions', label: 'Actions', render: (row) => {
            return `<button class='btn btn-sm btn-warning edit-btn' data-id='${row.work_order_id}'>Edit</button> <button class='btn btn-sm btn-danger delete-btn' data-id='${row.work_order_id}'>Delete</button>`;
          }}
        ]);
        tableDiv.querySelectorAll('.edit-btn').forEach(btn => {
          btn.onclick = () => editWorkOrder(btn.dataset.id, data);
        });
        tableDiv.querySelectorAll('.delete-btn').forEach(btn => {
          btn.onclick = () => deleteWorkOrder(btn.dataset.id);
        });
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  function editWorkOrder(id, data) {
    const wo = data.find(w => w.work_order_id === id);
    if (!wo) return;
    editingId = id;
    form.equipment_id.value = wo.equipment_id;
    form.technician_id.value = wo.technician_id;
    form.date_created.value = wo.date_created.split('T')[0];
    form.status.value = wo.status;
    form.reported_problem.value = wo.reported_problem;
    form.diagnosis.value = wo.diagnosis;
    form.repair_notes.value = wo.repair_notes;
    // TODO: Load partsUsed and services from backend if available
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
  }

  function deleteWorkOrder(id) {
    if (!confirm('Delete this work order?')) return;
    WrenchFlowAPI.deleteWorkOrder(id, shop_id)
      .then(() => {
        showMessage('Work order deleted!', 'success');
        loadWorkOrders();
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  addBtn.onclick = async () => {
    await loadDropdowns();
    partsUsed = [];
    services = [];
    renderPartsTable();
    renderServicesTable();
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
    editingId = null;
    form.reset();
  };

  cancelBtn.onclick = () => {
    form.classList.add('d-none');
    addBtn.classList.remove('d-none');
  };

  form.onsubmit = async e => {
    e.preventDefault();
    const data = {
      ...(editingId ? { work_order_id: editingId } : {}), // Only send work_order_id if editing
      shop_id,
      equipment_id: form.equipment_id.value,
      customer_id: equipmentList.find(eq => eq.equipment_id === form.equipment_id.value)?.customer_id,
      date_created: form.date_created.value,
      status: form.status.value,
      reported_problem: form.reported_problem.value,
      diagnosis: form.diagnosis.value,
      repair_notes: form.repair_notes.value,
      technician_id: form.technician_id.value,
      parts: partsUsed,
      services: services
    };
    const action = editingId ? WrenchFlowAPI.updateWorkOrder : WrenchFlowAPI.createWorkOrder;
    if (!isOnline()) {
      queueSync('work_orders', editingId ? 'PUT' : 'POST', data);
      showMessage('Saved offline. Will sync when online.', 'info');
      form.classList.add('d-none');
      addBtn.classList.remove('d-none');
      loadWorkOrders();
      return;
    }
    action(data)
      .then(() => {
        showMessage(editingId ? 'Work order updated!' : 'Work order added!', 'success');
        form.classList.add('d-none');
        addBtn.classList.remove('d-none');
        loadWorkOrders();
      })
      .catch(e => showMessage(e.message, 'danger'));
  };

  // --- Work Orders Page DEBUG_APP Logic ---
  if (page === 'workorders.html') {
    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        window.DEBUG_APP = !!cfg.APP_DEBUG;
      });
    window.DEBUG_APP = (window.DEBUG_APP !== undefined)
      ? window.DEBUG_APP
      : (localStorage.getItem('DEBUG_APP') === 'true');
  }

  window.WrenchFlowUI = window.WrenchFlowUI || {};
  WrenchFlowUI.renderTable = window.WrenchFlowUI.renderTable || renderTable;
  WrenchFlowUI.showMessage = window.WrenchFlowUI.showMessage || showMessage;

  loadWorkOrders();
}
// --- Appointments Calendar Page Logic ---
if (page === 'appointments-calendar.html') {
  const calendarDiv = document.getElementById('calendar');
  const detailsDiv = document.getElementById('details');
  const user = JSON.parse(localStorage.getItem('wf_user') || 'null');
  const shop_id = user && user.shop_id ? user.shop_id : '';
  function loadCalendar() {
    WrenchFlowAPI.getAppointments(shop_id)
      .then(data => {
        const items = data.map(a => ({
          id: a.appointment_id,
          date: a.appointment_date,
          title: a.service_type + ' - ' + (a.notes || '')
        }));
        if (typeof renderCalendar === 'function') {
          renderCalendar(calendarDiv, items, {
            dateKey: 'date',
            titleKey: 'title',
            onClick: id => showDetails(id, data)
          });
        }
      });
  }
  function showDetails(id, data) {
    const appt = data.find(a => a.appointment_id === id);
    if (!appt) return;
    detailsDiv.innerHTML = `<div class='card'><div class='card-body'><h5>Appointment Details</h5><p><b>Date:</b> ${appt.appointment_date} ${appt.appointment_time}</p><p><b>Service:</b> ${appt.service_type}</p><p><b>Notes:</b> ${appt.notes}</p></div></div>`;
  }
  loadCalendar();
}
// --- Appointments Page Logic ---
if (page === 'appointments.html') {
  const tableDiv = document.getElementById('appointment-table');
  const form = document.getElementById('appointment-form');
  const addBtn = document.getElementById('add-appointment-btn');
  const cancelBtn = document.getElementById('cancel-appointment-btn');
  let editingId = null;
  let appointmentList = [];

  function loadAppointments() {
    WrenchFlowAPI.getAppointments()
      .then(data => {
        appointmentList = data;
        renderTable(tableDiv, data, [
          { key: 'appointment_date', label: 'Date' },
          { key: 'appointment_time', label: 'Time' },
          { key: 'service_type', label: 'Service Type' },
          { key: 'notes', label: 'Notes' },
          { key: 'actions', label: 'Actions', render: (row) => {
            return `<button class='btn btn-sm btn-warning edit-btn' data-id='${row.appointment_id}'>Edit</button> <button class='btn btn-sm btn-danger delete-btn' data-id='${row.appointment_id}'>Delete</button>`;
          }}
        ]);
        tableDiv.querySelectorAll('.edit-btn').forEach(btn => {
          btn.onclick = () => editAppointment(btn.dataset.id);
        });
        tableDiv.querySelectorAll('.delete-btn').forEach(btn => {
          btn.onclick = () => deleteAppointment(btn.dataset.id);
        });
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  function editAppointment(id) {
    const appt = appointmentList.find(a => a.appointment_id === id);
    if (!appt) return;
    editingId = id;
    form.appointment_date.value = appt.appointment_date;
    form.appointment_time.value = appt.appointment_time;
    form.service_type.value = appt.service_type;
    form.notes.value = appt.notes;
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
  }

  function deleteAppointment(id) {
    if (!confirm('Delete this appointment?')) return;
    WrenchFlowAPI.deleteAppointment(id)
      .then(() => {
        showMessage('Appointment deleted!', 'success');
        loadAppointments();
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  addBtn.onclick = () => {
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
    editingId = null;
    form.reset();
  };
  cancelBtn.onclick = () => {
    form.classList.add('d-none');
    addBtn.classList.remove('d-none');
  };
  form.onsubmit = async e => {
    e.preventDefault();
    const data = {
      ...(editingId ? { appointment_id: editingId } : {}),
      appointment_date: form.appointment_date.value,
      appointment_time: form.appointment_time.value,
      service_type: form.service_type.value,
      notes: form.notes.value
    };
    const action = editingId ? WrenchFlowAPI.updateAppointment : WrenchFlowAPI.createAppointment;
    if (!isOnline()) {
      queueSync('appointments', editingId ? 'PUT' : 'POST', data);
      showMessage('Saved offline. Will sync when online.', 'info');
      form.classList.add('d-none');
      addBtn.classList.remove('d-none');
      loadAppointments();
      return;
    }
    action(data)
      .then(() => {
        showMessage(editingId ? 'Appointment updated!' : 'Appointment added!', 'success');
        form.classList.add('d-none');
        addBtn.classList.remove('d-none');
        loadAppointments();
      })
      .catch(e => showMessage(e.message, 'danger'));
  };
  loadAppointments();
}

// --- Customers Page Logic ---
if (page === 'customers.html') {
  const shop_id = requireShopId();
  const tableDiv = document.getElementById('customer-table');
  const form = document.getElementById('customer-form');
  const addBtn = document.getElementById('add-customer-btn');
  const cancelBtn = document.getElementById('cancel-customer-btn');
  let editingId = null;
  let customerList = [];

  function loadCustomers() {
    WrenchFlowAPI.getCustomers(shop_id)
      .then(data => {
        customerList = data;
        renderTable(tableDiv, data, [
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'phone_number', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'address', label: 'Address' },
          { key: 'actions', label: 'Actions', render: (row) => {
            return `<button class='btn btn-sm btn-warning edit-btn' data-id='${row.customer_id}'>Edit</button> <button class='btn btn-sm btn-danger delete-btn' data-id='${row.customer_id}'>Delete</button>`;
          }}
        ]);
        tableDiv.querySelectorAll('.edit-btn').forEach(btn => {
          btn.onclick = () => editCustomer(btn.dataset.id);
        });
        tableDiv.querySelectorAll('.delete-btn').forEach(btn => {
          btn.onclick = () => deleteCustomer(btn.dataset.id);
        });
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  function editCustomer(id) {
    const cust = customerList.find(c => c.customer_id === id);
    if (!cust) return;
    editingId = id;
    form.first_name.value = cust.first_name;
    form.last_name.value = cust.last_name;
    form.phone_number.value = cust.phone_number;
    form.email.value = cust.email;
    form.address.value = cust.address;
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
  }

  function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    WrenchFlowAPI.deleteCustomer(id, shop_id)
      .then(() => {
        showMessage('Customer deleted!', 'success');
        loadCustomers();
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  addBtn.onclick = () => {
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
    editingId = null;
    form.reset();
  };
  cancelBtn.onclick = () => {
    form.classList.add('d-none');
    addBtn.classList.remove('d-none');
  };
  form.onsubmit = async e => {
    e.preventDefault();
    const data = {
      ...(editingId ? { customer_id: editingId } : {}),
      first_name: form.first_name.value,
      last_name: form.last_name.value,
      phone_number: form.phone_number.value,
      email: form.email.value,
      address: form.address.value
    };
    const action = editingId ? WrenchFlowAPI.updateCustomer : WrenchFlowAPI.createCustomer;
    if (!isOnline()) {
      queueSync('customers', editingId ? 'PUT' : 'POST', data);
      showMessage('Saved offline. Will sync when online.', 'info');
      form.classList.add('d-none');
      addBtn.classList.remove('d-none');
      loadCustomers();
      return;
    }
    action(data)
      .then(() => {
        showMessage(editingId ? 'Customer updated!' : 'Customer added!', 'success');
        form.classList.add('d-none');
        addBtn.classList.remove('d-none');
        loadCustomers();
      })
      .catch(e => showMessage(e.message, 'danger'));
  };
  loadCustomers();
}

// --- Dashboard Page Logic ---
if (page === 'dashboard.html') {
  // --- Dashboard logic with shop_id/session checks and debug logging ---
  const user = getCurrentUser();
  const shopId = getCurrentShopId();
  console.log('[Dashboard] user:', user);
  console.log('[Dashboard] shopId:', shopId);
  if (!user || !shopId) {
    alert('Session expired or shop not found. Please log in again.');
    window.location.href = 'login.html';
  } else {
    if (user.theme_id) {
      loadThemeCss(user.theme_id);
    }
    Promise.all([
      WrenchFlowAPI.getWorkOrders(shopId),
      WrenchFlowAPI.getAppointments(shopId),
      WrenchFlowAPI.getParts(shopId),
      WrenchFlowAPI.getVendors(shopId)
    ]).then(([workorders, appointments, parts, vendors]) => {
      document.getElementById('workorder-count').textContent = workorders.length;
      document.getElementById('appointment-count').textContent = appointments.length;
      document.getElementById('lowstock-count').textContent = parts.filter(p => p.quantity_on_hand <= (p.low_stock_threshold || 5)).length;
      document.getElementById('vendor-count').textContent = vendors.length;
    }).catch(err => {
      console.error('[Dashboard] API error:', err);
      showMessage('Failed to load dashboard data: ' + (err.message || err), 'danger');
    });
  }
}

// --- Employees Page Logic ---
if (page === 'employees.html') {
  const shop_id = requireShopId();
  const tableDiv = document.getElementById('employee-table');
  const form = document.getElementById('employee-form');
  const addBtn = document.getElementById('add-employee-btn');
  const cancelBtn = document.getElementById('cancel-employee-btn');
  let editingId = null;
  let employeeList = [];

  function loadEmployees() {
    WrenchFlowAPI.getEmployees(shop_id)
      .then(data => {
        employeeList = data;
        renderTable(tableDiv, data, [
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'username', label: 'Username' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'actions', label: 'Actions', render: (row) => {
            return `<button class='btn btn-sm btn-warning edit-btn' data-id='${row.shop_user_id}'>Edit</button> <button class='btn btn-sm btn-danger delete-btn' data-id='${row.shop_user_id}'>Delete</button>`;
          }}
        ]);
        tableDiv.querySelectorAll('.edit-btn').forEach(btn => {
          btn.onclick = () => editEmployee(btn.dataset.id);
        });
        tableDiv.querySelectorAll('.delete-btn').forEach(btn => {
          btn.onclick = () => deleteEmployee(btn.dataset.id);
        });
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  function editEmployee(id) {
    const emp = employeeList.find(e => e.shop_user_id === id);
    if (!emp) return;
    editingId = id;
    form.first_name.value = emp.first_name;
    form.last_name.value = emp.last_name;
    form.username.value = emp.username;
    form.email.value = emp.email;
    form.role.value = emp.role;
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
  }

  function deleteEmployee(id) {
    if (!confirm('Delete this employee?')) return;
    WrenchFlowAPI.deleteEmployee(id)
      .then(() => {
        showMessage('Employee deleted!', 'success');
        loadEmployees();
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  addBtn.onclick = () => {
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
    editingId = null;
    form.reset();
  };
  cancelBtn.onclick = () => {
    form.classList.add('d-none');
    addBtn.classList.remove('d-none');
  };
  form.onsubmit = async e => {
    e.preventDefault();
    const data = {
      ...(editingId ? { shop_user_id: editingId } : {}),
      first_name: form.first_name.value,
      last_name: form.last_name.value,
      username: form.username.value,
      email: form.email.value,
      role: form.role.value
    };
    const action = editingId ? WrenchFlowAPI.updateEmployee : WrenchFlowAPI.createEmployee;
    if (!isOnline()) {
      queueSync('employees', editingId ? 'PUT' : 'POST', data);
      showMessage('Saved offline. Will sync when online.', 'info');
      form.classList.add('d-none');
      addBtn.classList.remove('d-none');
      loadEmployees();
      return;
    }
    action(data)
      .then(() => {
        showMessage(editingId ? 'Employee updated!' : 'Employee added!', 'success');
        form.classList.add('d-none');
        addBtn.classList.remove('d-none');
        loadEmployees();
      })
      .catch(e => showMessage(e.message, 'danger'));
  };
  loadEmployees();
}

// --- Equipment Page Logic ---
if (page === 'equipment.html') {
  const shop_id = requireShopId();
  const tableDiv = document.getElementById('equipment-table');
  const form = document.getElementById('equipment-form');
  const addBtn = document.getElementById('add-equipment-btn');
  const cancelBtn = document.getElementById('cancel-equipment-btn');
  let editingId = null;
  let equipmentList = [];

  function loadEquipment() {
    WrenchFlowAPI.getEquipment(shop_id)
      .then(data => {
        equipmentList = data;
        renderTable(tableDiv, data, [
          { key: 'unit_type', label: 'Unit Type' },
          { key: 'make', label: 'Make' },
          { key: 'model_number', label: 'Model Number' },
          { key: 'serial_number', label: 'Serial Number' },
          { key: 'purchase_date', label: 'Purchase Date' },
          { key: 'notes', label: 'Notes' },
          { key: 'actions', label: 'Actions', render: (row) => {
            return `<button class='btn btn-sm btn-warning edit-btn' data-id='${row.equipment_id}'>Edit</button> <button class='btn btn-sm btn-danger delete-btn' data-id='${row.equipment_id}'>Delete</button>`;
          }}
        ]);
        tableDiv.querySelectorAll('.edit-btn').forEach(btn => {
          btn.onclick = () => editEquipment(btn.dataset.id);
        });
        tableDiv.querySelectorAll('.delete-btn').forEach(btn => {
          btn.onclick = () => deleteEquipment(btn.dataset.id);
        });
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  function editEquipment(id) {
    const eq = equipmentList.find(e => e.equipment_id === id);
    if (!eq) return;
    editingId = id;
    form.unit_type.value = eq.unit_type;
    form.make.value = eq.make;
    form.model_number.value = eq.model_number;
    form.serial_number.value = eq.serial_number;
    form.purchase_date.value = eq.purchase_date;
    form.notes.value = eq.notes;
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
  }

  function deleteEquipment(id) {
    if (!confirm('Delete this equipment?')) return;
    WrenchFlowAPI.deleteEquipment(id)
      .then(() => {
        showMessage('Equipment deleted!', 'success');
        loadEquipment();
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  addBtn.onclick = () => {
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
    editingId = null;
    form.reset();
  };
  cancelBtn.onclick = () => {
    form.classList.add('d-none');
    addBtn.classList.remove('d-none');
  };
  form.onsubmit = async e => {
    e.preventDefault();
    const data = {
      ...(editingId ? { equipment_id: editingId } : {}),
      unit_type: form.unit_type.value,
      make: form.make.value,
      model_number: form.model_number.value,
      serial_number: form.serial_number.value,
      purchase_date: form.purchase_date.value,
      notes: form.notes.value
    };
    const action = editingId ? WrenchFlowAPI.updateEquipment : WrenchFlowAPI.createEquipment;
    if (!isOnline()) {
      queueSync('equipment', editingId ? 'PUT' : 'POST', data);
      showMessage('Saved offline. Will sync when online.', 'info');
      form.classList.add('d-none');
      addBtn.classList.remove('d-none');
      loadEquipment();
      return;
    }
    action(data)
      .then(() => {
        showMessage(editingId ? 'Equipment updated!' : 'Equipment added!', 'success');
        form.classList.add('d-none');
        addBtn.classList.remove('d-none');
        loadEquipment();
      })
      .catch(e => showMessage(e.message, 'danger'));
  };
  loadEquipment();
}

// --- Parts Page Logic ---
if (page === 'parts.html') {
  const shop_id = requireShopId();
  const tableDiv = document.getElementById('parts-table');
  const form = document.getElementById('part-form');
  const addBtn = document.getElementById('add-part-btn');
  const cancelBtn = document.getElementById('cancel-part-btn');
  let editingId = null;
  let partList = [];

  function loadParts() {
    WrenchFlowAPI.getParts(shop_id)
      .then(data => {
        partList = data;
        renderTable(tableDiv, data, [
          { key: 'part_name', label: 'Part Name' },
          { key: 'part_number', label: 'Part Number' },
          { key: 'cost_price', label: 'Cost Price' },
          { key: 'sale_price', label: 'Sale Price' },
          { key: 'quantity_on_hand', label: 'Qty On Hand' },
          { key: 'bin_location', label: 'Bin Location' },
          { key: 'actions', label: 'Actions', render: (row) => {
            return `<button class='btn btn-sm btn-warning edit-btn' data-id='${row.part_id}'>Edit</button> <button class='btn btn-sm btn-danger delete-btn' data-id='${row.part_id}'>Delete</button>`;
          }}
        ]);
        tableDiv.querySelectorAll('.edit-btn').forEach(btn => {
          btn.onclick = () => editPart(btn.dataset.id);
        });
        tableDiv.querySelectorAll('.delete-btn').forEach(btn => {
          btn.onclick = () => deletePart(btn.dataset.id);
        });
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  function editPart(id) {
    const part = partList.find(p => p.part_id === id);
    if (!part) return;
    editingId = id;
    form.part_name.value = part.part_name;
    form.part_number.value = part.part_number;
    form.cost_price.value = part.cost_price;
    form.sale_price.value = part.sale_price;
    form.quantity_on_hand.value = part.quantity_on_hand;
    form.bin_location.value = part.bin_location;
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
  }

  function deletePart(id) {
    if (!confirm('Delete this part?')) return;
    WrenchFlowAPI.deletePart(id)
      .then(() => {
        showMessage('Part deleted!', 'success');
        loadParts();
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  addBtn.onclick = () => {
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
    editingId = null;
    form.reset();
  };
  cancelBtn.onclick = () => {
    form.classList.add('d-none');
    addBtn.classList.remove('d-none');
  };
  form.onsubmit = async e => {
    e.preventDefault();
    const data = {
      ...(editingId ? { part_id: editingId } : {}),
      part_name: form.part_name.value,
      part_number: form.part_number.value,
      cost_price: parseFloat(form.cost_price.value),
      sale_price: parseFloat(form.sale_price.value),
      quantity_on_hand: parseInt(form.quantity_on_hand.value, 10),
      bin_location: form.bin_location.value
    };
    const action = editingId ? WrenchFlowAPI.updatePart : WrenchFlowAPI.createPart;
    if (!isOnline()) {
      queueSync('parts', editingId ? 'PUT' : 'POST', data);
      showMessage('Saved offline. Will sync when online.', 'info');
      form.classList.add('d-none');
      addBtn.classList.remove('d-none');
      loadParts();
      return;
    }
    action(data)
      .then(() => {
        showMessage(editingId ? 'Part updated!' : 'Part added!', 'success');
        form.classList.add('d-none');
        addBtn.classList.remove('d-none');
        loadParts();
      })
      .catch(e => showMessage(e.message, 'danger'));
  };
  loadParts();
}

// --- Sales Page Logic ---
if (page === 'sales.html') {
  const tableDiv = document.getElementById('sales-table');
  // Print/Export button logic can be added here as needed
  function loadSales() {
    WrenchFlowAPI.getSales()
      .then(data => {
        renderTable(tableDiv, data, [
          { key: 'sale_id', label: 'Sale ID' },
          { key: 'date', label: 'Date' },
          { key: 'customer_name', label: 'Customer' },
          { key: 'total', label: 'Total' },
          { key: 'status', label: 'Status' }
        ]);
      })
      .catch(e => showMessage(e.message, 'danger'));
  }
  loadSales();
}

// --- Vendors Page Logic ---
if (page === 'vendors.html') {
  const shop_id = requireShopId();
  const tableDiv = document.getElementById('vendor-table');
  const form = document.getElementById('vendor-form');
  const addBtn = document.getElementById('add-vendor-btn');
  const cancelBtn = document.getElementById('cancel-vendor-btn');
  let editingId = null;
  let vendorList = [];

  function loadVendors() {
    WrenchFlowAPI.getVendors(shop_id)
      .then(data => {
        vendorList = data;
        renderTable(tableDiv, data, [
          { key: 'vendor_name', label: 'Vendor Name' },
          { key: 'contact_person', label: 'Contact Person' },
          { key: 'phone_number', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'address', label: 'Address' },
          { key: 'notes', label: 'Notes' },
          { key: 'actions', label: 'Actions', render: (row) => {
            return `<button class='btn btn-sm btn-warning edit-btn' data-id='${row.vendor_id}'>Edit</button> <button class='btn btn-sm btn-danger delete-btn' data-id='${row.vendor_id}'>Delete</button>`;
          }}
        ]);
        tableDiv.querySelectorAll('.edit-btn').forEach(btn => {
          btn.onclick = () => editVendor(btn.dataset.id);
        });
        tableDiv.querySelectorAll('.delete-btn').forEach(btn => {
          btn.onclick = () => deleteVendor(btn.dataset.id);
        });
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  function editVendor(id) {
    const vendor = vendorList.find(v => v.vendor_id === id);
    if (!vendor) return;
    editingId = id;
    form.vendor_name.value = vendor.vendor_name;
    form.contact_person.value = vendor.contact_person;
    form.phone_number.value = vendor.phone_number;
    form.email.value = vendor.email;
    form.address.value = vendor.address;
    form.notes.value = vendor.notes;
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
  }

  function deleteVendor(id) {
    if (!confirm('Delete this vendor?')) return;
    WrenchFlowAPI.deleteVendor(id)
      .then(() => {
        showMessage('Vendor deleted!', 'success');
        loadVendors();
      })
      .catch(e => showMessage(e.message, 'danger'));
  }

  addBtn.onclick = () => {
    form.classList.remove('d-none');
    addBtn.classList.add('d-none');
    editingId = null;
    form.reset();
  };
  cancelBtn.onclick = () => {
    form.classList.add('d-none');
    addBtn.classList.remove('d-none');
  };
  form.onsubmit = async e => {
    e.preventDefault();
    const data = {
      ...(editingId ? { vendor_id: editingId } : {}),
      vendor_name: form.vendor_name.value,
      contact_person: form.contact_person.value,
      phone_number: form.phone_number.value,
      email: form.email.value,
      address: form.address.value,
      notes: form.notes.value
    };
    const action = editingId ? WrenchFlowAPI.updateVendor : WrenchFlowAPI.createVendor;
    if (!isOnline()) {
      queueSync('vendors', editingId ? 'PUT' : 'POST', data);
      showMessage('Saved offline. Will sync when online.', 'info');
      form.classList.add('d-none');
      addBtn.classList.remove('d-none');
      loadVendors();
      return;
    }
    action(data)
      .then(() => {
        showMessage(editingId ? 'Vendor updated!' : 'Vendor added!', 'success');
        form.classList.add('d-none');
        addBtn.classList.remove('d-none');
        loadVendors();
      })
      .catch(e => showMessage(e.message, 'danger'));
  };
  loadVendors();
}

// --- Profile Page Logic ---
if (page === 'profile.html') {
  // Load user info and themes, handle save
  let currentThemeId = null;
  async function loadProfile() {
    const user = JSON.parse(localStorage.getItem('wf_user') || '{"username":"demo","email":"demo@example.com","first_name":"Demo","last_name":"User","theme_id":null}');
    document.getElementById('profile-username').value = user.username;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-firstname').value = user.first_name;
    document.getElementById('profile-lastname').value = user.last_name;
    currentThemeId = user.theme_id;
    // Load themes
    const themes = await WrenchFlowAPI.getThemes();
    const themeSel = document.getElementById('profile-theme');
    themeSel.innerHTML = '<option value="">Default</option>' + themes.map(t => `<option value="${t.theme_id}" ${t.theme_id===currentThemeId?'selected':''}>${t.theme_name}</option>`).join('');
    // Theme CSS loader
    await loadThemeCss(currentThemeId);
  }
  // --- Theme Preview Logic ---
  function applyTheme(themeId) {
    loadThemeCss(themeId);
  }
  document.getElementById('preview-theme-btn').onclick = function() {
    const themeId = document.getElementById('profile-theme').value;
    applyTheme(themeId);
  };
  // --- Dark Mode Logic ---
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  darkModeToggle.checked = localStorage.getItem('wf_dark_mode') === '1';
  setDarkMode(darkModeToggle.checked);
  darkModeToggle.onchange = function() {
    setDarkMode(this.checked);
  };
  loadProfile();
  document.getElementById('profile-form').onsubmit = async function(e) {
    e.preventDefault();
    // Save to localStorage (simulate server update)
    const user = JSON.parse(localStorage.getItem('wf_user') || '{"username":"demo"}');
    user.email = document.getElementById('profile-email').value;
    user.first_name = document.getElementById('profile-firstname').value;
    user.last_name = document.getElementById('profile-lastname').value;
    user.theme_id = document.getElementById('profile-theme').value;
    localStorage.setItem('wf_user', JSON.stringify(user));
    // Optionally: call WrenchFlowAPI.setUserTheme(user.id, user.theme_id)
    alert('Profile saved! Theme will apply on next page load.');
    location.reload();
  };
}

// --- Index Page Logic ---
if (page === 'index.html' || page === '') {
  // Redirect to dashboard if logged in, else to login page
  const user = getCurrentUser();
  if (user && user.shop_id) {
    window.location.href = 'dashboard.html';
  } else {
    // Only run the rest if not redirected
    if (user && user.theme_id) {
      loadThemeCss(user.theme_id);
    }
    // Customer CRUD logic
    const shop_id = getCurrentShopId();
    const tableDiv = document.getElementById('customer-table');
    const form = document.getElementById('customer-form');
    const addBtn = document.getElementById('add-customer-btn');
    const cancelBtn = document.getElementById('cancel-customer-btn');
    let editing = false;
    function loadCustomers() {
      WrenchFlowAPI.getCustomers(shop_id)
        .then(data => {
          renderTable(tableDiv, data, [
            { key: 'first_name', label: 'First Name' },
            { key: 'last_name', label: 'Last Name' },
            { key: 'phone_number', label: 'Phone' },
            { key: 'email', label: 'Email' },
            { key: 'address', label: 'Address' }
          ]);
        })
        .catch(e => showMessage(e.message, 'danger'));
    }
    addBtn.onclick = () => {
      form.classList.remove('d-none');
      addBtn.classList.add('d-none');
      editing = false;
      form.reset();
    };
    cancelBtn.onclick = () => {
      form.classList.add('d-none');
      addBtn.classList.remove('d-none');
    };
    form.onsubmit = e => {
      e.preventDefault();
      const data = {
        // customer_id will be assigned by backend
        shop_id,
        first_name: form.first_name.value,
        last_name: form.last_name.value,
        phone_number: form.phone_number.value,
        email: form.email.value,
        address: form.address.value
      };
      WrenchFlowAPI.createCustomer(data)
        .then(() => {
          showMessage('Customer added!', 'success');
          form.classList.add('d-none');
          addBtn.classList.remove('d-none');
          loadCustomers();
        })
        .catch(e => showMessage(e.message, 'danger'));
    };
    window.WrenchFlowUI = window.WrenchFlowUI || {};
    WrenchFlowUI.renderTable = window.WrenchFlowUI.renderTable || renderTable;
    WrenchFlowUI.showMessage = window.WrenchFlowUI.showMessage || showMessage;
    loadCustomers();
  }
}

// --- Work Orders Calendar Page Logic ---
if (page === 'workorders-calendar.html') {
  // --- Auth check: redirect to login if not logged in ---
  const user = getCurrentUser();
  if (!user || !user.shop_id) {
    window.location.href = 'login.html';
  } else {
    const shop_id = getCurrentShopId();
    const calendarDiv = document.getElementById('calendar');
    const detailsDiv = document.getElementById('details');
    function loadCalendar() {
      WrenchFlowAPI.getWorkOrders(shop_id)
        .then(data => {
          const items = data.map(w => ({
            id: w.work_order_id,
            date: w.date_created.split('T')[0],
            title: w.status + ' - ' + (w.reported_problem || '')
          }));
          if (typeof renderCalendar === 'function') {
            renderCalendar(calendarDiv, items, {
              dateKey: 'date',
              titleKey: 'title',
              onClick: id => showDetails(id, data)
            });
          }
        });
    }
    function showDetails(id, data) {
      const wo = data.find(w => w.work_order_id === id);
      if (!wo) return;
      detailsDiv.innerHTML = `<div class='card'><div class='card-body'><h5>Work Order Details</h5><p><b>Date:</b> ${wo.date_created}</p><p><b>Status:</b> ${wo.status}</p><p><b>Problem:</b> ${wo.reported_problem}</p><p><b>Diagnosis:</b> ${wo.diagnosis}</p><p><b>Repair Notes:</b> ${wo.repair_notes}</p></div></div>`;
    }
    loadCalendar();
  }
}
