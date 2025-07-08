CREATE DATABASE IF NOT EXISTS hockeytuned_wrenchflow;
USE hockeytuned_wrenchflow;

CREATE TABLE IF NOT EXISTS shops (
    shop_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_users (
    shop_user_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    user_id INT NOT NULL,
    selected_theme_id INT,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (user_id) REFERENCES platform_users(user_id)
);

CREATE TABLE IF NOT EXISTS vendors (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS parts (
    part_id INT AUTO_INCREMENT PRIMARY KEY,
    part_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS part_vendor_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    part_id INT NOT NULL,
    vendor_id INT NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
    UNIQUE (shop_id, part_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    order_date DATE NOT NULL,
    status ENUM('open', 'in_progress', 'completed', 'cancelled') NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (vehicle_id) REFERENCES equipment(equipment_id)
);

CREATE TABLE IF NOT EXISTS work_order_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    work_order_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity_used INT DEFAULT 0,
    volume_used DECIMAL(10, 2) DEFAULT 0.0,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

CREATE TABLE IF NOT EXISTS work_order_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    work_order_id INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_cost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
);

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    customer_id INT NOT NULL,
    equipment_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Shop Administrator', 'Parts Employee', 'Service Employee', 'Super Admin', 'Platform Employee') NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    customer_id INT DEFAULT NULL,
    sale_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS sale_line_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity_sold INT NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

CREATE TABLE IF NOT EXISTS themes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    theme_name VARCHAR(255) NOT NULL,
    theme_config JSON NOT NULL
);

-- Remove these ALTER TABLE statements for compatibility with most MySQL versions
-- ALTER TABLE shop_users ADD COLUMN IF NOT EXISTS selected_theme_id INT DEFAULT NULL;
-- ALTER TABLE shop_users ADD CONSTRAINT IF NOT EXISTS fk_selected_theme FOREIGN KEY (selected_theme_id) REFERENCES themes(id) ON DELETE SET NULL;

-- Remove this index, as themes table does not have shop_id
-- CREATE INDEX idx_shop_id ON themes (shop_id);
CREATE INDEX idx_sale_date ON sales (sale_date);