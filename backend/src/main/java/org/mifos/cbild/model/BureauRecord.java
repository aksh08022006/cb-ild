package org.mifos.cbild.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bureau_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BureauRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_confidence")
    private MatchConfidence matchConfidence;

    @Column(name = "match_score")
    private BigDecimal matchScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "bureau_status")
    private BureauStatus bureauStatus;

    @Column(name = "bureau_id")
    private String bureauId;

    @Column(name = "last_reported_date")
    private LocalDate lastReportedDate;

    @Column(name = "retention_years")
    private Integer retentionYears;

    @Column(name = "closure_date")
    private LocalDate closureDate;

    @Column(name = "negative_countdown_months")
    private Integer negativeCountdownMonths;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MatchConfidence { HIGH, MEDIUM, LOW }
    public enum BureauStatus { ACTIVE, CLOSED, NEGATIVE, UNKNOWN }
}
