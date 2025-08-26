package com.company.inventory.domain;

import com.company.inventory.domain.enums.WarehouseType;
import jakarta.persistence.*;

@Entity
@Table(name = "warehouses")
public class Warehouse {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 120)
	private String name;

	@Column(length = 255)
	private String location;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private WarehouseType type;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }
	public WarehouseType getType() { return type; }
	public void setType(WarehouseType type) { this.type = type; }
}