package com.pos;

import com.pos.dto.AlertDTO;
import com.pos.dto.InventoryDTO;
import com.pos.exception.ResourceNotFoundException;
import com.pos.mapper.AlertMapper;
import com.pos.mapper.InventoryMapper;
import com.pos.model.InventoryItem;
import com.pos.model.Product;
import com.pos.model.ReplenishmentAlert;
import com.pos.repository.InventoryItemRepository;
import com.pos.repository.ReplenishmentAlertRepository;
import com.pos.serviceImpl.InventoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock private InventoryItemRepository inventoryItemRepository;
    @Mock private ReplenishmentAlertRepository alertRepository;
    @Mock private InventoryMapper inventoryMapper;
    @Mock private AlertMapper alertMapper;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private Product product;
    private InventoryItem inventoryItem;
    private InventoryDTO inventoryDTO;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .name("Samsung USB-C Cable 1m")
                .barcode("BAR-005-USBC1M")
                .price(new BigDecimal("12.99"))
                .taxRate(new BigDecimal("18.00"))
                .build();

        inventoryItem = InventoryItem.builder()
                .id(1L)
                .product(product)
                .quantityOnHand(15)
                .reorderThreshold(10)
                .build();

        inventoryDTO = InventoryDTO.builder()
                .productId(1L)
                .productName("Samsung USB-C Cable 1m")
                .quantityOnHand(8)      // Updated to 8 — below threshold of 10
                .reorderThreshold(10)
                .build();
    }

    @Test
    void updateStock_WhenQuantityDropsBelowThreshold_ShouldTriggerReplenishmentAlert() {
        // Arrange
        when(inventoryItemRepository.findByProductId(1L)).thenReturn(Optional.of(inventoryItem));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(inventoryItem);
        when(alertRepository.existsByInventoryItemIdAndResolvedFalse(1L)).thenReturn(false);

        InventoryDTO responseDTO = InventoryDTO.builder()
                .productId(1L)
                .quantityOnHand(8)
                .reorderThreshold(10)
                .belowThreshold(true)
                .build();
        when(inventoryMapper.toDTO(any(InventoryItem.class))).thenReturn(responseDTO);

        // Act
        InventoryDTO result = inventoryService.updateStock(1L, inventoryDTO);

        // Assert: result is below threshold
        assertThat(result.isBelowThreshold()).isTrue();

        // Verify: alert was saved
        ArgumentCaptor<ReplenishmentAlert> alertCaptor = ArgumentCaptor.forClass(ReplenishmentAlert.class);
        verify(alertRepository).save(alertCaptor.capture());
        ReplenishmentAlert savedAlert = alertCaptor.getValue();

        assertThat(savedAlert.isResolved()).isFalse();
        assertThat(savedAlert.getInventoryItem()).isEqualTo(inventoryItem);
        assertThat(savedAlert.getAlertedAt()).isNotNull();
    }

    @Test
    void updateStock_WhenQuantityAboveThreshold_ShouldNotTriggerAlert() {
        // Arrange: update to 20 units — still above threshold of 10
        InventoryDTO dtoAboveThreshold = InventoryDTO.builder()
                .quantityOnHand(20)
                .reorderThreshold(10)
                .build();

        when(inventoryItemRepository.findByProductId(1L)).thenReturn(Optional.of(inventoryItem));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(inventoryItem);

        InventoryDTO responseDTO = InventoryDTO.builder()
                .productId(1L)
                .quantityOnHand(20)
                .reorderThreshold(10)
                .belowThreshold(false)
                .build();
        when(inventoryMapper.toDTO(any(InventoryItem.class))).thenReturn(responseDTO);

        // Act
        InventoryDTO result = inventoryService.updateStock(1L, dtoAboveThreshold);

        // Assert: no alert fired
        assertThat(result.isBelowThreshold()).isFalse();
        verify(alertRepository, never()).save(any(ReplenishmentAlert.class));
    }

    @Test
    void updateStock_WhenAlertAlreadyExists_ShouldNotCreateDuplicateAlert() {
        // Arrange: alert already exists for this item
        when(inventoryItemRepository.findByProductId(1L)).thenReturn(Optional.of(inventoryItem));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(inventoryItem);
        when(alertRepository.existsByInventoryItemIdAndResolvedFalse(1L)).thenReturn(true); // already alerted

        InventoryDTO responseDTO = InventoryDTO.builder()
                .productId(1L)
                .quantityOnHand(8)
                .reorderThreshold(10)
                .belowThreshold(true)
                .build();
        when(inventoryMapper.toDTO(any(InventoryItem.class))).thenReturn(responseDTO);

        // Act
        inventoryService.updateStock(1L, inventoryDTO);

        // Assert: no duplicate alert saved
        verify(alertRepository, never()).save(any(ReplenishmentAlert.class));
    }

    @Test
    void updateStock_WhenProductNotFound_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(inventoryItemRepository.findByProductId(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> inventoryService.updateStock(99L, inventoryDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Inventory not found for product ID: 99");

        verify(inventoryItemRepository, never()).save(any());
        verify(alertRepository, never()).save(any());
    }

    @Test
    void getItemsBelowThreshold_ShouldReturnOnlyBelowThresholdItems() {
        // Arrange
        when(inventoryItemRepository.findItemsBelowReorderThreshold())
                .thenReturn(List.of(inventoryItem));
        when(inventoryMapper.toDTOList(anyList())).thenReturn(List.of(inventoryDTO));

        // Act
        List<InventoryDTO> result = inventoryService.getItemsBelowThreshold();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProductId()).isEqualTo(1L);
        verify(inventoryItemRepository).findItemsBelowReorderThreshold();
    }

    @Test
    void resolveAlert_ShouldMarkAlertAsResolved() {
        // Arrange
        ReplenishmentAlert unresolvedAlert = ReplenishmentAlert.builder()
                .id(1L)
                .inventoryItem(inventoryItem)
                .resolved(false)
                .alertedAt(java.time.LocalDateTime.now().minusHours(1))
                .build();

        AlertDTO resolvedAlertDTO = AlertDTO.builder()
                .id(1L)
                .resolved(true)
                .build();

        when(alertRepository.findById(1L)).thenReturn(Optional.of(unresolvedAlert));
        when(alertRepository.save(any(ReplenishmentAlert.class))).thenReturn(unresolvedAlert);
        when(alertMapper.toDTO(any(ReplenishmentAlert.class))).thenReturn(resolvedAlertDTO);

        // Act
        AlertDTO result = inventoryService.resolveAlert(1L);

        // Assert
        assertThat(result.isResolved()).isTrue();
        assertThat(unresolvedAlert.isResolved()).isTrue(); // verify in-memory mutation
        verify(alertRepository).save(unresolvedAlert);
    }
}
