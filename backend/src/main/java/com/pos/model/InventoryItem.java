package com.pos.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand;

    @Column(name = "reorder_threshold", nullable = false)
    private Integer reorderThreshold;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PreUpdate
    @PrePersist
    public void setLastUpdated() {
        this.lastUpdated = LocalDateTime.now();
    }
}
