USE hockeytuned_wrenchflow;

-- Shops
INSERT INTO shops (shop_name) VALUES ('Downtown Auto'), ('Uptown Garage');

-- Platform Users
INSERT INTO platform_users (username, email) VALUES
('admin', 'admin@platform.com'),
('jane', 'jane@platform.com');

-- Vendors
INSERT INTO vendors (vendor_name) VALUES ('PartsCo'), ('AutoSupplies');

-- Parts
INSERT INTO parts (part_name) VALUES ('Oil Filter'), ('Brake Pad'), ('Air Filter');

-- Customers
INSERT INTO customers (customer_name) VALUES ('John Doe'), ('Mary Smith');

-- Equipment
INSERT INTO equipment (equipment_name) VALUES ('Toyota Camry'), ('Ford F-150');

-- Themes
INSERT INTO themes (theme_name, theme_config) VALUES
('Light', '{"color":"#fff"}'),
('Dark', '{"color":"#222"}');

-- Shop Users
INSERT INTO shop_users (shop_id, user_id, selected_theme_id) VALUES
(1, 1, 1),
(2, 2, 2);

-- Users (shop staff)
INSERT INTO users (shop_id, email, password_hash, role) VALUES
(1, 'owner@downtown.com', '$2y$10$abcdefghijklmnopqrstuv', 'Shop Administrator'),
(2, 'tech@uptown.com', '$2y$10$abcdefghijklmnopqrstuv', 'Service Employee');

-- Part Vendor Relations
INSERT INTO part_vendor_relations (shop_id, part_id, vendor_id) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1);

-- Work Orders
INSERT INTO work_orders (shop_id, customer_id, vehicle_id, order_date, status) VALUES
(1, 1, 1, '2024-06-01', 'open'),
(2, 2, 2, '2024-06-02', 'completed');

-- Work Order Parts
INSERT INTO work_order_parts (shop_id, work_order_id, part_id, quantity_used, volume_used) VALUES
(1, 1, 1, 1, 0.5),
(2, 2, 2, 2, 1.0);

-- Work Order Services
INSERT INTO work_order_services (shop_id, work_order_id, service_name, service_cost) VALUES
(1, 1, 'Oil Change', 49.99),
(2, 2, 'Brake Replacement', 199.99);

-- Appointments
INSERT INTO appointments (shop_id, customer_id, equipment_id, appointment_date, appointment_time, status) VALUES
(1, 1, 1, '2024-06-10', '09:00:00', 'scheduled'),
(2, 2, 2, '2024-06-11', '14:00:00', 'completed');

-- Sales
INSERT INTO sales (shop_id, customer_id, sale_date, total_amount) VALUES
(1, 1, '2024-06-05', 150.00),
(2, 2, '2024-06-06', 300.00);

-- Sale Line Items
INSERT INTO sale_line_items (sale_id, part_id, quantity_sold, sale_price) VALUES
(1, 1, 2, 25.00),
(1, 2, 1, 100.00),
(2, 3, 3, 50.00);