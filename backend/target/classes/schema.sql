-- ============================================================
-- POS & Inventory Management System — Schema
-- MySQL DDL (compatible with MySQL 8.0+)
-- ============================================================

-- ========================
-- Users Table
-- ========================
CREATE TABLE IF NOT EXISTS users (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    username         VARCHAR(100) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    role             ENUM('CASHIER','STORE_MANAGER','INVENTORY_CLERK','BUSINESS_ANALYST','ADMIN') NOT NULL,
    email            VARCHAR(150),
    approved         BOOLEAN NOT NULL DEFAULT FALSE,
    approved_at      DATETIME,
    rejection_reason VARCHAR(255),
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- Products Table
-- ========================
CREATE TABLE IF NOT EXISTS products (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(200)   NOT NULL,
    barcode    VARCHAR(100)   NOT NULL UNIQUE,
    category   VARCHAR(100),
    price      DECIMAL(10,2)  NOT NULL,
    tax_rate   DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
    created_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_price     CHECK (price >= 0),
    CONSTRAINT chk_tax_rate  CHECK (tax_rate >= 0)
);

-- ========================
-- Inventory Items Table
-- ========================
CREATE TABLE IF NOT EXISTS inventory_items (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id         BIGINT  NOT NULL UNIQUE,
    quantity_on_hand   INT     NOT NULL DEFAULT 0,
    reorder_threshold  INT     NOT NULL DEFAULT 10,
    last_updated       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_qty_on_hand      CHECK (quantity_on_hand >= 0),
    CONSTRAINT chk_reorder_threshold CHECK (reorder_threshold >= 0),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ========================
-- Sales Table
-- ========================
CREATE TABLE IF NOT EXISTS sales (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    cashier_id     BIGINT         NOT NULL,
    total_amount   DECIMAL(12,2)  NOT NULL,
    payment_method ENUM('CASH','CARD','UPI') NOT NULL,
    status         ENUM('COMPLETED','REFUNDED') NOT NULL DEFAULT 'COMPLETED',
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_total_amount CHECK (total_amount >= 0),
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);

-- ========================
-- Sale Items Table
-- ========================
CREATE TABLE IF NOT EXISTS sale_items (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id    BIGINT        NOT NULL,
    product_id BIGINT        NOT NULL,
    quantity   INT           NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal   DECIMAL(12,2) NOT NULL,
    CONSTRAINT chk_quantity   CHECK (quantity > 0),
    CONSTRAINT chk_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_subtotal   CHECK (subtotal >= 0),
    FOREIGN KEY (sale_id)    REFERENCES sales(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ========================
-- Replenishment Alerts Table
-- ========================
CREATE TABLE IF NOT EXISTS replenishment_alerts (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    inventory_item_id BIGINT   NOT NULL,
    alerted_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved          TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- ========================
-- Audit Logs Table
-- ========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    action       VARCHAR(200) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(100) NOT NULL,
    entity_id    BIGINT,
    timestamp    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- Indexes for Performance
-- ========================
-- CREATE INDEX IF NOT EXISTS idx_products_barcode    ON products(barcode);
-- CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
-- CREATE INDEX IF NOT EXISTS idx_sales_cashier_id    ON sales(cashier_id);
-- CREATE INDEX IF NOT EXISTS idx_sales_created_at    ON sales(created_at);
-- CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id  ON sale_items(sale_id);
-- CREATE INDEX IF NOT EXISTS idx_alerts_resolved     ON replenishment_alerts(resolved);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_entity   ON audit_logs(entity_type, entity_id);
