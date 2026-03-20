package org.mifos.cbild.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Alert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "client_id") private Client client;
    @Enumerated(EnumType.STRING) @Column(name = "alert_type") private AlertType alertType;
    @Enumerated(EnumType.STRING) private AlertSeverity severity;
    @Column(nullable = false, length = 300) private String title;
    @Column(length = 1000) private String description;
    private Boolean acknowledged;
    @Column(name = "acknowledged_at") private LocalDateTime acknowledgedAt;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;

    public enum AlertType { SCORE_DROP, NEW_DELINQUENCY, EARLY_DEFAULT, SUBMISSION_REJECTED, KYC_GAP }
    public enum AlertSeverity { HIGH, MEDIUM, LOW }
}
