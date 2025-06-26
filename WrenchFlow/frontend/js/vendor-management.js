const API_BASE_URL = '/api/vendors'; // Adjust this to match your backend API endpoint
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

// Fetch and display vendors
async function fetchVendors() {
    try {
        const response = await fetch(`${API_BASE_URL}?shop_id=${shopId}`);
        const vendors = await response.json();
        populateVendorTable(vendors);
    } catch (error) {
        console.error('Error fetching vendors:', error);
    }
}

// Populate the vendor table
function populateVendorTable(vendors) {
    const tableBody = document.getElementById('vendorTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    vendors.forEach(vendor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vendor.vendor_name}</td>
            <td>${vendor.contact_name || ''}</td>
            <td>${vendor.phone || ''}</td>
            <td>${vendor.email || ''}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editVendor(${vendor.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteVendor(${vendor.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add or update a vendor
document.getElementById('vendorForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const vendorId = document.getElementById('vendorId').value;
    const vendorData = {
        shop_id: shopId,
        vendor_name: document.getElementById('vendorName').value,
        contact_name: document.getElementById('contactName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
    };

    try {
        const response = await fetch(vendorId ? `${API_BASE_URL}/${vendorId}` : API_BASE_URL, {
            method: vendorId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vendorData),
        });

        if (response.ok) {
            alert(`Vendor ${vendorId ? 'updated' : 'created'} successfully!`);
            fetchVendors(); // Refresh the table
            document.getElementById('vendorForm').reset(); // Clear the form
            document.getElementById('formTitle').textContent = 'Create Vendor';
            document.getElementById('vendorId').value = '';
        } else {
            console.error('Failed to save vendor:', await response.json());
        }
    } catch (error) {
        console.error('Error saving vendor:', error);
    }
});

// Edit a vendor
function editVendor(vendorId) {
    fetch(`${API_BASE_URL}/${vendorId}?shop_id=${shopId}`)
        .then(response => response.json())
        .then(vendor => {
            document.getElementById('formTitle').textContent = 'Edit Vendor';
            document.getElementById('vendorId').value = vendor.id;
            document.getElementById('vendorName').value = vendor.vendor_name;
            document.getElementById('contactName').value = vendor.contact_name;
            document.getElementById('phone').value = vendor.phone;
            document.getElementById('email').value = vendor.email;
            document.getElementById('address').value = vendor.address;
        })
        .catch(error => console.error('Error fetching vendor:', error));
}

// Delete a vendor
async function deleteVendor(vendorId) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${vendorId}?shop_id=${shopId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Vendor deleted successfully!');
            fetchVendors(); // Refresh the table
        } else {
            console.error('Failed to delete vendor:', await response.json());
        }
    } catch (error) {
        console.error('Error deleting vendor:', error);
    }
}

// Search vendors
document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#vendorTableBody tr');

    rows.forEach(row => {
        const vendorName = row.children[0].textContent.toLowerCase();
        const contactName = row.children[1].textContent.toLowerCase();

        if (vendorName.includes(searchTerm) || contactName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Initial fetch of vendors
fetchVendors();