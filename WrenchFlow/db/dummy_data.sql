-- Insert dummy data into the shops table
INSERT INTO shops (id, name, address) VALUES
(1, 'AutoFix Garage', '123 Main St, Springfield'),
(2, 'Speedy Repairs', '456 Elm St, Shelbyville');

-- Insert dummy data into the platform_users table
INSERT INTO platform_users (id, username, password, role) VALUES
(1, 'platform_admin', 'hashed_password_1', 'admin'),
(2, 'shop_admin_1', 'hashed_password_2', 'shop_admin'),
(3, 'shop_admin_2', 'hashed_password_3', 'shop_admin'),
(4, 'employee_1', 'hashed_password_4', 'employee'),
(5, 'employee_2', 'hashed_password_5', 'employee'),
(6, 'employee_3', 'hashed_password_6', 'employee');

-- Insert dummy data into the shop_users table
INSERT INTO shop_users (id, shop_id, user_id, role) VALUES
(1, 1, 2, 'admin'), -- shop_admin_1 is the admin of AutoFix Garage
(2, 1, 4, 'employee'), -- employee_1 works at AutoFix Garage
(3, 1, 5, 'employee'), -- employee_2 works at AutoFix Garage
(4, 2, 3, 'admin'), -- shop_admin_2 is the admin of Speedy Repairs
(5, 2, 6, 'employee'); -- employee_3 works at Speedy Repairs