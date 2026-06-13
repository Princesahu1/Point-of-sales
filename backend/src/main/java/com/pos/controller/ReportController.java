package com.pos.controller;

import com.pos.dto.ReportDTO;
import com.pos.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    public ResponseEntity<ReportDTO.SalesSummaryReport> getSalesSummaryReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(reportService.generateSalesSummaryReport(start, end));
    }

    @GetMapping("/inventory-summary")
    public ResponseEntity<ReportDTO.InventoryReport> getInventorySummary() {
        return ResponseEntity.ok(reportService.generateInventoryReport());
    }

    @GetMapping("/performance")
    public ResponseEntity<ReportDTO.PerformanceReport> getPerformanceReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(reportService.generatePerformanceReport(start, end));
    }

    // ── Frontend Compatible Endpoints ─────────────────────────────────────

    @GetMapping("/daily")
    public ResponseEntity<ReportDTO.DailySummary> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getDailyReport(date));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ReportDTO.MonthlySummary> getMonthlyReport(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlyReport(year, month));
    }

    @GetMapping("/top-products")
    public ResponseEntity<java.util.List<ReportDTO.TopProductEntry>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reportService.getTopProducts(limit));
    }

    @GetMapping("/inventory")
    public ResponseEntity<java.util.List<ReportDTO.CategoryInventory>> getCategoryInventory() {
        return ResponseEntity.ok(reportService.getCategoryInventory());
    }

    @GetMapping("/summary")
    public ResponseEntity<ReportDTO.DashboardSummary> getDashboardSummary() {
        return ResponseEntity.ok(reportService.getDashboardSummary());
    }
}
