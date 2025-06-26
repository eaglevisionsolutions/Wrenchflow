const API_BASE_URL = '/api/parts'; // Adjust this to match your backend API endpoint
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

// Fetch and display parts
async function fetchParts() {
    try {
        const response = await fetch(`${API_BASE_URL}?shop_id=${shopId}`);
        const parts = await response.json();
        populatePartsTable(parts);
    } catch (error) {
        console.error('Error fetching parts:', error);
    }
}

// Populate the parts table
function populatePartsTable(parts) {
    const tableBody = document.getElementById('partsTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    parts.forEach(part => {
        const row = document.createElement('tr');
        row.classList.toggle('table-danger', part.quantity < 10); // Highlight low stock
        row.innerHTML = `
            <td>${part.name}</td>
            <td>${part.part_number}</td>
            <td>${part.is_bulk ? 'Bulk' : 'Discrete'}</td>
            <td>${part.quantity}</td>
            <td>${part.sale_price_per_unit.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editPart(${part.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePart(${part.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search parts
document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#partsTableBody tr');

    rows.forEach(row => {
        const name = row.children[0].textContent.toLowerCase();
        const partNumber = row.children[1].textContent.toLowerCase();
        const type = row.children[2].textContent.toLowerCase();

        if (name.includes(searchTerm) || partNumber.includes(searchTerm) || type.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Initial fetch of parts
fetchParts();