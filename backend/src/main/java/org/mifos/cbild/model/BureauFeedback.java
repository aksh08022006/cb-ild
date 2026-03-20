package org.mifos.cbild.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bureau_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BureauFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private Submission submission;

    @Column(name = "error_code")
    private String errorCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "error_category")
    private ErrorCategory errorCategory;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "affected_field")
    private String affectedField;

    @Enumerated(EnumType.STRING)
    private Severity severity;

    private Boolean resolved;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ErrorCategory { INVALID_ID, DATE_INCONSISTENCY, MISSING_FIELD, DUPLICATE, MATCH_FAILURE, OTHER }
    public enum Severity { ERROR, WARNING, INFO }
}
