package com.pos;

import com.pos.dto.SaleItemRequestDTO;
import com.pos.dto.SaleRequestDTO;
import com.pos.dto.SaleResponseDTO;
import com.pos.exception.InsufficientStockException;
import com.pos.mapper.SaleMapper;
import com.pos.model.*;
import com.pos.repository.*;
import com.pos.serviceImpl.SaleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.quality.Strictness;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SaleServiceImplTest {

    @Mock private SaleRepository saleRepository;
    @Mock private SaleItemRepository saleItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private InventoryItemRepository inventoryItemRepository;
    @Mock private ReplenishmentAlertRepository alertRepository;
    @Mock private UserRepository userRepository;
    @Mock private SaleMapper saleMapper;

    @InjectMocks
    private SaleServiceImpl saleService;

    private User cashier;
    private Product product;
    private InventoryItem inventoryItem;
    private SaleRequestDTO saleRequestDTO;
    private Sale savedSale;

    @BeforeEach
    void setUp() {
        cashier = User.builder()
                .id(1L)
                .username("cashier_alice")
                .passwordHash("hashed")
                .role(Role.CASHIER)
                .build();

        product = Product.builder()
                .id(1L)
                .name("Coca-Cola 500ml")
                .barcode("BAR-001-CC500")
                .price(new BigDecimal("1.99"))
                .taxRate(new BigDecimal("5.00"))
                .build();

        inventoryItem = InventoryItem.builder()
                .id(1L)
                .product(product)
                .quantityOnHand(50)
                .reorderThreshold(20)
                .build();

        SaleItemRequestDTO itemRequest = SaleItemRequestDTO.builder()
                .productId(1L)
                .quantity(3)
                .build();

        saleRequestDTO = SaleRequestDTO.builder()
                .items(List.of(itemRequest))
                .paymentMethod(PaymentMethod.CASH)
                .build();

        savedSale = Sale.builder()
                .id(1L)
                .cashier(cashier)
                .paymentMethod(PaymentMethod.CASH)
                .status(SaleStatus.COMPLETED)
                .totalAmount(new BigDecimal("5.97"))
                .build();
    }

    @Test
    void createSale_HappyPath_ShouldDeductInventoryAndReturnResponse() {
        // Arrange
        when(userRepository.findByUsername("cashier_alice")).thenReturn(Optional.of(cashier));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryItemRepository.findByProductId(1L)).thenReturn(Optional.of(inventoryItem));
        when(saleRepository.save(any(Sale.class))).thenReturn(savedSale);
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(inventoryItem);
        when(alertRepository.existsByInventoryItemIdAndResolvedFalse(anyLong())).thenReturn(false);

        SaleResponseDTO mockResponse = SaleResponseDTO.builder()
                .id(1L)
                .cashierUsername("cashier_alice")
                .totalAmount(new BigDecimal("5.97"))
                .paymentMethod(PaymentMethod.CASH)
                .status(SaleStatus.COMPLETED)
                .build();
        when(saleMapper.toResponseDTO(any(Sale.class))).thenReturn(mockResponse);

        // Act
        SaleResponseDTO response = saleService.createSale(saleRequestDTO, "cashier_alice");

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo(SaleStatus.COMPLETED);
        assertThat(response.getTotalAmount()).isEqualByComparingTo("5.97");

        // Verify: inventory was saved (quantity deducted)
        verify(inventoryItemRepository, atLeastOnce()).save(any(InventoryItem.class));
        assertThat(inventoryItem.getQuantityOnHand()).isEqualTo(47); // 50 - 3
    }

    @Test
    void createSale_InsufficientStock_ShouldThrowInsufficientStockException() {
        // Arrange: only 2 units in stock, but 5 are requested
        inventoryItem.setQuantityOnHand(2);

        SaleItemRequestDTO itemRequest = SaleItemRequestDTO.builder()
                .productId(1L)
                .quantity(5)
                .build();

        SaleRequestDTO request = SaleRequestDTO.builder()
                .items(List.of(itemRequest))
                .paymentMethod(PaymentMethod.CARD)
                .build();

        when(userRepository.findByUsername("cashier_alice")).thenReturn(Optional.of(cashier));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryItemRepository.findByProductId(1L)).thenReturn(Optional.of(inventoryItem));

        // Act & Assert
        assertThatThrownBy(() -> saleService.createSale(request, "cashier_alice"))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Coca-Cola 500ml")
                .hasMessageContaining("requested 5")
                .hasMessageContaining("available 2");

        // Verify: no sale was saved
        verify(saleRepository, never()).save(any(Sale.class));
        // Verify: no inventory was deducted
        verify(inventoryItemRepository, never()).save(any(InventoryItem.class));
    }

    @Test
    void createSale_WhenStockDropsBelowThreshold_ShouldTriggerAlert() {
        // Arrange: quantity will drop to exactly the threshold (or below)
        inventoryItem.setQuantityOnHand(22); // threshold is 20
        // After selling 3, quantity becomes 19 (<= 20), so alert should fire

        when(userRepository.findByUsername("cashier_alice")).thenReturn(Optional.of(cashier));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryItemRepository.findByProductId(1L)).thenReturn(Optional.of(inventoryItem));
        when(saleRepository.save(any(Sale.class))).thenReturn(savedSale);
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenReturn(inventoryItem);
        when(alertRepository.existsByInventoryItemIdAndResolvedFalse(anyLong())).thenReturn(false);
        when(saleMapper.toResponseDTO(any(Sale.class))).thenReturn(
                SaleResponseDTO.builder().id(1L).status(SaleStatus.COMPLETED).build());

        // Act
        saleService.createSale(saleRequestDTO, "cashier_alice");

        // Assert: alert was saved because quantity dropped below threshold
        verify(alertRepository).save(any(ReplenishmentAlert.class));
    }
}
