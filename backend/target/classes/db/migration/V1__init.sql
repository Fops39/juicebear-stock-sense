CREATE TABLE users (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	username VARCHAR(100) NOT NULL UNIQUE,
	email VARCHAR(150) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	role VARCHAR(40) NOT NULL,
	active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE warehouses (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(120) NOT NULL UNIQUE,
	location VARCHAR(255),
	type VARCHAR(40) NOT NULL
);

CREATE TABLE products (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	sku VARCHAR(150) NOT NULL UNIQUE,
	name VARCHAR(200) NOT NULL,
	category VARCHAR(40) NOT NULL,
	active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE inventory_items (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	warehouse_id BIGINT NOT NULL,
	product_id BIGINT NOT NULL,
	quantity INT NOT NULL,
	UNIQUE KEY uq_inventory_warehouse_product (warehouse_id, product_id),
	CONSTRAINT fk_inventory_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
	CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE orders (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	type VARCHAR(40) NOT NULL,
	status VARCHAR(40) NOT NULL,
	source_warehouse_id BIGINT NULL,
	destination_warehouse_id BIGINT NULL,
	created_by_user_id BIGINT NOT NULL,
	approved_by_user_id BIGINT NULL,
	created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
	approved_at TIMESTAMP(6) NULL,
	completed_at TIMESTAMP(6) NULL,
	CONSTRAINT fk_orders_source_warehouse FOREIGN KEY (source_warehouse_id) REFERENCES warehouses(id),
	CONSTRAINT fk_orders_destination_warehouse FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses(id),
	CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id),
	CONSTRAINT fk_orders_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	order_id BIGINT NOT NULL,
	product_id BIGINT NOT NULL,
	quantity INT NOT NULL,
	CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
	CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);