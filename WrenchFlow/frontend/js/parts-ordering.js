// File: WrenchFlow/frontend/js/parts-ordering.js
// This script handles the parts ordering functionality, including vendor selection, line items, and order creation
const API_BASE_URL = '/api/parts-orders'; // Adjust this to match your backend API endpoint
const VENDOR_API_URL = '/api/vendors'; // Endpoint to fetch vendors
const PARTS_API_URL = '/api/parts'; // Endpoint to fetch parts
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

// Fetch and display vendors in the dropdown
async function populateVendors() {
    try {
        const response = await fetch(`${VENDOR_API_URL}?shop_id=${shopId}`);
        const vendors = await response.json();
        const vendorSelect = document.getElementById('vendorSelect');
        vendorSelect.innerHTML = ''; // Clear existing options

        vendors.forEach(vendor => {
            const option = document.createElement('option');
            option.value = vendor.id;
            option.textContent = vendor.vendor_name;
            vendorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching vendors:', error);
    }
}

// Add a new line item dynamically
function addLineItem() {
    const lineItemsContainer = document.getElementById('lineItemsContainer');
    const lineItemIndex = lineItemsContainer.children.length;

    const lineItemDiv = document.createElement('div');
    lineItemDiv.classList.add('mb-3', 'line-item');
    lineItemDiv.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <label for="partSelect_${lineItemIndex}" class="form-label">Part</label>
                <select class="form-select part-select" id="partSelect_${lineItemIndex}" required>
                    <!-- Parts will be dynamically populated -->
                </select>
            </div>
            <div class="col-md-3">
                <label for="quantity_${lineItemIndex}" class="form-label">Quantity</label>
                <input type="number" class="form-control" id="quantity_${lineItemIndex}" required>
            </div>
            <div class="col-md-3">
                <label for="isNewPart_${lineItemIndex}" class="form-label">Is New Part?</label>
                <select class="form-select" id="isNewPart_${lineItemIndex}" required>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                </select>
            </div>
        </div>
    `;
    lineItemsContainer.appendChild(lineItemDiv);

    // Populate parts dropdown for the new line item
    populatePartsDropdown(lineItemDiv.querySelector('.part-select'));
}

// Populate parts dropdown dynamically based on the selected vendor
async function populatePartsDropdown(partSelect) {
    try {
        const vendorId = document.getElementById('vendorSelect').value;
        const response = await fetch(`${PARTS_API_URL}?shop_id=${shopId}&vendor_id=${vendorId}`);
        const parts = await response.json();
        partSelect.innerHTML = ''; // Clear existing options

        parts.forEach(part => {
            const option = document.createElement('option');
            option.value = part.id;
            option.textContent = `${part.name} (${part.part_number})`;
            partSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching parts:', error);
    }
}

// Create a new parts order
document.getElementById('createOrderForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const vendorId = document.getElementById('vendorSelect').value;
    const orderDate = document.getElementById('orderDate').value;
    const lineItems = Array.from(document.querySelectorAll('.line-item')).map((lineItem, index) => ({
        part_id: lineItem.querySelector(`#partSelect_${index}`).value,
        quantity_ordered: lineItem.querySelector(`#quantity_${index}`).value,
        is_new_part: lineItem.querySelector(`#isNewPart_${index}`).value,
    }));

    const orderData = {
        shop_id: shopId,
        vendor_id: vendorId,
        order_date: orderDate,
        line_items: lineItems,
    };

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });

        if (response.ok) {
            alert('Parts order created successfully!');
            fetchOrders(); // Refresh the orders table
            document.getElementById('createOrderForm').reset(); // Clear the form
            document.getElementById('lineItemsContainer').innerHTML = ''; // Clear line items
        } else {
            console.error('Failed to create parts order:', await response.json());
        }
    } catch (error) {
        console.error('Error creating parts order:', error);
    }
});

// Fetch and display parts orders
async function fetchOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}?shop_id=${shopId}`);
        const orders = await response.json();
        populateOrdersTable(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

// Populate the orders table
function populateOrdersTable(orders) {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.vendor_name}</td>
            <td>${order.order_date}</td>
            <td>${order.order_status}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrder(${order.id})">View</button>
                <button class="btn btn-sm btn-success" onclick="receiveParts(${order.id})">Receive</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initial setup
document.getElementById('addLineItemButton').addEventListener('click', addLineItem);
document.getElementById('vendorSelect').addEventListener('change', () => {
    const partSelects = document.querySelectorAll('.part-select');
    partSelects.forEach(populatePartsDropdown);
});
populateVendors();
fetchOrders();