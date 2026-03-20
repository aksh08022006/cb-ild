package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mifos.cbild.dto.*;
import org.mifos.cbild.model.*;
import org.mifos.cbild.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
class KycScoringService {

    private final ClientRepository clientRepository;
    private final KycFieldRepository kycFieldRepository;
    private final AuditService auditService;

    // Scoring weights per status
    private static final Map<String, Integer> STATUS_WEIGHTS = Map.of(
        "OK",       10,
        "WARN",      6,
        "CRITICAL",  0,
        "MISSING",   3
    );

    // Fields considered mandatory for Metro 2 submission
    private static final Set<String> MANDATORY_FIELDS = Set.of(
        "Full Name", "Date of Birth", "National ID", "Address Line 1",
        "City", "Postal Code", "Mobile Number", "Gender", "Account Opened"
    );

    public KycScoreResponse computeScore(Long clientId) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));

        List<KycField> fields = kycFieldRepository.findByClientId(clientId);

        int totalFields  = fields.size();
        int maxScore     = totalFields * 10;
        int earned       = fields.stream()
            .mapToInt(f -> STATUS_WEIGHTS.getOrDefault(f.getStatus().name(), 0))
            .sum();

        int score = totalFields > 0 ? Math.round((float) earned / maxScore * 100) : 0;

        long ok       = fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.OK).count();
        long warn      = fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.WARN).count();
        long critical  = fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.CRITICAL).count();
        long missing   = fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.MISSING).count();

        String readiness = score >= 90 ? "HIGH" : score >= 65 ? "MEDIUM" : "LOW";
        String label     = score >= 90 ? "Ready to submit"
                         : score >= 65 ? "Partial review needed"
                         : "Fix required before submission";

        List<KycFieldDto> fieldDtos = fields.stream()
            .map(f -> KycFieldDto.builder()
                .fieldName(f.getFieldName())
                .fineractField(f.getFineractField())
                .bureauField(f.getBureauField())
                .fieldValue(f.getFieldValue())
                .status(f.getStatus().name())
                .warningNote(f.getWarningNote())
                .build())
            .collect(Collectors.toList());

        List<String> warnings = buildWarnings(fields, client);

        auditService.log("CLIENT", clientId, "KYC_SCORE_VIEWED",
            "Score computed: " + score + " | Readiness: " + readiness);

        return KycScoreResponse.builder()
            .clientId(clientId)
            .clientName(client.getFirstName() + " " + client.getLastName())
            .fineractClientId(client.getFineractClientId())
            .completenessScore(score)
            .totalFields(totalFields)
            .okFields((int) ok)
            .warnFields((int) warn)
            .criticalFields((int) critical)
            .missingFields((int) missing)
            .readinessLevel(readiness)
            .readinessLabel(label)
            .fields(fieldDtos)
            .warnings(warnings)
            .build();
    }

    public Metro2PreviewResponse buildMetro2Preview(Long clientId) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));

        List<KycField> fields = kycFieldRepository.findByClientId(clientId);

        List<Metro2FieldMapping> mappings = fields.stream()
            .map(f -> Metro2FieldMapping.builder()
                .fineractField(f.getFineractField())
                .bureauField(f.getBureauField())
                .bureauFieldDescription(getBureauFieldDescription(f.getBureauField()))
                .value(f.getFieldValue())
                .status(toMetro2Status(f.getStatus()))
                .required(MANDATORY_FIELDS.contains(f.getFieldName()))
                .build())
            .collect(Collectors.toList());

        long readyCount   = mappings.stream().filter(m -> "mapped".equals(m.getStatus())).count();
        long missingCount = mappings.stream().filter(m -> "missing".equals(m.getStatus())).count();

        return Metro2PreviewResponse.builder()
            .clientId(clientId)
            .clientName(client.getFirstName() + " " + client.getLastName())
            .mappings(mappings)
            .readyCount((int) readyCount)
            .missingCount((int) missingCount)
            .build();
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private List<String> buildWarnings(List<KycField> fields, Client client) {
        List<String> warnings = new ArrayList<>();

        long critCount = fields.stream()
            .filter(f -> f.getStatus() == KycField.KycStatus.CRITICAL).count();
        if (critCount > 0) {
            warnings.add(critCount + " critical field(s) missing — bureau will reject this record.");
        }

        fields.stream()
            .filter(f -> f.getStatus() == KycField.KycStatus.WARN && f.getWarningNote() != null)
            .forEach(f -> warnings.add(f.getFieldName() + ": " + f.getWarningNote()));

        if (client.getEmail() != null && client.getEmail().matches(".*@(gmail|yahoo|hotmail|mail)\\..*")) {
            warnings.add("Email uses free domain — bureau may flag as low identity confidence.");
        }

        return warnings;
    }

    private String toMetro2Status(KycField.KycStatus status) {
        return switch (status) {
            case OK       -> "mapped";
            case CRITICAL -> "missing";
            case MISSING  -> "empty";
            case WARN     -> "check";
        };
    }

    private String getBureauFieldDescription(String bureauField) {
        return switch (bureauField) {
            case "K4_NAME"      -> "Borrower full legal name";
            case "K4_DOB"       -> "Date of birth (YYYYMMDD)";
            case "K4_ID_NUMBER" -> "Government issued national ID";
            case "K4_ADDRESS_1" -> "Primary street address";
            case "K4_CITY"      -> "City of residence";
            case "K4_POSTAL"    -> "Postal / ZIP code";
            case "K4_PHONE"     -> "Primary phone number";
            case "K4_EMAIL"     -> "Email address (optional)";
            case "K4_GENDER"    -> "Borrower gender code";
            case "K4_OPEN_DATE" -> "Account open date (YYYYMMDD)";
            default             -> bureauField;
        };
    }
}
