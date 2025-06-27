// Log when the app goes online
window.addEventListener('online', () => {
    console.log('You are now online.');
});

// Log when the app goes offline
window.addEventListener('offline', () => {
    console.log('You are now offline.');
});

// Initial check for online/offline status
if (navigator.onLine) {
    console.log('App is currently online.');
} else {
    console.log('App is currently offline.');
}

// Add this to a global JavaScript file
document.getElementById('logoutButton').addEventListener('click', async () => {
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
// Add this to a global JavaScript file
document.getElementById('logoutButton').addEventListener('click', async () => {
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