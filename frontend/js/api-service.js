
// Work Order Parts/Services fetchers for detailed print/export
export async function getWorkOrderParts(work_order_id, shop_id) {
  return apiRequest('work_order_parts', 'GET', null, { work_order_id, shop_id });
}
export async function getWorkOrderServices(work_order_id, shop_id) {
  return apiRequest('work_order_services', 'GET', null, { work_order_id, shop_id });
}
// Themes
export async function getThemes() {
  return apiRequest('themes', 'GET');
}
export async function getThemeById(theme_id) {
  return apiRequest('themes', 'GET', null, { id: theme_id });
}
export async function setUserTheme(shop_user_id, theme_id) {
  // This would POST or PUT to a user endpoint; placeholder for now
  return Promise.resolve();
}
// Work Orders
export async function getWorkOrders(shop_id) {
  return apiRequest('work_orders', 'GET', null, { shop_id });
}
export async function createWorkOrder(data) {
  // Save work order, then save parts/services if present
  const wo = await apiRequest('work_orders', 'POST', data);
  const work_order_id = wo.work_order_id;
  if (data.parts && data.parts.length) {
    for (const part of data.parts) {
      await apiRequest('work_order_parts', 'POST', { ...part, work_order_id, shop_id: data.shop_id });
    }
  }
  if (data.services && data.services.length) {
    for (const svc of data.services) {
      await apiRequest('work_order_services', 'POST', { ...svc, work_order_id, shop_id: data.shop_id });
    }
  }
  return wo;
}
export async function updateWorkOrder(data) {
  const wo = await apiRequest('work_orders', 'PUT', data);
  // For simplicity, delete all and re-add (production: use diff logic)
  await apiRequest('work_order_parts', 'DELETE', null, { work_order_id: data.work_order_id, shop_id: data.shop_id });
  await apiRequest('work_order_services', 'DELETE', null, { work_order_id: data.work_order_id, shop_id: data.shop_id });
  if (data.parts && data.parts.length) {
    for (const part of data.parts) {
      await apiRequest('work_order_parts', 'POST', { ...part, work_order_id: data.work_order_id, shop_id: data.shop_id });
    }
  }
  if (data.services && data.services.length) {
    for (const svc of data.services) {
      await apiRequest('work_order_services', 'POST', { ...svc, work_order_id: data.work_order_id, shop_id: data.shop_id });
    }
  }
  return wo;
}

export async function deleteWorkOrder(work_order_id, shop_id) {
  return apiRequest('work_orders', 'DELETE', null, { id: work_order_id, shop_id });
}
// Employees
export async function getEmployees(shop_id) {
  return apiRequest('employees', 'GET', null, { shop_id });
}
export async function createEmployee(data) {
  return apiRequest('employees', 'POST', data);
}
export async function updateEmployee(data) {
  return apiRequest('employees', 'PUT', data);
}
export async function deleteEmployee(employee_id, shop_id) {
  return apiRequest('employees', 'DELETE', null, { id: employee_id, shop_id });
}
// Appointments
export async function getAppointments(shop_id) {
  return apiRequest('appointments', 'GET', null, { shop_id });
}
export async function createAppointment(data) {
  return apiRequest('appointments', 'POST', data);
}
export async function updateAppointment(data) {
  return apiRequest('appointments', 'PUT', data);
}
export async function deleteAppointment(appointment_id, shop_id) {
  return apiRequest('appointments', 'DELETE', null, { id: appointment_id, shop_id });
}
// api-service.js
// Generic API service for WrenchFlow
const API_BASE = '/api/';

export async function apiRequest(resource, method = 'GET', data = null, params = {}) {
  let url = API_BASE + resource;
  if (method === 'GET' && Object.keys(params).length) {
    url += '?' + new URLSearchParams(params).toString();
  }
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // for session cookies
  };
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { error: 'Unknown error' };
    }
    // Detect conflict (HTTP 409)
    if (res.status === 409) {
      const serverData = err.serverData || null;
      const conflictError = new Error('Sync conflict');
      conflictError.conflict = true;
      conflictError.serverData = serverData;
      throw conflictError;
    }
    throw new Error(err.error || 'API error');
  }
  return res.json();
}

// Sale Line Items
export async function getSaleLineItems(sale_id) {
  return apiRequest('sale_line_items', 'GET', null, { sale_id });
}
// Example resource-specific helpers
export async function getCustomers(shop_id) {
  return apiRequest('customers', 'GET', null, { shop_id });
}
export async function getCustomerById(customer_id, shop_id) {
  return apiRequest('customers', 'GET', null, { id: customer_id, shop_id });
}
export async function createCustomer(data) {
  return apiRequest('customers', 'POST', data);
}
export async function updateCustomer(data) {
  return apiRequest('customers', 'PUT', data);
}
export async function deleteCustomer(customer_id, shop_id) {
  return apiRequest('customers', 'DELETE', null, { id: customer_id, shop_id });
}
// Equipment
export async function getEquipment(shop_id) {
  return apiRequest('equipment', 'GET', null, { shop_id });
}
export async function createEquipment(data) {
  return apiRequest('equipment', 'POST', data);
}
export async function updateEquipment(data) {
  return apiRequest('equipment', 'PUT', data);
}
export async function deleteEquipment(equipment_id, shop_id) {
  return apiRequest('equipment', 'DELETE', null, { id: equipment_id, shop_id });
}
// Parts
export async function getParts(shop_id) {
  return apiRequest('parts', 'GET', null, { shop_id });
}
export async function createPart(data) {
  return apiRequest('parts', 'POST', data);
}
export async function updatePart(data) {
  return apiRequest('parts', 'PUT', data);
}
export async function deletePart(part_id, shop_id) {
  return apiRequest('parts', 'DELETE', null, { id: part_id, shop_id });
}
// Vendors
export async function getVendors(shop_id) {
  return apiRequest('vendors', 'GET', null, { shop_id });
}
export async function createVendor(data) {
  return apiRequest('vendors', 'POST', data);
}
export async function updateVendor(data) {
  return apiRequest('vendors', 'PUT', data);
}
export async function deleteVendor(vendor_id, shop_id) {
  return apiRequest('vendors', 'DELETE', null, { id: vendor_id, shop_id });
}


