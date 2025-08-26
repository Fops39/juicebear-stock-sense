package com.company.inventory.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_items", uniqueConstraints = {
		@UniqueConstraint(name = "uq_inventory_warehouse_product", columnNames = {"warehouse_id", "product_id"})
})
public class InventoryItem {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "warehouse_id")
	private Warehouse warehouse;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id")
	private Product product;

	@Column(nullable = false)
	private int quantity;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public Warehouse getWarehouse() { return warehouse; }
	public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
	public Product getProduct() { return product; }
	public void setProduct(Product product) { this.product = product; }
	public int getQuantity() { return quantity; }
	public void setQuantity(int quantity) { this.quantity = quantity; }
}