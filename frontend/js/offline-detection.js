// offline-detection.js
window.addEventListener('online', () => {
  console.log('You are online.');
  // Trigger sync logic here
});
window.addEventListener('offline', () => {
  console.log('You are offline.');
  // Optionally update UI to reflect offline status
});
