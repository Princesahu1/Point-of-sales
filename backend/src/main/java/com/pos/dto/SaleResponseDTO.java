package com.pos.dto;

import com.pos.model.PaymentMethod;
import com.pos.model.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleResponseDTO {

    private Long id;
    private String cashierUsername;
    private List<SaleItemDTO> items;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private SaleStatus status;
    private LocalDateTime createdAt;
}
