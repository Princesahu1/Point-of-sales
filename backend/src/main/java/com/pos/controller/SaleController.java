package com.pos.controller;

import com.pos.dto.SaleRequestDTO;
import com.pos.dto.SaleResponseDTO;
import com.pos.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    public ResponseEntity<SaleResponseDTO> createSale(
            @Valid @RequestBody SaleRequestDTO saleRequestDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        SaleResponseDTO response = saleService.createSale(saleRequestDTO, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponseDTO> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    @GetMapping
    public ResponseEntity<List<SaleResponseDTO>> getSales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        LocalDate from = (start != null) ? start : LocalDate.of(2000, 1, 1);
        LocalDate to   = (end   != null) ? end   : LocalDate.now();
        return ResponseEntity.ok(saleService.getSalesByDateRange(from, to));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<SaleResponseDTO> refundSale(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.refundSale(id));
    }
}
