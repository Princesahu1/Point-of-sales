package com.pos.controller;

import com.pos.dto.AlertDTO;
import com.pos.dto.InventoryDTO;
import com.pos.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryDTO>> getInventory() {
        return ResponseEntity.ok(inventoryService.getInventory());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryDTO> getInventoryByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<InventoryDTO> updateStock(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryDTO inventoryDTO) {
        return ResponseEntity.ok(inventoryService.updateStock(productId, inventoryDTO));
    }

    @GetMapping("/below-threshold")
    public ResponseEntity<List<InventoryDTO>> getItemsBelowThreshold() {
        return ResponseEntity.ok(inventoryService.getItemsBelowThreshold());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<AlertDTO>> getUnresolvedAlerts() {
        return ResponseEntity.ok(inventoryService.getUnresolvedAlerts());
    }

    @PutMapping("/alerts/{id}/resolve")
    public ResponseEntity<AlertDTO> resolveAlert(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.resolveAlert(id));
    }
}
