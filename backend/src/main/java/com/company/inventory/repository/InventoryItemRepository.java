package com.company.inventory.repository;

import com.company.inventory.domain.InventoryItem;
import com.company.inventory.domain.Product;
import com.company.inventory.domain.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
	Optional<InventoryItem> findByWarehouseAndProduct(Warehouse warehouse, Product product);
	List<InventoryItem> findByWarehouse(Warehouse warehouse);
}