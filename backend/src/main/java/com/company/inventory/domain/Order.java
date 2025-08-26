package com.company.inventory.domain;

import com.company.inventory.domain.enums.OrderStatus;
import com.company.inventory.domain.enums.OrderType;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private OrderType type;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private OrderStatus status = OrderStatus.PENDING;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "source_warehouse_id")
	private Warehouse sourceWarehouse;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "destination_warehouse_id")
	private Warehouse destinationWarehouse;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "created_by_user_id")
	private User createdBy;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "approved_by_user_id")
	private User approvedBy;

	@Column(nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	private Instant approvedAt;
	private Instant completedAt;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<OrderItem> items = new ArrayList<>();

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public OrderType getType() { return type; }
	public void setType(OrderType type) { this.type = type; }
	public OrderStatus getStatus() { return status; }
	public void setStatus(OrderStatus status) { this.status = status; }
	public Warehouse getSourceWarehouse() { return sourceWarehouse; }
	public void setSourceWarehouse(Warehouse sourceWarehouse) { this.sourceWarehouse = sourceWarehouse; }
	public Warehouse getDestinationWarehouse() { return destinationWarehouse; }
	public void setDestinationWarehouse(Warehouse destinationWarehouse) { this.destinationWarehouse = destinationWarehouse; }
	public User getCreatedBy() { return createdBy; }
	public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
	public User getApprovedBy() { return approvedBy; }
	public void setApprovedBy(User approvedBy) { this.approvedBy = approvedBy; }
	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
	public Instant getApprovedAt() { return approvedAt; }
	public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
	public Instant getCompletedAt() { return completedAt; }
	public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
	public List<OrderItem> getItems() { return items; }
	public void setItems(List<OrderItem> items) { this.items = items; }
}