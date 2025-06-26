const API_BASE_URL = '/api/service-history'; // Adjust this to match your backend API endpoint
const EQUIPMENT_API_URL = '/api/equipment'; // Endpoint to fetch equipment details
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session
const equipmentId = new URLSearchParams(window.location.search).get('equipment_id'); // Get equipment_id from URL

// Fetch and display equipment details
async function fetchEquipmentDetails() {
    try {
        const response = await fetch(`${EQUIPMENT_API_URL}/${equipmentId}?shop_id=${shopId}`);
        const equipment = await response.json();

        const equipmentDetails = document.getElementById('equipmentDetails');
        equipmentDetails.innerHTML = `
            <h4>Equipment Details</h4>
            <p><strong>Name:</strong> ${equipment.name}</p>
            <p><strong>Serial Number:</strong> ${equipment.serial_number}</p>
            <p><strong>Customer:</strong> ${equipment.customer_name}</p>
        `;
    } catch (error) {
        console.error('Error fetching equipment details:', error);
    }
}

// Fetch and display service history
async function fetchServiceHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}?shop_id=${shopId}&equipment_id=${equipmentId}`);
        const workOrders = await response.json();

        const workOrdersContainer = document.getElementById('workOrdersContainer');
        workOrdersContainer.innerHTML = ''; // Clear existing content

        if (workOrders.length === 0) {
            workOrdersContainer.innerHTML = '<p>No completed work orders found for this equipment.</p>';
            return;
        }

        workOrders.forEach(order => {
            const partsUsed = order.parts.map(part => `
                <li>${part.part_name} (${part.part_number}) - Quantity: ${part.quantity_used}, Volume: ${part.volume_used}</li>
            `).join('');

            const servicesPerformed = order.services.map(service => `
                <li>${service.service_name} - $${service.service_cost.toFixed(2)}</li>
            `).join('');

            const totalCost = order.parts.reduce((sum, part) => sum + (part.quantity_used * 10) + (part.volume_used * 5), 0) +
                              order.services.reduce((sum, service) => sum + service.service_cost, 0);

            const workOrderCard = `
                <div class="card mb-3">
                    <div class="card-header">
                        <strong>Work Order #${order.id}</strong> - Completed on ${order.order_date}
                    </div>
                    <div class="card-body">
                        <p><strong>Reported Problem:</strong> ${order.reported_problem || 'N/A'}</p>
                        <p><strong>Diagnosis:</strong> ${order.diagnosis || 'N/A'}</p>
                        <p><strong>Repair Notes:</strong> ${order.repair_notes || 'N/A'}</p>
                        <h5>Parts Used:</h5>
                        <ul>${partsUsed || '<li>No parts used</li>'}</ul>
                        <h5>Services Performed:</h5>
                        <ul>${servicesPerformed || '<li>No services performed</li>'}</ul>
                        <p><strong>Total Cost:</strong> $${totalCost.toFixed(2)}</p>
                    </div>
                </div>
            `;

            workOrdersContainer.innerHTML += workOrderCard;
        });
    } catch (error) {
        console.error('Error fetching service history:', error);
    }
}

// Initial setup
fetchEquipmentDetails();
fetchServiceHistory();