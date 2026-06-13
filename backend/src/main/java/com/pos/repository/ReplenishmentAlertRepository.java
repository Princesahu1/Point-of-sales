package com.pos.repository;

import com.pos.model.ReplenishmentAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReplenishmentAlertRepository extends JpaRepository<ReplenishmentAlert, Long> {

    List<ReplenishmentAlert> findByResolvedFalse();

    boolean existsByInventoryItemIdAndResolvedFalse(Long inventoryItemId);
}
