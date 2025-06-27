const API_BASE_URL = '/api/sales'; // Backend API endpoint for sales
const CUSTOMER_API_URL = '/api/customers'; // Endpoint to fetch customers
const PARTS_API_URL = '/api/parts'; // Endpoint to fetch parts
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

let totalAmount = 0;

// Fetch and display customers in the dropdown
async function populateCustomers() {
    try {
        const response = await fetch(`${CUSTOMER_API_URL}?shop_id=${shopId}`);
        const customers = await response.json();
        const customerSelect = document.getElementById('customerSelect');
        customerSelect.innerHTML = '<option value="">Select a Customer (Optional)</option>'; // Default option

        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.first_name} ${customer.last_name}`;
            customerSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
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
                <input type="number" class="form-control quantity-input" id="quantity_${lineItemIndex}" min="1" required>
            </div>
            <div class="col-md-3">
                <label for="price_${lineItemIndex}" class="form-label">Price</label>
                <input type="number" class="form-control price-input" id="price_${lineItemIndex}" step="0.01" required>
            </div>
        </div>
    `;
    lineItemsContainer.appendChild(lineItemDiv);

    // Populate parts dropdown for the new line item
    populatePartsDropdown(lineItemDiv.querySelector('.part-select'));

    // Update total amount when quantity or price changes
    lineItemDiv.querySelector('.quantity-input').addEventListener('input', updateTotalAmount);
    lineItemDiv.querySelector('.price-input').addEventListener('input', updateTotalAmount);
}

// Populate parts dropdown dynamically
async function populatePartsDropdown(partSelect) {
    try {
        const response = await fetch(`${PARTS_API_URL}?shop_id=${shopId}`);
        const parts = await response.json();
        partSelect.innerHTML = ''; // Clear existing options

        parts.forEach(part => {
            const option = document.createElement('option');
            option.value = part.id;
            option.textContent = `${part.part_name} (${part.part_number})`;
            partSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching parts:', error);
    }
}

// Update total amount dynamically
function updateTotalAmount() {
    totalAmount = 0;

    document.querySelectorAll('.line-item').forEach(lineItem => {
        const quantity = parseFloat(lineItem.querySelector('.quantity-input').value) || 0;
        const price = parseFloat(lineItem.querySelector('.price-input').value) || 0;
        totalAmount += quantity * price;
    });

    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
}

// Add CSRF token to all requests
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Example: Updated recordSale function with error handling and loading spinner
async function recordSale(saleData) {
    try {
        showLoadingSpinner();
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(saleData),
        });

        if (response.ok) {
            showToast('Sale recorded successfully!', 'success');
        } else {
            console.error('Failed to record sale:', await response.json());
            showToast('Failed to record sale. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Error recording sale:', error);
        showToast('An error occurred while recording the sale.', 'danger');
    } finally {
        hideLoadingSpinner();
    }
}

// Handle OTC sales form submission
document.getElementById('otcSalesForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const customerId = document.getElementById('customerSelect').value;
    const lineItems = Array.from(document.querySelectorAll('.line-item')).map((lineItem, index) => ({
        part_id: lineItem.querySelector(`#partSelect_${index}`).value,
        quantity_sold: lineItem.querySelector(`#quantity_${index}`).value,
        sale_price: lineItem.querySelector(`#price_${index}`).value,
    }));

    const saleData = {
        shop_id: shopId,
        customer_id: customerId || null,
        sale_date: new Date().toISOString().split('T')[0],
        total_amount: totalAmount,
        line_items: lineItems,
    };

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData),
        });

        if (response.ok) {
            alert('Sale recorded successfully!');
            document.getElementById('otcSalesForm').reset(); // Clear the form
            document.getElementById('lineItemsContainer').innerHTML = ''; // Clear line items
            document.getElementById('totalAmount').textContent = '0.00'; // Reset total
        } else {
            console.error('Failed to record sale:', await response.json());
        }
    } catch (error) {
        console.error('Error recording sale:', error);
    }
});

// Handle report generation
document.getElementById('generateReportButton').addEventListener('click', async () => {
    const reportType = document.getElementById('reportTypeSelect').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        const response = await fetch(`${API_BASE_URL}?shop_id=${shopId}&report_type=${reportType}&start_date=${startDate}&end_date=${endDate}`);
        const reportData = await response.json();

        const reportContainer = document.getElementById('reportContainer');
        reportContainer.innerHTML = `<pre>${JSON.stringify(reportData, null, 2)}</pre>`;
    } catch (error) {
        console.error('Error generating report:', error);
    }
});

// Initial setup
populateCustomers();
document.getElementById('addLineItemButton').addEventListener('click', addLineItem);