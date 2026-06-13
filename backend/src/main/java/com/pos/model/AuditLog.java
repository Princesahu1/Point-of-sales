package com.pos.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String action;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    public void setTimestamp() {
        this.timestamp = LocalDateTime.now();
    }
}
