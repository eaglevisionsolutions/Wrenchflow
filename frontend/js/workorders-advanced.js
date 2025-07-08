import * as WrenchFlowAPI from './api-service.js';
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
