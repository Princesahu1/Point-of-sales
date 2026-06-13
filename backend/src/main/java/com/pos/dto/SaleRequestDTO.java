package com.pos.dto;

import com.pos.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleRequestDTO {

    @NotEmpty(message = "Sale must have at least one item")
    @Valid
    private List<SaleItemRequestDTO> items;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
