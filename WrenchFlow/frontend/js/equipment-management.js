const API_BASE_URL = '/api/equipment'; // Adjust this to match your backend API endpoint
const CUSTOMER_API_URL = '/api/customers'; // Endpoint to fetch customers
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

// Fetch and display equipment
async function fetchEquipment() {
    try {
        const response = await fetch(`${API_BASE_URL}?shop_id=${shopId}`);
        const equipment = await response.json();
        populateEquipmentTable(equipment);
    } catch (error) {
        console.error('Error fetching equipment:', error);
    }
}

// Populate the equipment table
function populateEquipmentTable(equipment) {
    const tableBody = document.getElementById('equipmentTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    equipment.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.customer_name}</td>
            <td>${item.name}</td>
            <td>${item.serial_number}</td>
            <td>${item.description || ''}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editEquipment(${item.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEquipment(${item.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Fetch and populate customer dropdown
async function populateCustomerDropdown() {
    try {
        const response = await fetch(`${CUSTOMER_API_URL}?shop_id=${shopId}`);
        const customers = await response.json();
        const customerDropdown = document.getElementById('customerId');
        customerDropdown.innerHTML = ''; // Clear existing options

        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.first_name} ${customer.last_name}`;
            customerDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

// Add new equipment
document.getElementById('equipmentForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const equipmentData = {
        shop_id: shopId,
        customer_id: document.getElementById('customerId').value,
        name: document.getElementById('name').value,
        serial_number: document.getElementById('serialNumber').value,
        description: document.getElementById('description').value,
    };

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipmentData),
        });

        if (response.ok) {
            alert('Equipment added successfully!');
            fetchEquipment(); // Refresh the table
            event.target.reset(); // Clear the form
        } else {
            console.error('Failed to add equipment:', await response.json());
        }
    } catch (error) {
        console.error('Error adding equipment:', error);
    }
});

// Edit equipment (placeholder function)
function editEquipment(equipmentId) {
    alert(`Edit functionality for equipment ID ${equipmentId} is not implemented yet.`);
}

// Delete equipment
async function deleteEquipment(equipmentId) {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${equipmentId}?shop_id=${shopId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Equipment deleted successfully!');
            fetchEquipment(); // Refresh the table
        } else {
            console.error('Failed to delete equipment:', await response.json());
        }
    } catch (error) {
        console.error('Error deleting equipment:', error);
    }
}

// Search equipment
document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#equipmentTableBody tr');

    rows.forEach(row => {
        const name = row.children[1].textContent.toLowerCase();
        const serialNumber = row.children[2].textContent.toLowerCase();

        if (name.includes(searchTerm) || serialNumber.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Initial fetch of equipment and customers
fetchEquipment();
populateCustomerDropdown();