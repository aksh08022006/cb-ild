package org.mifos.cbild.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ─── KYC Field ───────────────────────────────────────────────────────────────
@Entity @Table(name = "kyc_fields")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class KycFieldEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "client_id") private Client client;
    @Column(name = "field_name")     private String fieldName;
    @Column(name = "fineract_field") private String fineractField;
    @Column(name = "bureau_field")   private String bureauField;
    @Column(name = "field_value")    private String fieldValue;
    @Enumerated(EnumType.STRING)     private KycStatus status;
    @Column(name = "warning_note")   private String warningNote;
    @Column(name = "last_verified")  private LocalDateTime lastVerified;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp   @Column(name = "updated_at")                    private LocalDateTime updatedAt;
    public enum KycStatus { OK, WARN, CRITICAL, MISSING }
}
