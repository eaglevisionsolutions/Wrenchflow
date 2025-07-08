
// workorders-advanced.js (refactored to pure logic/data helpers only)
import * as WrenchFlowAPI from './api-service.js';

// --- Pure logic/data helpers for work order pages ---

// Fetch dropdown data for equipment, employees, and parts
export async function getDropdownData(shop_id) {
  const [equipment, employees, parts] = await Promise.all([
    WrenchFlowAPI.getEquipment(shop_id),
    WrenchFlowAPI.getEmployees(shop_id),
    WrenchFlowAPI.getParts(shop_id)
  ]);
  return { equipment, employees, parts };
}

export function buildEquipmentOptions(equipmentList) {
  return '<option value="">Select Equipment</option>' +
    equipmentList.map(e => `<option value="${e.equipment_id}">${e.unit_type} - ${e.make} (${e.serial_number})</option>`).join('');
}

export function buildTechnicianOptions(employeeList) {
  return '<option value="">Select Technician</option>' +
    employeeList.filter(e => e.role === 'technician').map(e => `<option value="${e.shop_user_id}">${e.first_name} ${e.last_name}</option>`).join('');
}

export function buildPartOptions(partList) {
  return '<option value="">Select Part</option>' +
    partList.map(p => `<option value="${p.part_id}">${p.part_name} (${p.part_number})</option>`).join('');
}

// Render parts/services tables (returns HTML string for tbody)
export function renderPartsTableRows(partsUsed) {
  return partsUsed.map((p, i) =>
    `<tr><td>${p.name}</td><td>${p.qty}</td><td><button class='btn btn-sm btn-danger' data-index='${i}' data-action='remove-part'>Remove</button></td></tr>`
  ).join('');
}

export function renderServicesTableRows(services) {
  return services.map((s, i) =>
    `<tr><td>${s.desc}</td><td>${s.hours}</td><td><button class='btn btn-sm btn-danger' data-index='${i}' data-action='remove-service'>Remove</button></td></tr>`
  ).join('');
}

// Prepare work order data for create/update
export function prepareWorkOrderData({ form, equipmentList, editingId, partsUsed, services, shop_id }) {
  return {
    ...(editingId ? { work_order_id: editingId } : {}),
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
}

// API helpers for work orders
export function getWorkOrders(shop_id) {
  return WrenchFlowAPI.getWorkOrders(shop_id);
}
export function createWorkOrder(data) {
  return WrenchFlowAPI.createWorkOrder(data);
}
export function updateWorkOrder(data) {
  return WrenchFlowAPI.updateWorkOrder(data);
}
export function deleteWorkOrder(id, shop_id) {
  return WrenchFlowAPI.deleteWorkOrder(id, shop_id);
}
