const LOGIN_API_URL = '/api/login';
const LOGOUT_API_URL = '/api/logout';

// Check if the user is logged in
function checkAuthentication() {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
    }
}

// Restrict access to specific roles
function restrictAccess(allowedRoles) {
    const userRole = localStorage.getItem('userRole');
    if (!allowedRoles.includes(userRole)) {
        alert('You do not have permission to access this page.');
        window.location.href = 'index.html'; // Redirect to a safe page
    }
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            alert('Login successful!');
            localStorage.setItem('userRole', data.role); // Store user role for frontend access control
            window.location.href = 'index.html'; // Redirect to the main page
        } else {
            const error = await response.json();
            document.getElementById('errorMessage').textContent = error.error;
            document.getElementById('errorMessage').style.display = 'block';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('errorMessage').textContent = 'An error occurred. Please try again.';
        document.getElementById('errorMessage').style.display = 'block';
    }
});

// Handle logout
document.getElementById('logoutButton')?.addEventListener('click', async () => {
    try {
        const response = await fetch(LOGOUT_API_URL, { method: 'POST' });
        if (response.ok) {
            localStorage.removeItem('userRole'); // Clear user role
            window.location.href = 'login.html'; // Redirect to login
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
});

// Automatically check authentication on every page load
checkAuthentication();