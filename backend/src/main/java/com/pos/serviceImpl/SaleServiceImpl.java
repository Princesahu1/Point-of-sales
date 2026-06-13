package com.pos.serviceImpl;

import com.pos.dto.SaleItemRequestDTO;
import com.pos.dto.SaleRequestDTO;
import com.pos.dto.SaleResponseDTO;
import com.pos.exception.InsufficientStockException;
import com.pos.exception.ProductNotFoundException;
import com.pos.exception.SaleNotFoundException;
import com.pos.mapper.SaleMapper;
import com.pos.model.*;
import com.pos.repository.*;
import com.pos.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ReplenishmentAlertRepository alertRepository;
    private final UserRepository userRepository;
    private final SaleMapper saleMapper;

    @Override
    public SaleResponseDTO createSale(SaleRequestDTO saleRequestDTO, String cashierUsername) {
        User cashier = userRepository.findByUsername(cashierUsername)
                .orElseThrow(() -> new IllegalArgumentException("Cashier not found: " + cashierUsername));

        // Validate all stock before processing any deductions
        for (SaleItemRequestDTO itemRequest : saleRequestDTO.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException(itemRequest.getProductId()));

            InventoryItem inventoryItem = inventoryItemRepository.findByProductId(product.getId())
                    .orElseThrow(() -> new IllegalStateException(
                            "No inventory record found for product: " + product.getName()));

            if (inventoryItem.getQuantityOnHand() < itemRequest.getQuantity()) {
                throw new InsufficientStockException(
                        product.getName(),
                        itemRequest.getQuantity(),
                        inventoryItem.getQuantityOnHand());
            }
        }

        // Build sale
        Sale sale = Sale.builder()
                .cashier(cashier)
                .paymentMethod(saleRequestDTO.getPaymentMethod())
                .status(SaleStatus.COMPLETED)
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.ZERO)
                .build();

        Sale savedSale = saleRepository.save(sale);
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Process each item: deduct stock and create sale items
        for (SaleItemRequestDTO itemRequest : saleRequestDTO.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId()).get();
            InventoryItem inventoryItem = inventoryItemRepository.findByProductId(product.getId()).get();

            // Deduct inventory
            inventoryItem.setQuantityOnHand(inventoryItem.getQuantityOnHand() - itemRequest.getQuantity());
            inventoryItemRepository.save(inventoryItem);

            // Trigger alert if below threshold
            if (inventoryItem.getQuantityOnHand() <= inventoryItem.getReorderThreshold()
                    && !alertRepository.existsByInventoryItemIdAndResolvedFalse(inventoryItem.getId())) {
                ReplenishmentAlert alert = ReplenishmentAlert.builder()
                        .inventoryItem(inventoryItem)
                        .alertedAt(LocalDateTime.now())
                        .resolved(false)
                        .build();
                alertRepository.save(alert);
            }

            // Build sale item
            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            SaleItem saleItem = SaleItem.builder()
                    .sale(savedSale)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            savedSale.getItems().add(saleItem);
            totalAmount = totalAmount.add(subtotal);
        }

        savedSale.setTotalAmount(totalAmount);
        Sale finalSale = saleRepository.save(savedSale);
        return saleMapper.toResponseDTO(finalSale);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponseDTO getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new SaleNotFoundException(id));
        return saleMapper.toResponseDTO(sale);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SaleResponseDTO> getSalesByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        List<Sale> sales = saleRepository.findByCreatedAtBetween(start, end);
        return saleMapper.toResponseDTOList(sales);
    }

    @Override
    public SaleResponseDTO refundSale(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new SaleNotFoundException(id));

        if (sale.getStatus() == SaleStatus.REFUNDED) {
            throw new IllegalStateException("Sale " + id + " has already been refunded.");
        }

        // Restore inventory for each item
        for (SaleItem item : sale.getItems()) {
            InventoryItem inventoryItem = inventoryItemRepository.findByProductId(item.getProduct().getId())
                    .orElseThrow(() -> new IllegalStateException(
                            "Inventory not found for product: " + item.getProduct().getName()));
            inventoryItem.setQuantityOnHand(inventoryItem.getQuantityOnHand() + item.getQuantity());
            inventoryItemRepository.save(inventoryItem);
        }

        sale.setStatus(SaleStatus.REFUNDED);
        Sale refundedSale = saleRepository.save(sale);
        return saleMapper.toResponseDTO(refundedSale);
    }
}
