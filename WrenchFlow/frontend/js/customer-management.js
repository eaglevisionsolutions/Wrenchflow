const API_BASE_URL = '/api/customers'; // Adjust this to match your backend API endpoint
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

// Fetch and display customers
async function fetchCustomers() {
    try {
        const response = await fetch(`${API_BASE_URL}?shop_id=${shopId}`);
        const customers = await response.json();
        populateCustomerTable(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

// Populate the customer table
function populateCustomerTable(customers) {
    const tableBody = document.getElementById('customerTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.first_name}</td>
            <td>${customer.last_name}</td>
            <td>${customer.phone_number}</td>
            <td>${customer.email || ''}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editCustomer(${customer.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add a new customer
document.getElementById('customerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const customerData = {
        shop_id: shopId,
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        phone_number: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
    };

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData),
        });

        if (response.ok) {
            alert('Customer added successfully!');
            fetchCustomers(); // Refresh the table
            event.target.reset(); // Clear the form
        } else {
            console.error('Failed to add customer:', await response.json());
        }
    } catch (error) {
        console.error('Error adding customer:', error);
    }
});

// Edit a customer (placeholder function)
function editCustomer(customerId) {
    alert(`Edit functionality for customer ID ${customerId} is not implemented yet.`);
}

// Delete a customer
async function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${customerId}?shop_id=${shopId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Customer deleted successfully!');
            fetchCustomers(); // Refresh the table
        } else {
            console.error('Failed to delete customer:', await response.json());
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
    }
}

// Search customers
document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#customerTableBody tr');

    rows.forEach(row => {
        const firstName = row.children[0].textContent.toLowerCase();
        const lastName = row.children[1].textContent.toLowerCase();
        const phone = row.children[2].textContent.toLowerCase();
        const email = row.children[3].textContent.toLowerCase();

        if (firstName.includes(searchTerm) || lastName.includes(searchTerm) || phone.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Initial fetch of customers
fetchCustomers();