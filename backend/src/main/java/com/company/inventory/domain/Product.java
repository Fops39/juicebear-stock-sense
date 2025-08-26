package com.company.inventory.domain;

import com.company.inventory.domain.enums.ProductCategory;
import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 150)
	private String sku;

	@Column(nullable = false, length = 200)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private ProductCategory category;

	@Column(nullable = false)
	private boolean active = true;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getSku() { return sku; }
	public void setSku(String sku) { this.sku = sku; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public ProductCategory getCategory() { return category; }
	public void setCategory(ProductCategory category) { this.category = category; }
	public boolean isActive() { return active; }
	public void setActive(boolean active) { this.active = active; }
}