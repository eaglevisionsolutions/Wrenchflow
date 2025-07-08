// workorders-advanced.js
// Extracted from workorders-advanced.html
import { renderTable, showMessage } from './ui-components.js';
import * as WrenchFlowAPI from './api-service.js';
import { isOnline, queueSync } from './sync-manager.js';

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

// Auth check: redirect to login if not logged in
const user = JSON.parse(localStorage.getItem('wf_user') || 'null');
if (!user || !user.shop_id) {
  window.location.href = 'login.html';
}
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

window.WrenchFlowUI = window.WrenchFlowUI || {};
WrenchFlowUI.renderTable = window.WrenchFlowUI.renderTable || renderTable;
WrenchFlowUI.showMessage = window.WrenchFlowUI.showMessage || showMessage;

loadWorkOrders();
