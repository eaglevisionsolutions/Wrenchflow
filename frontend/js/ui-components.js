// Modal for sync conflict resolution
export function showSyncConflictModal(queueItem, serverData) {
  return new Promise((resolve) => {
    let modal = document.getElementById('sync-conflict-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sync-conflict-modal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.5)';
      modal.style.zIndex = '10000';
      modal.innerHTML = `<div style="background:#fff;max-width:500px;margin:10vh auto;padding:2em;border-radius:8px;box-shadow:0 2px 16px #0003;">
        <h4>Sync Conflict</h4>
        <div id="conflict-details"></div>
        <div class="mt-3 d-flex justify-content-end">
          <button id="conflict-keep-local" class="btn btn-primary me-2">Keep My Change</button>
          <button id="conflict-keep-server" class="btn btn-secondary">Use Server</button>
        </div>
      </div>`;
      document.body.appendChild(modal);
    }
    // Show details
    const details = modal.querySelector('#conflict-details');
    details.innerHTML = `<pre style='max-height:200px;overflow:auto;'>Your Change:\n${JSON.stringify(queueItem.data, null, 2)}\n\nServer Version:\n${JSON.stringify(serverData, null, 2)}</pre>`;
    modal.style.display = 'block';
    modal.querySelector('#conflict-keep-local').onclick = () => {
      modal.style.display = 'none';
      resolve('local');
    };
    modal.querySelector('#conflict-keep-server').onclick = () => {
      modal.style.display = 'none';
      resolve('server');
    };
  });
}
window.showSyncConflictModal = showSyncConflictModal;
// ui-components.js
// Basic UI rendering helpers for WrenchFlow

export function renderTable(container, data, columns, opts = {}) {
  // Search/filter bar
  let filter = '';
  if (opts.filter !== undefined) filter = opts.filter;
  const searchDiv = document.createElement('div');
  searchDiv.className = 'mb-2';
  searchDiv.innerHTML = `<input type="text" class="form-control" placeholder="Search..." value="${filter}">`;
  let filtered = data;
  if (filter) {
    const f = filter.toLowerCase();
    filtered = data.filter(row => Object.values(row).some(v => (v+"").toLowerCase().includes(f)));
  }
  const table = document.createElement('table');
  table.className = 'table table-striped';
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  filtered.forEach(row => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      if (col.render) {
        td.innerHTML = col.render(row);
      } else {
        td.textContent = row[col.key];
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(searchDiv);
  container.appendChild(table);
  // Search handler
  searchDiv.querySelector('input').oninput = e => {
    opts.onFilter && opts.onFilter(e.target.value);
  };
}

// Offline/Sync status indicator
export function renderStatusBar(container) {
  let bar = document.getElementById('wf-status-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'wf-status-bar';
    bar.style.position = 'fixed';
    bar.style.bottom = '0';
    bar.style.left = '0';
    bar.style.width = '100%';
    bar.style.zIndex = '9999';
    bar.style.background = '#222';
    bar.style.color = '#fff';
    bar.style.padding = '4px 12px';
    bar.style.fontSize = '0.95em';
    document.body.appendChild(bar);
  }
  function updateBar() {
    const online = window.isOnline ? window.isOnline() : navigator.onLine;
    const queue = window.getSyncQueue ? window.getSyncQueue() : (JSON.parse(localStorage.getItem('wrenchflow_sync_queue')||'[]'));
    let msg = online ? 'Online' : 'Offline';
    if (queue && queue.length) {
      msg += ` | Pending Sync: ${queue.length}`;
      bar.style.background = online ? '#fbc02d' : '#b71c1c';
    } else {
      bar.style.background = online ? '#388e3c' : '#b71c1c';
    }
    bar.textContent = msg;
  }
  updateBar();
  window.addEventListener('online', updateBar);
  window.addEventListener('offline', updateBar);
  setInterval(updateBar, 3000);
}

export function showMessage(msg, type = 'info') {
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.textContent = msg;
  document.body.prepend(div);
  setTimeout(() => div.remove(), 3000);
}
