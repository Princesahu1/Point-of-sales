package com.pos.service;

import com.pos.dto.AlertDTO;
import com.pos.dto.InventoryDTO;

import java.util.List;

public interface InventoryService {

    List<InventoryDTO> getInventory();

    InventoryDTO getInventoryByProductId(Long productId);

    InventoryDTO updateStock(Long productId, InventoryDTO inventoryDTO);

    List<InventoryDTO> getItemsBelowThreshold();

    List<AlertDTO> getUnresolvedAlerts();

    AlertDTO resolveAlert(Long alertId);
}
