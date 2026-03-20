package org.mifos.cbild.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispute_audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DisputeAuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "dispute_id") private Dispute dispute;
    private String action;
    @Column(name = "old_status") private String oldStatus;
    @Column(name = "new_status") private String newStatus;
    @Column(length = 1000) private String notes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "performed_by") private User performedBy;
    @Column(name = "performed_at") private LocalDateTime performedAt;
}
