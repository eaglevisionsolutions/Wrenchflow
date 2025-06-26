const API_BASE_URL = '/api/work-orders'; // Adjust this to match your backend API endpoint
const CUSTOMER_API_URL = '/api/customers'; // Endpoint to fetch customers
const EQUIPMENT_API_URL = '/api/equipment'; // Endpoint to fetch equipment
const PARTS_API_URL = '/api/parts'; // Endpoint to fetch parts
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

let totalCost = 0;

// Fetch and display customers in the dropdown
async function populateCustomers() {
    try {
        const response = await fetch(`${CUSTOMER_API_URL}?shop_id=${shopId}`);
        const customers = await response.json();
        const customerSelect = document.getElementById('customerSelect');
        customerSelect.innerHTML = ''; // Clear existing options

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

// Fetch and display equipment in the dropdown
async function populateEquipment() {
    try {
        const response = await fetch(`${EQUIPMENT_API_URL}?shop_id=${shopId}`);
        const equipment = await response.json();
        const equipmentSelect = document.getElementById('equipmentSelect');
        equipmentSelect.innerHTML = ''; // Clear existing options

        equipment.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${item.serial_number})`;
            equipmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching equipment:', error);
    }
}

// Add a new part dynamically
function addPart() {
    const partsContainer = document.getElementById('partsContainer');
    const partIndex = partsContainer.children.length;

    const partDiv = document.createElement('div');
    partDiv.classList.add('mb-3', 'part-item');
    partDiv.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <label for="partSelect_${partIndex}" class="form-label">Part</label>
                <select class="form-select part-select" id="partSelect_${partIndex}" required>
                    <!-- Parts will be dynamically populated -->
                </select>
            </div>
            <div class="col-md-3">
                <label for="quantity_${partIndex}" class="form-label">Quantity</label>
                <input type="number" class="form-control" id="quantity_${partIndex}" required>
            </div>
            <div class="col-md-3">
                <label for="volume_${partIndex}" class="form-label">Volume (for bulk)</label>
                <input type="number" class="form-control" id="volume_${partIndex}" step="0.01">
            </div>
        </div>
    `;
    partsContainer.appendChild(partDiv);

    // Populate parts dropdown for the new part
    populatePartsDropdown(partDiv.querySelector('.part-select'));
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
            option.textContent = `${part.name} (${part.part_number})`;
            partSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching parts:', error);
    }
}

// Add a new service dynamically
function addService() {
    const servicesContainer = document.getElementById('servicesContainer');
    const serviceIndex = servicesContainer.children.length;

    const serviceDiv = document.createElement('div');
    serviceDiv.classList.add('mb-3', 'service-item');
    serviceDiv.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <label for="serviceName_${serviceIndex}" class="form-label">Service Name</label>
                <input type="text" class="form-control" id="serviceName_${serviceIndex}" required>
            </div>
            <div class="col-md-4">
                <label for="serviceCost_${serviceIndex}" class="form-label">Service Cost</label>
                <input type="number" class="form-control service-cost" id="serviceCost_${serviceIndex}" step="0.01" required>
            </div>
        </div>
    `;
    servicesContainer.appendChild(serviceDiv);

    // Update total cost when service cost changes
    serviceDiv.querySelector('.service-cost').addEventListener('input', updateTotalCost);
}

// Update total cost dynamically
function updateTotalCost() {
    totalCost = 0;

    // Add costs of all parts
    document.querySelectorAll('.part-item').forEach(partItem => {
        const quantity = parseFloat(partItem.querySelector('.form-control[id^="quantity_"]').value) || 0;
        const volume = parseFloat(partItem.querySelector('.form-control[id^="volume_"]').value) || 0;
        totalCost += quantity * 10; // Example cost per unit
        totalCost += volume * 5; // Example cost per volume
    });

    // Add costs of all services
    document.querySelectorAll('.service-cost').forEach(serviceCost => {
        totalCost += parseFloat(serviceCost.value) || 0;
    });

    document.getElementById('totalCost').textContent = totalCost.toFixed(2);
}

// Initial setup
document.getElementById('addPartButton').addEventListener('click', addPart);
document.getElementById('addServiceButton').addEventListener('click', addService);
populateCustomers();
populateEquipment();