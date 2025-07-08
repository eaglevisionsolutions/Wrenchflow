// shop-settings.js - Handles Shop Settings page logic
import * as  WrenchflowUI from './ui-components.js';
import * as WrenchFlowAPI from './api-service.js';

const form = document.getElementById('shop-settings-form');
const msgDiv = document.getElementById('settings-message');
const shopId = JSON.parse(localStorage.getItem('wf_user') || '{}').shop_id;

async function loadSettings() {
  if (!shopId) return;
  try {
    const settingsArr = await WrenchFlowAPI.getShopSettings(shopId);
    // getShopSettings returns an array (from getAll), use first if exists
    const data = Array.isArray(settingsArr) ? settingsArr[0] : settingsArr;
    if (data) {
      document.getElementById('retail_labour_rate').value = data.retail_labour_rate || '';
      document.getElementById('internal_labour_rate').value = data.internal_labour_rate || '';
      document.getElementById('warranty_labour_rate').value = data.warranty_labour_rate || '';
    }
  } catch (e) {
    WrenchflowUI.showMessage(e.message, 'danger');
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
    await WrenchFlowAPI.updateShopSettings(payload);
    WrenchflowUI.showMessage('Settings saved!', 'success');
  } catch (e) {
    WrenchflowUI.showMessage(e.message, 'danger');
  }
};

loadSettings();
