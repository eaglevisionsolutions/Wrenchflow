const API_BASE_URL = '/api/appointments'; // Adjust this to match your backend API endpoint
const CUSTOMER_API_URL = '/api/customers'; // Endpoint to fetch customers
const EQUIPMENT_API_URL = '/api/equipment'; // Endpoint to fetch equipment
const TECHNICIAN_API_URL = '/api/technicians'; // Endpoint to fetch technicians
const shopId = 1; // Replace with the actual shop_id from the logged-in user's session

let calendar;

// Fetch and display appointments in the calendar
async function populateCalendar() {
    try {
        const response = await fetch(`${API_BASE_URL}?shop_id=${shopId}`);
        const appointments = await response.json();

        const events = appointments.map(appointment => ({
            id: appointment.id,
            title: `${appointment.customer_first_name} ${appointment.customer_last_name}`,
            start: `${appointment.appointment_date}T${appointment.appointment_time}`,
            extendedProps: {
                status: appointment.status,
                technician: appointment.technician_name,
            },
        }));

        calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            initialView: 'dayGridMonth',
            events,
            eventClick: handleEventClick,
        });

        calendar.render();
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
}

// Populate the appointments table
async function populateAppointmentsTable() {
    try {
        const response = await fetch(`${API_BASE_URL}?shop_id=${shopId}`);
        const appointments = await response.json();
        const tableBody = document.getElementById('appointmentsTableBody');
        tableBody.innerHTML = ''; // Clear existing rows

        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.customer_first_name} ${appointment.customer_last_name}</td>
                <td>${appointment.equipment_name}</td>
                <td>${appointment.appointment_date}</td>
                <td>${appointment.appointment_time}</td>
                <td>${appointment.status}</td>
                <td>${appointment.technician_name || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editAppointment(${appointment.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAppointment(${appointment.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
}

// Handle event click in the calendar
function handleEventClick(info) {
    const appointmentId = info.event.id;
    editAppointment(appointmentId);
}

// Populate dropdowns for customers, equipment, and technicians
async function populateDropdowns() {
    await populateCustomers();
    await populateEquipment();
    await populateTechnicians();
}

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

async function populateTechnicians() {
    try {
        const response = await fetch(`${TECHNICIAN_API_URL}?shop_id=${shopId}`);
        const technicians = await response.json();
        const technicianSelect = document.getElementById('technicianSelect');
        technicianSelect.innerHTML = ''; // Clear existing options

        technicians.forEach(technician => {
            const option = document.createElement('option');
            option.value = technician.id;
            option.textContent = technician.name;
            technicianSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching technicians:', error);
    }
}

// Handle appointment form submission
document.getElementById('appointmentForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const appointmentId = document.getElementById('appointmentId').value;
    const appointmentData = {
        shop_id: shopId,
        customer_id: document.getElementById('customerSelect').value,
        equipment_id: document.getElementById('equipmentSelect').value,
        appointment_date: document.getElementById('appointmentDate').value,
        appointment_time: document.getElementById('appointmentTime').value,
        status: document.getElementById('appointmentStatus').value,
        technician_id: document.getElementById('technicianSelect').value,
    };

    try {
        const response = await fetch(appointmentId ? `${API_BASE_URL}/${appointmentId}` : API_BASE_URL, {
            method: appointmentId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData),
        });

        if (response.ok) {
            alert(`Appointment ${appointmentId ? 'updated' : 'created'} successfully!`);
            populateCalendar();
            populateAppointmentsTable();
            document.getElementById('appointmentForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
        } else {
            console.error('Failed to save appointment:', await response.json());
        }
    } catch (error) {
        console.error('Error saving appointment:', error);
    }
});

// Edit an appointment
async function editAppointment(appointmentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${appointmentId}?shop_id=${shopId}`);
        const appointment = await response.json();

        document.getElementById('appointmentId').value = appointment.id;
        document.getElementById('customerSelect').value = appointment.customer_id;
        document.getElementById('equipmentSelect').value = appointment.equipment_id;
        document.getElementById('appointmentDate').value = appointment.appointment_date;
        document.getElementById('appointmentTime').value = appointment.appointment_time;
        document.getElementById('appointmentStatus').value = appointment.status;
        document.getElementById('technicianSelect').value = appointment.technician_id;

        const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching appointment:', error);
    }
}

// Delete an appointment
async function deleteAppointment(appointmentId) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${appointmentId}?shop_id=${shopId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Appointment deleted successfully!');
            populateCalendar();
            populateAppointmentsTable();
        } else {
            console.error('Failed to delete appointment:', await response.json());
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
    }
}

// Initial setup
populateDropdowns();
populateCalendar();
populateAppointmentsTable();