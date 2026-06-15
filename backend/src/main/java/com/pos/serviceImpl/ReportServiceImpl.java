package com.pos.serviceImpl;

import com.pos.dto.ReportDTO;
import com.pos.mapper.InventoryMapper;
import com.pos.model.Sale;
import com.pos.model.SaleItem;
import com.pos.model.SaleStatus;
import com.pos.repository.InventoryItemRepository;
import com.pos.repository.ProductRepository;
import com.pos.repository.ReplenishmentAlertRepository;
import com.pos.repository.SaleItemRepository;
import com.pos.repository.SaleRepository;
import com.pos.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ReplenishmentAlertRepository alertRepository;
    private final ProductRepository productRepository;
    private final InventoryMapper inventoryMapper;

    // ── Original methods ──────────────────────────────────────────────────

    @Override
    public ReportDTO.SalesSummaryReport generateSalesSummaryReport(LocalDate startDate, LocalDate endDate) {
        List<Sale> sales = getSalesInRange(startDate, endDate);

        BigDecimal totalRevenue = sales.stream()
                .filter(s -> s.getStatus() == SaleStatus.COMPLETED)
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalTransactions = sales.size();
        long completedTransactions = sales.stream()
                .filter(s -> s.getStatus() == SaleStatus.COMPLETED).count();

        BigDecimal avgTransactionValue = completedTransactions > 0
                ? totalRevenue.divide(BigDecimal.valueOf(completedTransactions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long totalItemsSold = sales.stream()
                .filter(s -> s.getStatus() == SaleStatus.COMPLETED)
                .flatMap(s -> s.getItems().stream())
                .mapToLong(item -> item.getQuantity())
                .sum();

        long cashTransactions = sales.stream()
                .filter(s -> s.getPaymentMethod().name().equals("CASH")).count();
        long cardTransactions = sales.stream()
                .filter(s -> s.getPaymentMethod().name().equals("CARD") || s.getPaymentMethod().name().equals("CREDIT")).count();
        long upiTransactions = sales.stream()
                .filter(s -> s.getPaymentMethod().name().equals("UPI") || s.getPaymentMethod().name().equals("QR") || s.getPaymentMethod().name().equals("WALLET")).count();
        long refundedTransactions = sales.stream()
                .filter(s -> s.getStatus() == SaleStatus.REFUNDED).count();

        return ReportDTO.SalesSummaryReport.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalTransactions(totalTransactions)
                .totalRevenue(totalRevenue)
                .averageTransactionValue(avgTransactionValue)
                .totalItemsSold(totalItemsSold)
                .cashTransactions(cashTransactions)
                .cardTransactions(cardTransactions)
                .upiTransactions(upiTransactions)
                .refundedTransactions(refundedTransactions)
                .build();
    }

    @Override
    public ReportDTO.InventoryReport generateInventoryReport() {
        var allItems = inventoryItemRepository.findAll();
        var itemsBelowThreshold = inventoryItemRepository.findItemsBelowReorderThreshold();
        long unresolvedAlerts = alertRepository.findByResolvedFalse().size();

        int totalStockUnits = allItems.stream()
                .mapToInt(item -> item.getQuantityOnHand())
                .sum();

        return ReportDTO.InventoryReport.builder()
                .totalProducts(allItems.size())
                .totalStockUnits(totalStockUnits)
                .productsBelowThreshold(itemsBelowThreshold.size())
                .unresolvedAlerts((int) unresolvedAlerts)
                .itemsBelowThreshold(inventoryMapper.toDTOList(itemsBelowThreshold))
                .build();
    }

    @Override
    public ReportDTO.PerformanceReport generatePerformanceReport(LocalDate startDate, LocalDate endDate) {
        List<Sale> sales = getSalesInRange(startDate, endDate);

        long totalSales = sales.size();
        long completedSales = sales.stream()
                .filter(s -> s.getStatus() == SaleStatus.COMPLETED).count();
        long refundedSales = sales.stream()
                .filter(s -> s.getStatus() == SaleStatus.REFUNDED).count();

        BigDecimal totalRevenue = sales.stream()
                .filter(s -> s.getStatus() == SaleStatus.COMPLETED)
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double salesConversionRate = totalSales > 0
                ? (double) completedSales / totalSales * 100.0
                : 0.0;
        double orderAccuracyRate = totalSales > 0
                ? (double) completedSales / totalSales * 100.0
                : 0.0;

        long totalUnitsSold = sales.stream()
                .filter(s -> s.getStatus() == SaleStatus.COMPLETED)
                .flatMap(s -> s.getItems().stream())
                .mapToLong(SaleItem::getQuantity)
                .sum();

        int totalCurrentStock = inventoryItemRepository.findAll().stream()
                .mapToInt(item -> item.getQuantityOnHand())
                .sum();

        double inventoryTurnoverRatio = totalCurrentStock > 0
                ? (double) totalUnitsSold / totalCurrentStock
                : 0.0;

        return ReportDTO.PerformanceReport.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalSales(totalSales)
                .completedSales(completedSales)
                .refundedSales(refundedSales)
                .totalRevenue(totalRevenue)
                .salesConversionRate(Math.round(salesConversionRate * 100.0) / 100.0)
                .inventoryTurnoverRatio(Math.round(inventoryTurnoverRatio * 100.0) / 100.0)
                .orderAccuracyRate(Math.round(orderAccuracyRate * 100.0) / 100.0)
                .build();
    }

    // ── New frontend-compatible methods ───────────────────────────────────

    @Override
    public ReportDTO.DailySummary getDailyReport(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end   = date.atTime(LocalTime.MAX);

        BigDecimal revenue = saleRepository.sumRevenueBetween(start, end);
        if (revenue == null) revenue = BigDecimal.ZERO;

        long orders = saleRepository.countCompletedBetween(start, end);
        long itemsSold = saleItemRepository.sumQuantityBetween(start, end);

        BigDecimal avg = orders > 0
                ? revenue.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return ReportDTO.DailySummary.builder()
                .date(date.toString())
                .totalOrders(orders)
                .totalRevenue(revenue)
                .avgOrderValue(avg)
                .totalItemsSold(itemsSold)
                .build();
    }

    @Override
    public ReportDTO.MonthlySummary getMonthlyReport(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end   = ym.atEndOfMonth().atTime(LocalTime.MAX);

        BigDecimal revenue = saleRepository.sumRevenueBetween(start, end);
        if (revenue == null) revenue = BigDecimal.ZERO;

        long orders    = saleRepository.countCompletedBetween(start, end);
        long itemsSold = saleItemRepository.sumQuantityBetween(start, end);

        BigDecimal avg = orders > 0
                ? revenue.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return ReportDTO.MonthlySummary.builder()
                .year(year)
                .month(month)
                .totalOrders(orders)
                .totalRevenue(revenue)
                .avgOrderValue(avg)
                .totalItemsSold(itemsSold)
                .build();
    }

    @Override
    public List<ReportDTO.TopProductEntry> getTopProducts(int limit) {
        List<Object[]> rows = saleItemRepository.findTopProductsByRevenue(
                PageRequest.of(0, Math.max(1, limit)));
        return rows.stream()
                .map(r -> ReportDTO.TopProductEntry.builder()
                        .productName((String) r[0])
                        .totalQuantity(((Number) r[1]).longValue())
                        .totalRevenue((BigDecimal) r[2])
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ReportDTO.CategoryInventory> getCategoryInventory() {
        // Group inventory items by product category
        return inventoryItemRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        item -> item.getProduct() != null && item.getProduct().getCategory() != null
                                ? item.getProduct().getCategory() : "Uncategorized"))
                .entrySet().stream()
                .map(entry -> {
                    String cat    = entry.getKey();
                    var items     = entry.getValue();
                    long qty      = items.stream().mapToLong(i -> i.getQuantityOnHand()).sum();
                    BigDecimal val = items.stream()
                            .map(i -> {
                                BigDecimal price = i.getProduct() != null ? i.getProduct().getPrice() : BigDecimal.ZERO;
                                return price.multiply(BigDecimal.valueOf(i.getQuantityOnHand()));
                            })
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return ReportDTO.CategoryInventory.builder()
                            .category(cat)
                            .totalProducts(items.size())
                            .totalQuantity(qty)
                            .totalValue(val)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getTotalQuantity(), a.getTotalQuantity()))
                .collect(Collectors.toList());
    }

    @Override
    public ReportDTO.DashboardSummary getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end   = today.atTime(LocalTime.MAX);

        BigDecimal todayRevenue = saleRepository.sumRevenueBetween(start, end);
        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;

        long todayOrders    = saleRepository.countCompletedBetween(start, end);
        long totalProducts  = productRepository.count();
        long lowStockCount  = inventoryItemRepository.findItemsBelowReorderThreshold().size();

        return ReportDTO.DashboardSummary.builder()
                .todayRevenue(todayRevenue)
                .todayOrders(todayOrders)
                .totalProducts(totalProducts)
                .lowStockCount(lowStockCount)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private List<Sale> getSalesInRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end   = endDate.atTime(LocalTime.MAX);
        return saleRepository.findByCreatedAtBetween(start, end);
    }
}
