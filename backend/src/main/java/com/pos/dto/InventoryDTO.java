package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDTO {

    private Long id;
    private Long productId;
    private String productName;
    private String barcode;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantityOnHand;

    @NotNull(message = "Reorder threshold is required")
    @Min(value = 0, message = "Reorder threshold cannot be negative")
    private Integer reorderThreshold;

    private LocalDateTime lastUpdated;
    private boolean belowThreshold;
}
