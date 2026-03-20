package org.mifos.cbild.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "disputes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Dispute {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "client_id") private Client client;
    @Column(name = "case_reference", unique = true) private String caseReference;
    @Enumerated(EnumType.STRING) @Column(name = "dispute_type") private DisputeType disputeType;
    @Enumerated(EnumType.STRING) private DisputeStatus status;
    @Column(length = 2000) private String description;
    @Column(name = "institution_value", length = 500) private String institutionValue;
    @Column(name = "bureau_value", length = 500) private String bureauValue;
    @Column(name = "disputed_field") private String disputedField;
    @Column(name = "resolution_notes", length = 2000) private String resolutionNotes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assigned_to") private User assignedTo;
    @Column(name = "opened_at") private LocalDateTime openedAt;
    @Column(name = "resolved_at") private LocalDateTime resolvedAt;
    @OneToMany(mappedBy = "dispute", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DisputeAuditLog> auditLogs;

    public enum DisputeType { WRONG_BALANCE, WRONG_STATUS, IDENTITY_MISMATCH, DUPLICATE_TRADELINE, OTHER }
    public enum DisputeStatus { OPEN, UNDER_REVIEW, RESOLVED, REJECTED }
}
