// shop-settings.js - Handles Shop Settings page logic
import * as WrenchFlowAPI from './api-service.js';

const form = document.getElementById('shop-settings-form');
const msgDiv = document.getElementById('settings-message');
const shopId = JSON.parse(localStorage.getItem('wf_user') || '{}').shop_id;

function showMessage(msg, type = 'success') {
  msgDiv.textContent = msg;
  msgDiv.className = 'mt-3 alert alert-' + type;
}

async function loadSettings() {
  if (!shopId) return;
  try {
    const res = await fetch(`/api/shop_settings?shop_id=${shopId}`);
    if (!res.ok) throw new Error('Failed to load settings');
    const data = await res.json();
    if (data) {
      document.getElementById('retail_labour_rate').value = data.retail_labour_rate || '';
      document.getElementById('internal_labour_rate').value = data.internal_labour_rate || '';
      document.getElementById('warranty_labour_rate').value = data.warranty_labour_rate || '';
    }
  } catch (e) {
    showMessage(e.message, 'danger');
  }
}

form.onsubmit = async function(e) {
  e.preventDefault();
  if (!shopId) return;
  const payload = {
    shop_id: shopId,
    retail_labour_rate: parseFloat(document.getElementById('retail_labour_rate').value),
    internal_labour_rate: parseFloat(document.getElementById('internal_labour_rate').value),
    warranty_labour_rate: parseFloat(document.getElementById('warranty_labour_rate').value)
  };
  try {
    const res = await fetch('/api/shop_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save settings');
    showMessage('Settings saved!', 'success');
  } catch (e) {
    showMessage(e.message, 'danger');
  }
};

loadSettings();
