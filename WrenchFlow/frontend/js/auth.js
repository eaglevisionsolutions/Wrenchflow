const LOGIN_API_URL = '/api/login';
const LOGOUT_API_URL = '/api/logout';

// Check if the user is logged in
function checkAuthentication() {
    const userRole = localStorage.getItem('userRole');
    const isLoginPage = window.location.pathname.endsWith('login.html');
    if (!userRole && !isLoginPage) {
        // Redirect to login page if not logged in and not already on login page
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
    const csrfToken = document.getElementById('csrf_token')?.value;

    try {
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            alert('Login successful!');
            localStorage.setItem('userRole', data.role); // Store user role for frontend access control
            window.location.href = 'index.html'; // Redirect to the main page
        } else {
            let errorMsg = 'Login failed.';
            try {
                const error = await response.json();
                errorMsg = error.error || errorMsg;
            } catch {
                errorMsg = 'Server error. Please try again later.';
            }
            document.getElementById('errorMessage').textContent = errorMsg;
            document.getElementById('errorMessage').style.display = 'block';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('errorMessage').textContent = 'An error occurred. Please try again.';
        document.getElementById('errorMessage').style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout', { method: 'POST' });
                if (response.ok) {
                    localStorage.removeItem('userRole'); // Clear user role
                    window.location.href = 'login.html'; // Redirect to login
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        });
    }
});

// Automatically check authentication on every page load
checkAuthentication();