-- Dummy data for WrenchFlow
-- Shops
INSERT INTO shops (shop_id, shop_name, subscription_status, billing_email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ace Small Engine', 'active', 'ace@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'PowerPro Repair', 'trial', 'powerpro@example.com');

-- Platform Users
INSERT INTO platform_users (platform_user_id, username, password_hash, role, email) VALUES
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'superadmin', '$2y$10$superadminhash', 'super_admin', 'admin@wrenchflow.com'),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'platformemp', '$2y$10$platformemphash', 'platform_employee', 'emp@wrenchflow.com');

-- Shop Users
INSERT INTO shop_users (shop_user_id, shop_id, username, password_hash, role, first_name, last_name, email, selected_theme_id) VALUES
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', 'aceadmin', '$2y$10$aceadminhash', 'admin', 'Alice', 'Smith', 'alice@ace.com', NULL),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', 'poweradmin', '$2y$10$poweradminhash', 'admin', 'Bob', 'Jones', 'bob@powerpro.com', NULL);

-- Themes
INSERT INTO themes (theme_id, theme_name, config_json) VALUES
  ('theme-001-0000-0000-0000-theme000001', 'Light', '{"primary":"#1976d2","secondary":"#fff","background":"#f5f5f5","font":"Roboto,Arial,sans-serif"}'),
  ('theme-002-0000-0000-0000-theme000002', 'Dark', '{"primary":"#222","secondary":"#90caf9","background":"#121212","font":"Roboto,Arial,sans-serif"}'),
  ('theme-003-0000-0000-0000-theme000003', 'Green Shop', '{"primary":"#388e3c","secondary":"#fff","background":"#e8f5e9","font":"Roboto,Arial,sans-serif"}');

-- Customers
INSERT INTO customers (customer_id, shop_id, first_name, last_name, phone_number, email, address) VALUES
  ('cust-1111-0000-0000-0000-cust000001', '11111111-1111-1111-1111-111111111111', 'John', 'Doe', '555-1234', 'john.doe@example.com', '123 Main St'),
  ('cust-2222-0000-0000-0000-cust000002', '22222222-2222-2222-2222-222222222222', 'Jane', 'Roe', '555-5678', 'jane.roe@example.com', '456 Oak Ave');

-- Equipment
INSERT INTO equipment (equipment_id, shop_id, customer_id, unit_type, make, model_number, serial_number, purchase_date, notes) VALUES
  ('eq-1111-0000-0000-0000-eq00000001', '11111111-1111-1111-1111-111111111111', 'cust-1111-0000-0000-0000-cust000001', 'Lawnmower', 'Honda', 'HRX217', 'SN12345', '2022-04-01', 'Needs blade sharpening'),
  ('eq-2222-0000-0000-0000-eq00000002', '22222222-2222-2222-2222-222222222222', 'cust-2222-0000-0000-0000-cust000002', 'Snowblower', 'Toro', 'PowerMax', 'SN67890', '2023-01-15', 'Annual service');

-- Vendors
INSERT INTO vendors (vendor_id, shop_id, vendor_name, contact_person, phone_number, email, address, notes) VALUES
  ('vend-1111-0000-0000-0000-vend000001', '11111111-1111-1111-1111-111111111111', 'PartsCo', 'Sam Vendor', '555-1111', 'sam@partsco.com', '789 Parts Rd', 'Main supplier'),
  ('vend-2222-0000-0000-0000-vend000002', '22222222-2222-2222-2222-222222222222', 'EquipMart', 'Sue Equip', '555-2222', 'sue@equipmart.com', '321 Equip Ave', 'Bulk fluids');

-- Parts
INSERT INTO parts (part_id, shop_id, part_name, part_number, description, cost_price, sale_price, quantity_on_hand, minimum_stock_level, bin_location, is_bulk) VALUES
  ('part-1111-0000-0000-0000-part000001', '11111111-1111-1111-1111-111111111111', 'Air Filter', 'AF-100', 'Standard air filter', 5.00, 9.99, 20, 5, 'A1', 0),
  ('part-2222-0000-0000-0000-part000002', '22222222-2222-2222-2222-222222222222', 'Engine Oil 10W-30', 'EO-10W30', 'Bulk engine oil', 50.00, 0.00, 20, 5, 'B2', 1);

-- Part-Vendor Relations
INSERT INTO part_vendor_relations (part_id, vendor_id) VALUES
  ('part-1111-0000-0000-0000-part000001', 'vend-1111-0000-0000-0000-vend000001'),
  ('part-2222-0000-0000-0000-part000002', 'vend-2222-0000-0000-0000-vend000002');
