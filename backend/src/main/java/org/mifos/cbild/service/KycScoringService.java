package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.*;
import org.mifos.cbild.model.*;
import org.mifos.cbild.repository.ClientRepository;
import org.mifos.cbild.repository.KycFieldRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KycScoringService {

    private final ClientRepository clientRepository;
    private final KycFieldRepository kycFieldRepository;
    private final AuditService auditService;

    private static final Map<String, Integer> WEIGHTS = Map.of(
        "OK", 10, "WARN", 6, "CRITICAL", 0, "MISSING", 3
    );

    private static final Set<String> MANDATORY = Set.of(
        "Full Name", "Date of Birth", "National ID",
        "Address Line 1", "City", "Postal Code",
        "Mobile Number", "Gender", "Account Opened"
    );

    public KycScoreResponse computeScore(Long clientId) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));
        List<KycField> fields = kycFieldRepository.findByClientId(clientId);

        int maxScore = fields.size() * 10;
        int earned = fields.stream()
            .mapToInt(f -> WEIGHTS.getOrDefault(f.getStatus().name(), 0))
            .sum();
        int score = maxScore > 0 ? Math.round((float) earned / maxScore * 100) : 0;

        long ok       = fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.OK).count();
        long warn     = fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.WARN).count();
        long critical = fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.CRITICAL).count();
        long missing  = fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.MISSING).count();

        String readiness = score >= 90 ? "HIGH" : score >= 65 ? "MEDIUM" : "LOW";
        String label = score >= 90 ? "Ready to submit"
            : score >= 65 ? "Partial review needed" : "Fix required before submission";

        List<KycFieldDto> fieldDtos = fields.stream().map(f -> KycFieldDto.builder()
            .fieldName(f.getFieldName()).fineractField(f.getFineractField())
            .bureauField(f.getBureauField()).fieldValue(f.getFieldValue())
            .status(f.getStatus().name()).warningNote(f.getWarningNote())
            .build()).collect(Collectors.toList());

        List<String> warnings = buildWarnings(fields, client);
        auditService.log("CLIENT", clientId, "KYC_SCORE_VIEWED", "Score: " + score);

        return KycScoreResponse.builder()
            .clientId(clientId)
            .clientName(client.getFirstName() + " " + client.getLastName())
            .fineractClientId(client.getFineractClientId())
            .completenessScore(score).totalFields(fields.size())
            .okFields((int) ok).warnFields((int) warn)
            .criticalFields((int) critical).missingFields((int) missing)
            .readinessLevel(readiness).readinessLabel(label)
            .fields(fieldDtos).warnings(warnings)
            .build();
    }

    public Metro2PreviewResponse buildMetro2Preview(Long clientId) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));
        List<KycField> fields = kycFieldRepository.findByClientId(clientId);

        List<Metro2FieldMapping> mappings = fields.stream().map(f -> Metro2FieldMapping.builder()
            .fineractField(f.getFineractField()).bureauField(f.getBureauField())
            .bureauFieldDescription(describeField(f.getBureauField()))
            .value(f.getFieldValue()).status(toMetro2Status(f.getStatus()))
            .required(MANDATORY.contains(f.getFieldName()))
            .build()).collect(Collectors.toList());

        long ready   = mappings.stream().filter(m -> "mapped".equals(m.getStatus())).count();
        long missing = mappings.stream().filter(m -> "missing".equals(m.getStatus())).count();

        return Metro2PreviewResponse.builder()
            .clientId(clientId)
            .clientName(client.getFirstName() + " " + client.getLastName())
            .mappings(mappings).readyCount((int) ready).missingCount((int) missing)
            .build();
    }

    private List<String> buildWarnings(List<KycField> fields, Client client) {
        List<String> w = new ArrayList<>();
        long crits = fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.CRITICAL).count();
        if (crits > 0) w.add(crits + " critical field(s) missing — bureau will reject this record.");
        fields.stream().filter(f -> f.getStatus() == KycField.KycStatus.WARN && f.getWarningNote() != null)
            .forEach(f -> w.add(f.getFieldName() + ": " + f.getWarningNote()));
        if (client.getEmail() != null && client.getEmail().matches(".*@(gmail|yahoo|hotmail|mail)\\..*"))
            w.add("Email uses free domain — lower identity confidence.");
        return w;
    }

    private String toMetro2Status(KycField.KycStatus s) {
        return switch (s) { case OK -> "mapped"; case CRITICAL -> "missing"; case MISSING -> "empty"; case WARN -> "check"; };
    }

    private String describeField(String f) {
        return switch (f) {
            case "K4_NAME" -> "Borrower full legal name";
            case "K4_DOB"  -> "Date of birth (YYYYMMDD)";
            case "K4_ID_NUMBER" -> "Government issued national ID";
            case "K4_ADDRESS_1" -> "Primary street address";
            case "K4_CITY"   -> "City of residence";
            case "K4_POSTAL" -> "Postal / ZIP code";
            case "K4_PHONE"  -> "Primary phone number";
            case "K4_EMAIL"  -> "Email address (optional)";
            case "K4_GENDER" -> "Borrower gender code";
            case "K4_OPEN_DATE" -> "Account open date (YYYYMMDD)";
            default -> f;
        };
    }
}
