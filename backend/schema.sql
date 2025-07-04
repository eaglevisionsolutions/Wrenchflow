-- WrenchFlow MySQL Schema
-- Shops
CREATE TABLE IF NOT EXISTS shops (
    shop_id CHAR(36) PRIMARY KEY,
    shop_name VARCHAR(100) NOT NULL,
    subscription_status ENUM('active','inactive','trial') NOT NULL DEFAULT 'trial',
    billing_email VARCHAR(255) NOT NULL
);
-- Themes
CREATE TABLE IF NOT EXISTS themes (
    theme_id CHAR(36) PRIMARY KEY,
    theme_name VARCHAR(50) NOT NULL,
    config_json JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Platform Users
CREATE TABLE IF NOT EXISTS platform_users (
    platform_user_id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin','platform_employee') NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Shop Users
CREATE TABLE IF NOT EXISTS shop_users (
    shop_user_id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','manager','technician','parts_manager','service_manager','employee') NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    selected_theme_id CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (selected_theme_id) REFERENCES themes(theme_id)
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    unit_type VARCHAR(30) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model_number VARCHAR(50) NOT NULL,
    serial_number VARCHAR(50) NOT NULL,
    purchase_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, serial_number),
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Parts
CREATE TABLE IF NOT EXISTS parts (
    part_id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    part_name VARCHAR(100) NOT NULL,
    part_number VARCHAR(50) NOT NULL,
    description TEXT,
    cost_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    quantity_on_hand INT NOT NULL,
    minimum_stock_level INT,
    bin_location VARCHAR(50),
    is_bulk BOOLEAN DEFAULT 0,
    bulk_unit_measure VARCHAR(20),
    bulk_total_cost_delivery DECIMAL(10,2),
    bulk_total_volume_delivered DECIMAL(10,2),
    bulk_markup_percentage DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, part_number),
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    vendor_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, vendor_name),
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- Part-Vendor Relations (Many-to-Many)
CREATE TABLE IF NOT EXISTS part_vendor_relations (
    part_id CHAR(36) NOT NULL,
    vendor_id CHAR(36) NOT NULL,
    PRIMARY KEY (part_id, vendor_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);

-- Parts Orders
CREATE TABLE IF NOT EXISTS parts_orders (
    order_id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    vendor_id CHAR(36) NOT NULL,
    order_status ENUM('Draft','Ordered','Partially Received','Received','Canceled') NOT NULL DEFAULT 'Draft',
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);

-- Parts Order Line Items
CREATE TABLE IF NOT EXISTS parts_order_line_items (
    line_item_id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    part_id CHAR(36),
    ordered_quantity INT NOT NULL,
    unit_cost_at_order DECIMAL(10,2) NOT NULL,
    is_new_part BOOLEAN DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES parts_orders(order_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

-- Parts Order Receipts
CREATE TABLE IF NOT EXISTS parts_order_receipts (
    receipt_id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    line_item_id CHAR(36) NOT NULL,
    received_quantity INT NOT NULL,
    vendor_invoice_number VARCHAR(100) NOT NULL,
    actual_cost_per_unit DECIMAL(10,2) NOT NULL,
    is_backordered BOOLEAN DEFAULT 0,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES parts_orders(order_id),
    FOREIGN KEY (line_item_id) REFERENCES parts_order_line_items(line_item_id)
);

-- Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
    work_order_id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    equipment_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Open','In Progress','Ready for Pickup','Completed','Canceled') NOT NULL DEFAULT 'Open',
    reported_problem TEXT NOT NULL,
    diagnosis TEXT,
    repair_notes TEXT,
    technician_id CHAR(36),
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (technician_id) REFERENCES shop_users(shop_user_id)
);

-- Work Order Parts
CREATE TABLE IF NOT EXISTS work_order_parts (
    work_order_part_id CHAR(36) PRIMARY KEY,
    work_order_id CHAR(36) NOT NULL,
    part_id CHAR(36) NOT NULL,
    quantity_used DECIMAL(10,2) NOT NULL,
    is_bulk BOOLEAN DEFAULT 0,
    volume_used DECIMAL(10,2),
    sale_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

-- Work Order Services
CREATE TABLE IF NOT EXISTS work_order_services (
    work_order_service_id CHAR(36) PRIMARY KEY,
    work_order_id CHAR(36) NOT NULL,
    service_description TEXT NOT NULL,
    hours_spent DECIMAL(5,2) NOT NULL,
    labour_rate_at_time DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id)
);

-- Employees (Shop Users Table is used for employees)
-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    equipment_id CHAR(36),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    notes TEXT,
    status ENUM('Scheduled','Confirmed','Completed','Canceled') NOT NULL DEFAULT 'Scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
);

-- Sales (Over-the-Counter)
CREATE TABLE IF NOT EXISTS sales (
    sale_id CHAR(36) PRIMARY KEY,
    shop_id CHAR(36) NOT NULL,
    customer_id CHAR(36),
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_sale_amount DECIMAL(10,2) NOT NULL,
    total_cost_of_goods_sold DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Sale Line Items
CREATE TABLE IF NOT EXISTS sale_line_items (
    sale_line_item_id CHAR(36) PRIMARY KEY,
    sale_id CHAR(36) NOT NULL,
    part_id CHAR(36) NOT NULL,
    quantity_sold DECIMAL(10,2) NOT NULL,
    is_bulk BOOLEAN DEFAULT 0,
    volume_sold DECIMAL(10,2),
    sale_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

-- Shop Settings
CREATE TABLE IF NOT EXISTS shop_settings (
    shop_id CHAR(36) PRIMARY KEY,
    shop_labour_rate DECIMAL(10,2) NOT NULL DEFAULT 75.00,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);
