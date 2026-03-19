package org.mifos.cbild.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_fields")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KycField {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "field_name", nullable = false)
    private String fieldName;

    @Column(name = "fineract_field", nullable = false)
    private String fineractField;

    @Column(name = "bureau_field", nullable = false)
    private String bureauField;

    @Column(name = "field_value", length = 500)
    private String fieldValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KycStatus status;

    @Column(name = "warning_note", length = 500)
    private String warningNote;

    @Column(name = "last_verified")
    private LocalDateTime lastVerified;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum KycStatus { OK, WARN, CRITICAL, MISSING }
}
