package com.pos.serviceImpl;

import com.pos.dto.AlertDTO;
import com.pos.dto.InventoryDTO;
import com.pos.exception.ResourceNotFoundException;
import com.pos.mapper.AlertMapper;
import com.pos.mapper.InventoryMapper;
import com.pos.model.InventoryItem;
import com.pos.model.ReplenishmentAlert;
import com.pos.repository.InventoryItemRepository;
import com.pos.repository.ReplenishmentAlertRepository;
import com.pos.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final ReplenishmentAlertRepository alertRepository;
    private final InventoryMapper inventoryMapper;
    private final AlertMapper alertMapper;

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getInventory() {
        return inventoryMapper.toDTOList(inventoryItemRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryDTO getInventoryByProductId(Long productId) {
        InventoryItem item = inventoryItemRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for product ID: " + productId));
        return inventoryMapper.toDTO(item);
    }

    @Override
    public InventoryDTO updateStock(Long productId, InventoryDTO inventoryDTO) {
        InventoryItem item = inventoryItemRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for product ID: " + productId));

        item.setQuantityOnHand(inventoryDTO.getQuantityOnHand());
        item.setReorderThreshold(inventoryDTO.getReorderThreshold());

        // Trigger replenishment alert if below threshold
        if (item.getQuantityOnHand() <= item.getReorderThreshold()
                && !alertRepository.existsByInventoryItemIdAndResolvedFalse(item.getId())) {
            ReplenishmentAlert alert = ReplenishmentAlert.builder()
                    .inventoryItem(item)
                    .alertedAt(java.time.LocalDateTime.now())
                    .resolved(false)
                    .build();
            alertRepository.save(alert);
        }

        InventoryItem saved = inventoryItemRepository.save(item);
        return inventoryMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getItemsBelowThreshold() {
        return inventoryMapper.toDTOList(inventoryItemRepository.findItemsBelowReorderThreshold());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlertDTO> getUnresolvedAlerts() {
        return alertMapper.toDTOList(alertRepository.findByResolvedFalse());
    }

    @Override
    public AlertDTO resolveAlert(Long alertId) {
        ReplenishmentAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with ID: " + alertId));
        alert.setResolved(true);
        ReplenishmentAlert saved = alertRepository.save(alert);
        return alertMapper.toDTO(saved);
    }
}
