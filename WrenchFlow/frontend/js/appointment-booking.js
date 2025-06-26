const API_BASE_URL = '/api/appointments'; // Adjust this to match your backend API endpoint
const EQUIPMENT_API_URL = '/api/equipment'; // Endpoint to fetch equipment
const shopId = 1; // Replace with the actual shop_id from the URL or context

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

// Fetch and display available time slots for a specific date
async function populateTimeSlots(date) {
    try {
        const response = await fetch(`${API_BASE_URL}/available-slots?shop_id=${shopId}&date=${date}`);
        const timeSlots = await response.json();
        const timeSlotSelect = document.getElementById('timeSlotSelect');
        timeSlotSelect.innerHTML = ''; // Clear existing options

        timeSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            timeSlotSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching time slots:', error);
    }
}

// Handle date change to fetch time slots
document.getElementById('appointmentDate').addEventListener('change', (event) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
        populateTimeSlots(selectedDate);
    }
});

// Handle appointment booking form submission
document.getElementById('appointmentForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const appointmentData = {
        shop_id: shopId,
        customer_name: document.getElementById('customerName').value,
        customer_phone: document.getElementById('customerPhone').value,
        customer_email: document.getElementById('customerEmail').value,
        equipment_id: document.getElementById('equipmentSelect').value,
        appointment_date: document.getElementById('appointmentDate').value,
        appointment_time: document.getElementById('timeSlotSelect').value,
    };

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData),
        });

        if (response.ok) {
            alert('Appointment booked successfully!');
            document.getElementById('appointmentForm').reset(); // Clear the form
        } else {
            console.error('Failed to book appointment:', await response.json());
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
    }
});

// Initial setup
populateEquipment();