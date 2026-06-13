package com.pos.service;

import com.pos.dto.ReportDTO;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    // ── Original methods ──────────────────────────────────────────────────
    ReportDTO.SalesSummaryReport generateSalesSummaryReport(LocalDate startDate, LocalDate endDate);
    ReportDTO.InventoryReport generateInventoryReport();
    ReportDTO.PerformanceReport generatePerformanceReport(LocalDate startDate, LocalDate endDate);

    // ── New frontend-compatible methods ───────────────────────────────────

    /** GET /api/reports/daily?date=YYYY-MM-DD */
    ReportDTO.DailySummary getDailyReport(LocalDate date);

    /** GET /api/reports/monthly?year=YYYY&month=MM */
    ReportDTO.MonthlySummary getMonthlyReport(int year, int month);

    /** GET /api/reports/top-products?limit=8 */
    List<ReportDTO.TopProductEntry> getTopProducts(int limit);

    /** GET /api/reports/inventory — category breakdown */
    List<ReportDTO.CategoryInventory> getCategoryInventory();

    /** GET /api/reports/summary — dashboard stats */
    ReportDTO.DashboardSummary getDashboardSummary();
}
