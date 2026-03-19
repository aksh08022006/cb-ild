package org.mifos.cbild.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mifos.cbild.dto.KycScoreResponse;
import org.mifos.cbild.model.Client;
import org.mifos.cbild.model.KycField;
import org.mifos.cbild.repository.ClientRepository;
import org.mifos.cbild.repository.KycFieldRepository;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("KYC Scoring Service Tests")
class KycScoringServiceTest {

    @Mock private ClientRepository clientRepository;
    @Mock private KycFieldRepository kycFieldRepository;
    @Mock private AuditService auditService;

    @InjectMocks
    private KycScoringService kycScoringService;

    private Client testClient;

    @BeforeEach
    void setUp() {
        testClient = Client.builder()
            .id(1L)
            .fineractClientId("FC-10421")
            .firstName("Anjali")
            .lastName("Mehta")
            .dateOfBirth(LocalDate.of(1988, 3, 12))
            .email("anjali@gmail.com")
            .city("Mumbai")
            .build();
    }

    @Test
    @DisplayName("Score is 100 when all fields are OK")
    void computeScore_allOk_returns100() {
        List<KycField> allOk = List.of(
            buildField("Full Name",     KycField.KycStatus.OK),
            buildField("Date of Birth", KycField.KycStatus.OK),
            buildField("National ID",   KycField.KycStatus.OK),
            buildField("Mobile Number", KycField.KycStatus.OK)
        );
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));
        when(kycFieldRepository.findByClientId(1L)).thenReturn(allOk);

        KycScoreResponse result = kycScoringService.computeScore(1L);

        assertThat(result.getCompletenessScore()).isEqualTo(100);
        assertThat(result.getReadinessLevel()).isEqualTo("HIGH");
        assertThat(result.getCriticalFields()).isEqualTo(0);
    }

    @Test
    @DisplayName("Score is 0 when all fields are CRITICAL")
    void computeScore_allCritical_returns0() {
        List<KycField> allCrit = List.of(
            buildField("National ID",   KycField.KycStatus.CRITICAL),
            buildField("Date of Birth", KycField.KycStatus.CRITICAL),
            buildField("Postal Code",   KycField.KycStatus.CRITICAL)
        );
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));
        when(kycFieldRepository.findByClientId(1L)).thenReturn(allCrit);

        KycScoreResponse result = kycScoringService.computeScore(1L);

        assertThat(result.getCompletenessScore()).isEqualTo(0);
        assertThat(result.getReadinessLevel()).isEqualTo("LOW");
        assertThat(result.getCriticalFields()).isEqualTo(3);
    }

    @Test
    @DisplayName("Mixed fields yield MEDIUM readiness")
    void computeScore_mixed_returnsMedium() {
        List<KycField> mixed = List.of(
            buildField("Full Name",     KycField.KycStatus.OK),
            buildField("Date of Birth", KycField.KycStatus.OK),
            buildField("National ID",   KycField.KycStatus.WARN),
            buildField("Mobile Number", KycField.KycStatus.OK),
            buildField("Postal Code",   KycField.KycStatus.OK),
            buildField("City",          KycField.KycStatus.OK),
            buildField("Address",       KycField.KycStatus.OK),
            buildField("Email",         KycField.KycStatus.MISSING),
            buildField("Gender",        KycField.KycStatus.OK),
            buildField("Opened",        KycField.KycStatus.OK)
        );
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));
        when(kycFieldRepository.findByClientId(1L)).thenReturn(mixed);

        KycScoreResponse result = kycScoringService.computeScore(1L);

        assertThat(result.getCompletenessScore()).isBetween(65, 95);
        assertThat(result.getClientName()).isEqualTo("Anjali Mehta");
    }

    @Test
    @DisplayName("Warnings include free-domain email notice")
    void computeScore_gmailEmail_includesEmailWarning() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(testClient));
        when(kycFieldRepository.findByClientId(1L)).thenReturn(List.of(
            buildField("Full Name", KycField.KycStatus.OK)
        ));

        KycScoreResponse result = kycScoringService.computeScore(1L);

        assertThat(result.getWarnings())
            .anyMatch(w -> w.toLowerCase().contains("free domain"));
    }

    @Test
    @DisplayName("Throws exception for unknown client")
    void computeScore_unknownClient_throwsException() {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        org.junit.jupiter.api.Assertions.assertThrows(
            RuntimeException.class,
            () -> kycScoringService.computeScore(99L)
        );
    }

    private KycField buildField(String name, KycField.KycStatus status) {
        return KycField.builder()
            .fieldName(name)
            .fineractField("fineract_" + name.toLowerCase().replace(" ", "_"))
            .bureauField("K4_" + name.toUpperCase().replace(" ", "_"))
            .fieldValue(status == KycField.KycStatus.OK ? "test-value" : null)
            .status(status)
            .client(testClient)
            .build();
    }
}
