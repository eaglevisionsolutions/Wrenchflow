CREATE TABLE shops (
    shop_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE platform_users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shop_users (
    shop_user_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    user_id INT NOT NULL,
    selected_theme_id INT,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (user_id) REFERENCES platform_users(user_id)
);
CREATE TABLE part_vendor_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    part_id INT NOT NULL,
    vendor_id INT NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (part_id) REFERENCES parts(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    UNIQUE (shop_id, part_id, vendor_id)
);
CREATE TABLE work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    order_date DATE NOT NULL,
    status ENUM('open', 'in_progress', 'completed', 'cancelled') NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES equipment(id)
);

CREATE TABLE work_order_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    work_order_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity_used INT DEFAULT 0,
    volume_used DECIMAL(10, 2) DEFAULT 0.0,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE TABLE work_order_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    work_order_id INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_cost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
);