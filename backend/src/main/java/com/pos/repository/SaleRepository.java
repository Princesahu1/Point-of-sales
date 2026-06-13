package com.pos.repository;

import com.pos.model.Sale;
import com.pos.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Sale> findByCashier(User cashier);

    List<Sale> findByCashierAndCreatedAtBetween(User cashier, LocalDateTime start, LocalDateTime end);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /** Count COMPLETED sales between two timestamps */
    @Query("""
            SELECT COUNT(s) FROM Sale s
            WHERE s.status = com.pos.model.SaleStatus.COMPLETED
              AND s.createdAt BETWEEN :start AND :end
            """)
    long countCompletedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /** Sum revenue (COMPLETED sales) between two timestamps */
    @Query("""
            SELECT COALESCE(SUM(s.totalAmount), 0)
            FROM Sale s
            WHERE s.status = com.pos.model.SaleStatus.COMPLETED
              AND s.createdAt BETWEEN :start AND :end
            """)
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
