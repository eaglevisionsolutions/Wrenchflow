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