package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDTO {

    // Common fields
    private LocalDate reportGeneratedAt;

    // ── Original Reports ──────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SalesSummaryReport {
        private LocalDate startDate;
        private LocalDate endDate;
        private long totalTransactions;
        private BigDecimal totalRevenue;
        private BigDecimal averageTransactionValue;
        private long totalItemsSold;
        private long cashTransactions;
        private long cardTransactions;
        private long upiTransactions;
        private long refundedTransactions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryReport {
        private int totalProducts;
        private int totalStockUnits;
        private int productsBelowThreshold;
        private int unresolvedAlerts;
        private List<InventoryDTO> itemsBelowThreshold;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerformanceReport {
        private LocalDate startDate;
        private LocalDate endDate;
        private double salesConversionRate;
        private double inventoryTurnoverRatio;
        private double orderAccuracyRate;
        private long totalSales;
        private long completedSales;
        private long refundedSales;
        private BigDecimal totalRevenue;
    }

    // ── New Frontend-Compatible Reports ──────────────────────────────────

    /** Returned by GET /api/reports/daily?date=YYYY-MM-DD */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailySummary {
        private String date;
        private long totalOrders;
        private BigDecimal totalRevenue;
        private BigDecimal avgOrderValue;
        private long totalItemsSold;
    }

    /** Returned by GET /api/reports/monthly?year=YYYY&month=MM */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlySummary {
        private int year;
        private int month;
        private long totalOrders;
        private BigDecimal totalRevenue;
        private BigDecimal avgOrderValue;
        private long totalItemsSold;
    }

    /** One entry for GET /api/reports/top-products */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProductEntry {
        private String productName;
        private long totalQuantity;
        private BigDecimal totalRevenue;
    }

    /** One row for GET /api/reports/inventory (frontend table) */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryInventory {
        private String category;
        private long totalProducts;
        private long totalQuantity;
        private BigDecimal totalValue;
    }

    /** GET /api/reports/summary — dashboard stats card */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardSummary {
        private BigDecimal todayRevenue;
        private long todayOrders;
        private long totalProducts;
        private long lowStockCount;
    }
}
