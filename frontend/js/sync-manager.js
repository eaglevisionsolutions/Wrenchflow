// sync-manager.js
// Offline sync logic for WrenchFlow
import { apiRequest } from './api-service.js';

const SYNC_QUEUE_KEY = 'wrenchflow_sync_queue';

function getQueue() {
  return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
}
function setQueue(queue) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}
export function queueSync(resource, method, data) {
  const queue = getQueue();
  queue.push({ resource, method, data, timestamp: Date.now() });
  setQueue(queue);
}
export async function processSyncQueue() {
  const queue = getQueue();
  for (let i = 0; i < queue.length; i++) {
    const { resource, method, data } = queue[i];
    try {
      await apiRequest(resource, method, data);
      queue.splice(i, 1); i--;
    } catch (e) {
      if (e && e.conflict) {
        // Show conflict modal and wait for user resolution
        if (window.showSyncConflictModal) {
          await window.showSyncConflictModal(queue[i], e.serverData);
        }
      }
      break;
    }
  }
  setQueue(queue);
}
window.addEventListener('online', processSyncQueue);
export function isOnline() {
  return navigator.onLine;
}

// Expose for UI
window.getSyncQueue = getQueue;
window.setSyncQueue = setQueue;
