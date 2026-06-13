package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDTO {

    private Long id;
    private Long inventoryItemId;
    private String productName;
    private String barcode;
    private Integer currentQuantity;
    private Integer reorderThreshold;
    private LocalDateTime alertedAt;
    private boolean resolved;
}
