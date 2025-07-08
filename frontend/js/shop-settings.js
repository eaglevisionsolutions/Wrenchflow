// shop-settings.js - Handles Shop Settings page logic
import * as  WrenchflowUI from './ui-components.js';
import * as WrenchFlowAPI from './api-service.js';

const wfUser = JSON.parse(localStorage.getItem('wf_user') || '{}');
const isShopAdmin = wfUser && (wfUser.role === 'admin' || wfUser.is_shop_admin);


const form = document.getElementById('shop-settings-form');
const msgDiv = document.getElementById('settings-message');
const shopId = wfUser.shop_id;
const shopInfoSection = document.getElementById('shop-info-section');

let settingsExist = false;


async function loadSettings() {
  if (!shopId) return;
  try {
    // Load shop info if admin
    if (isShopAdmin && shopInfoSection) {
      shopInfoSection.style.display = '';
      const shop = await WrenchFlowAPI.getShopById(shopId);
      if (shop) {
        document.getElementById('shop_name').value = shop.shop_name || '';
        document.getElementById('subscription_status').value = shop.subscription_status || '';
        document.getElementById('billing_email').value = shop.billing_email || '';
      }
    }
    // Load shop settings
    const settingsArr = await WrenchFlowAPI.getShopSettings(shopId);
    const data = Array.isArray(settingsArr) ? settingsArr[0] : settingsArr;
    if (data) {
      settingsExist = true;
      document.getElementById('retail_labour_rate').value = data.retail_labour_rate || '';
      document.getElementById('internal_labour_rate').value = data.internal_labour_rate || '';
      document.getElementById('warranty_labour_rate').value = data.warranty_labour_rate || '';
    } else {
      settingsExist = false;
    }
  } catch (e) {
    WrenchflowUI.showMessage(e.message, 'danger');
  }
}


form.onsubmit = async function(e) {
  e.preventDefault();
  if (!shopId) return;
  let shopInfoPayload = null;
  if (isShopAdmin && shopInfoSection) {
    shopInfoPayload = {
      shop_id: shopId,
      shop_name: document.getElementById('shop_name').value,
      billing_email: document.getElementById('billing_email').value
      // subscription_status is not editable
    };
  }
  const payload = {
    shop_id: shopId,
    retail_labour_rate: parseFloat(document.getElementById('retail_labour_rate').value),
    internal_labour_rate: parseFloat(document.getElementById('internal_labour_rate').value),
    warranty_labour_rate: parseFloat(document.getElementById('warranty_labour_rate').value)
  };
  try {
    // Save shop info if admin
    if (shopInfoPayload) {
      await WrenchFlowAPI.updateShop(shopInfoPayload);
    }
    // Save shop settings
    if (settingsExist) {
      await WrenchFlowAPI.updateShopSettings(payload);
      WrenchflowUI.showMessage('Settings updated!', 'success');
    } else {
      await WrenchFlowAPI.createShopSettings(payload);
      WrenchflowUI.showMessage('Settings saved!', 'success');
      settingsExist = true;
    }
  } catch (e) {
    WrenchflowUI.showMessage(e.message, 'danger');
  }
};

loadSettings();
