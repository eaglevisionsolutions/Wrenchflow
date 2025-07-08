-- Dummy data for WrenchFlow
-- Shops
INSERT INTO shops (shop_id, shop_name, subscription_status, billing_email) VALUES
  (1, 'Ace Small Engine', 'active', 'ace@example.com'),
  (2, 'PowerPro Repair', 'trial', 'powerpro@example.com');

-- Platform Users
INSERT INTO platform_users (platform_user_id, username, password_hash, role, email) VALUES
  (1, 'superadmin', '$2y$10$superadminhash', 'super_admin', 'admin@wrenchflow.com'),
  (2, 'platformemp', '$2y$10$platformemphash', 'platform_employee', 'emp@wrenchflow.com');

-- Shop Users
INSERT INTO shop_users (shop_user_id, shop_id, username, password_hash, role, first_name, last_name, email, selected_theme_id) VALUES
  (1, 1, 'aceadmin', '$2y$10$aceadminhash', 'admin', 'Alice', 'Smith', 'alice@ace.com', NULL),
  (2, 2, 'poweradmin', '$2y$10$poweradminhash', 'admin', 'Bob', 'Jones', 'bob@powerpro.com', NULL);

-- Themes
INSERT INTO themes (theme_id, theme_name, config_json) VALUES
  (1, 'Light', '{"primary":"#1976d2","secondary":"#fff","background":"#f5f5f5","font":"Roboto,Arial,sans-serif"}'),
  (2, 'Dark', '{"primary":"#222","secondary":"#90caf9","background":"#121212","font":"Roboto,Arial,sans-serif"}'),
  (3, 'Green Shop', '{"primary":"#388e3c","secondary":"#fff","background":"#e8f5e9","font":"Roboto,Arial,sans-serif"}');

-- Customers
INSERT INTO customers (customer_id, shop_id, first_name, last_name, phone_number, email, address) VALUES
  (1, 1, 'John', 'Doe', '555-1234', 'john.doe@example.com', '123 Main St'),
  (2, 2, 'Jane', 'Roe', '555-5678', 'jane.roe@example.com', '456 Oak Ave');

-- Equipment
INSERT INTO equipment (equipment_id, shop_id, customer_id, unit_type, make, model_number, serial_number, purchase_date, notes) VALUES
  (1, 1, 1, 'Lawnmower', 'Honda', 'HRX217', 'SN12345', '2022-04-01', 'Needs blade sharpening'),
  (2, 2, 2, 'Snowblower', 'Toro', 'PowerMax', 'SN67890', '2023-01-15', 'Annual service');

-- Vendors
INSERT INTO vendors (vendor_id, shop_id, vendor_name, contact_person, phone_number, email, address, notes) VALUES
  (1, 1, 'PartsCo', 'Sam Vendor', '555-1111', 'sam@partsco.com', '789 Parts Rd', 'Main supplier'),
  (2, 2, 'EquipMart', 'Sue Equip', '555-2222', 'sue@equipmart.com', '321 Equip Ave', 'Bulk fluids');

-- Parts
INSERT INTO parts (part_id, shop_id, part_name, part_number, description, cost_price, sale_price, quantity_on_hand, minimum_stock_level, bin_location, is_bulk) VALUES
  (1, 1, 'Air Filter', 'AF-100', 'Standard air filter', 5.00, 9.99, 20, 5, 'A1', 0),
  (2, 2, 'Engine Oil 10W-30', 'EO-10W30', 'Bulk engine oil', 50.00, 0.00, 20, 5, 'B2', 1);

-- Part-Vendor Relations
INSERT INTO part_vendor_relations (part_id, vendor_id) VALUES
  (1, 1),
  (2, 2);
