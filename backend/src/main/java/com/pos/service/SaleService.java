package com.pos.service;

import com.pos.dto.SaleRequestDTO;
import com.pos.dto.SaleResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface SaleService {

    SaleResponseDTO createSale(SaleRequestDTO saleRequestDTO, String cashierUsername);

    SaleResponseDTO getSaleById(Long id);

    List<SaleResponseDTO> getSalesByDateRange(LocalDate startDate, LocalDate endDate);

    SaleResponseDTO refundSale(Long id);
}
