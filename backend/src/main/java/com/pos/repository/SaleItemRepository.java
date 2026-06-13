package com.pos.repository;

import com.pos.model.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findBySaleId(Long saleId);

    /**
     * Top products by revenue — only from COMPLETED sales.
     * Returns Object[] { productName, totalQty, totalRevenue }
     */
    @Query("""
            SELECT si.product.name,
                   SUM(si.quantity),
                   SUM(si.subtotal)
            FROM SaleItem si
            WHERE si.sale.status = com.pos.model.SaleStatus.COMPLETED
            GROUP BY si.product.id, si.product.name
            ORDER BY SUM(si.subtotal) DESC
            """)
    List<Object[]> findTopProductsByRevenue(org.springframework.data.domain.Pageable pageable);

    /**
     * Total items sold in a date range (COMPLETED sales).
     */
    @Query("""
            SELECT COALESCE(SUM(si.quantity), 0)
            FROM SaleItem si
            WHERE si.sale.status = com.pos.model.SaleStatus.COMPLETED
              AND si.sale.createdAt BETWEEN :start AND :end
            """)
    long sumQuantityBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
