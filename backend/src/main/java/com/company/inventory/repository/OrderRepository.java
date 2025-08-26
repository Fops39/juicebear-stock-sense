package com.company.inventory.repository;

import com.company.inventory.domain.Order;
import com.company.inventory.domain.enums.OrderStatus;
import com.company.inventory.domain.enums.OrderType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
	List<Order> findByTypeAndCreatedAtBetween(OrderType type, Instant start, Instant end);
	long countByStatus(OrderStatus status);
}