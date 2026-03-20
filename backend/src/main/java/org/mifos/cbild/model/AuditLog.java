package org.mifos.cbild.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "entity_type", nullable = false, length = 50) private String entityType;
    @Column(name = "entity_id", nullable = false) private Long entityId;
    @Column(nullable = false, length = 100) private String action;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "performed_by") private User performedBy;
    @Column(name = "ip_address", length = 45) private String ipAddress;
    @Column(columnDefinition = "TEXT") private String detail;
    @CreationTimestamp @Column(name = "performed_at", updatable = false) private LocalDateTime performedAt;
}
