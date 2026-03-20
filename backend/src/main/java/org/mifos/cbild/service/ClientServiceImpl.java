package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mifos.cbild.dto.ClientSummaryDto;
import org.mifos.cbild.dto.ClientDetailDto;
import org.mifos.cbild.dto.CreateClientRequest;
import org.mifos.cbild.dto.ValidationWarning;
import org.mifos.cbild.model.Client;
import org.mifos.cbild.model.KycField;
import org.mifos.cbild.repository.ClientRepository;
import org.mifos.cbild.repository.KycFieldRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientServiceImpl implements ClientService {
    private final ClientRepository clientRepository;
    private final KycFieldRepository kycFieldRepository;
    private final AuditService auditService;

    @Override
    public List<ClientSummaryDto> getAllClients() {
        return clientRepository.findAll().stream()
            .map(this::toSummary)
            .collect(Collectors.toList());
    }

    @Override
    public ClientSummaryDto getById(Long id) {
        return clientRepository.findById(id)
            .map(this::toSummary)
            .orElseThrow(() -> new RuntimeException("Client not found: " + id));
    }

    @Override
    public ClientDetailDto getDetailedClient(Long id) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client not found: " + id));
        return toDetailDto(client);
    }

    @Override
    @Transactional
    public ClientDetailDto createClient(CreateClientRequest request) {
        // Validate inputs
        List<ValidationWarning> warnings = validateClientData(request);
        
        // Check for duplicate Fineract ID
        if (clientRepository.findByFineractClientId(request.getFineractClientId()).isPresent()) {
            throw new RuntimeException("Client with ID " + request.getFineractClientId() + " already exists");
        }

        // Create new client
        Client client = Client.builder()
            .fineractClientId(request.getFineractClientId())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .dateOfBirth(request.getDateOfBirth())
            .gender(request.getGender() != null ? Client.Gender.valueOf(request.getGender()) : null)
            .nationalId(request.getNationalId())
            .mobileNo(request.getMobileNo())
            .email(request.getEmail())
            .addressLine1(request.getAddressLine1())
            .addressLine2(request.getAddressLine2())
            .city(request.getCity())
            .state(request.getState())
            .postalCode(request.getPostalCode())
            .country(request.getCountry() != null ? request.getCountry() : "IN")
            .activationDate(request.getActivationDate())
            .accountStatus(Client.AccountStatus.ACTIVE)
            .build();

        client = clientRepository.save(client);
        log.info("Created client: {}", client.getId());

        // Initialize KYC fields
        initializeKycFields(client);

        // Log audit
        auditService.log("CLIENT", client.getId(), "CLIENT_CREATED",
            "New client created: " + client.getFirstName() + " " + client.getLastName());

        return toDetailDto(client);
    }

    @Override
    @Transactional
    public ClientDetailDto updateClient(Long id, CreateClientRequest request) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client not found: " + id));

        // Validate inputs
        validateClientData(request);

        // Update fields
        client.setFirstName(request.getFirstName());
        client.setLastName(request.getLastName());
        client.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) {
            client.setGender(Client.Gender.valueOf(request.getGender()));
        }
        client.setNationalId(request.getNationalId());
        client.setMobileNo(request.getMobileNo());
        client.setEmail(request.getEmail());
        client.setAddressLine1(request.getAddressLine1());
        client.setAddressLine2(request.getAddressLine2());
        client.setCity(request.getCity());
        client.setState(request.getState());
        client.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) {
            client.setCountry(request.getCountry());
        }
        client.setActivationDate(request.getActivationDate());
        if (request.getAccountStatus() != null) {
            client.setAccountStatus(Client.AccountStatus.valueOf(request.getAccountStatus()));
        }

        client = clientRepository.save(client);
        
        // Update KYC fields
        updateKycFields(client);

        auditService.log("CLIENT", id, "CLIENT_UPDATED", 
            "Client updated: " + client.getFirstName() + " " + client.getLastName());

        return toDetailDto(client);
    }

    @Override
    @Transactional
    public void deleteClient(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client not found: " + id);
        }
        clientRepository.deleteById(id);
        auditService.log("CLIENT", id, "CLIENT_DELETED", "Client deleted");
    }

    @Override
    public List<ClientSummaryDto> searchClients(String query) {
        return clientRepository.searchByName(query).stream()
            .map(this::toSummary)
            .collect(Collectors.toList());
    }

    @Override
    public List<ValidationWarning> validateClientData(CreateClientRequest request) {
        List<ValidationWarning> warnings = new ArrayList<>();

        // Name validation
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            warnings.add(ValidationWarning.ofHigh("First Name", "First name is missing", "Enter client's first name"));
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            warnings.add(ValidationWarning.ofHigh("Last Name", "Last name is missing", "Enter client's last name"));
        }

        // DOB validation
        if (request.getDateOfBirth() == null) {
            warnings.add(ValidationWarning.ofHigh("Date of Birth", "DOB is missing - required for Metro 2 submission", 
                "Collect date of birth from client"));
        } else {
            LocalDate now = LocalDate.now();
            if (request.getDateOfBirth().isAfter(now)) {
                warnings.add(ValidationWarning.ofHigh("Date of Birth", "DOB is in the future", "Verify and correct DOB"));
            }
            if (request.getDateOfBirth().isBefore(now.minusYears(150))) {
                warnings.add(ValidationWarning.ofMedium("Date of Birth", "Unusually old DOB - possible data entry error", 
                    "Verify DOB accuracy"));
            }
        }

        // National ID validation
        if (request.getNationalId() == null || request.getNationalId().trim().isEmpty()) {
            warnings.add(ValidationWarning.ofHigh("National ID", "National ID missing - blocks bureau submission", 
                "Collect national ID (PAN/Aadhaar/DL) from client"));
        }

        // Address validation
        if (request.getAddressLine1() == null || request.getAddressLine1().trim().isEmpty()) {
            warnings.add(ValidationWarning.ofHigh("Address", "Address line 1 is missing", "Collect complete address"));
        }

        if (request.getCity() == null || request.getCity().trim().isEmpty()) {
            warnings.add(ValidationWarning.ofHigh("City", "City is missing", "Enter client's city"));
        }

        if (request.getPostalCode() == null || request.getPostalCode().trim().isEmpty()) {
            warnings.add(ValidationWarning.ofHigh("Postal Code", "Postal code missing - required for Metro 2", 
                "Collect 6-digit postal code"));
        }

        // Email validation
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (request.getEmail().contains("@")) {
                String domain = request.getEmail().substring(request.getEmail().indexOf("@") + 1);
                if (domain.matches("^(gmail|yahoo|hotmail|outlook|test)\\..*")) {
                    warnings.add(ValidationWarning.ofMedium("Email", "Free email domain used - lower identity confidence", 
                        "Prefer official/work email if available"));
                }
            }
        }

        // Phone validation
        if (request.getMobileNo() == null || request.getMobileNo().trim().isEmpty()) {
            warnings.add(ValidationWarning.ofMedium("Mobile Number", "Mobile number missing - helpful for identity matching", 
                "Collect contact number"));
        }

        return warnings;
    }

    private void initializeKycFields(Client client) {
        // Create default KYC field records for new client
        String fullName = client.getFirstName() + " " + client.getLastName();
        
        createKycField(client, "Full Name", "firstName + lastName", "K4_NAME", 
            fullName, client.getFirstName() != null && !client.getFirstName().isEmpty() ? "OK" : "MISSING", null);
        
        createKycField(client, "Date of Birth", "dateOfBirth", "K4_DOB",
            client.getDateOfBirth() != null ? client.getDateOfBirth().toString() : null,
            client.getDateOfBirth() != null ? "OK" : "CRITICAL", 
            client.getDateOfBirth() == null ? "Required for Metro 2 submission" : null);
        
        createKycField(client, "National ID", "externalId", "K4_ID_NUMBER",
            client.getNationalId(),
            client.getNationalId() != null && !client.getNationalId().isEmpty() ? "OK" : "CRITICAL",
            client.getNationalId() == null ? "Missing — blocks bureau submission" : null);
        
        createKycField(client, "Address Line 1", "addressLine1", "K4_ADDRESS_1",
            client.getAddressLine1(),
            client.getAddressLine1() != null ? "OK" : "CRITICAL", null);
        
        createKycField(client, "City", "city", "K4_CITY",
            client.getCity(),
            client.getCity() != null ? "OK" : "MISSING", null);
        
        createKycField(client, "Postal Code", "postalCode", "K4_POSTAL",
            client.getPostalCode(),
            client.getPostalCode() != null && !client.getPostalCode().isEmpty() ? "OK" : "CRITICAL",
            client.getPostalCode() == null ? "Required field" : null);
        
        createKycField(client, "Mobile Number", "mobileNo", "K4_PHONE",
            client.getMobileNo(),
            client.getMobileNo() != null ? "OK" : "MISSING", null);
        
        createKycField(client, "Email", "email", "K4_EMAIL",
            client.getEmail(),
            client.getEmail() != null ? "OK" : "MISSING", null);
        
        if (client.getGender() != null) {
            createKycField(client, "Gender", "gender", "K4_GENDER",
                client.getGender().name(), "OK", null);
        }
        
        createKycField(client, "Account Opened", "activationDate", "K4_OPEN_DATE",
            client.getActivationDate() != null ? client.getActivationDate().toString() : null,
            client.getActivationDate() != null ? "OK" : "MISSING", null);
    }

    private void updateKycFields(Client client) {
        List<KycField> existingFields = kycFieldRepository.findByClientId(client.getId());
        
        // Update existing fields
        for (KycField field : existingFields) {
            String newValue = null;
            String newStatus = "OK";
            
            switch (field.getFieldName()) {
                case "Full Name":
                    newValue = client.getFirstName() + " " + client.getLastName();
                    break;
                case "Date of Birth":
                    newValue = client.getDateOfBirth() != null ? client.getDateOfBirth().toString() : null;
                    newStatus = newValue != null ? "OK" : "CRITICAL";
                    break;
                case "National ID":
                    newValue = client.getNationalId();
                    newStatus = newValue != null && !newValue.isEmpty() ? "OK" : "CRITICAL";
                    break;
                case "Address Line 1":
                    newValue = client.getAddressLine1();
                    break;
                case "City":
                    newValue = client.getCity();
                    break;
                case "Postal Code":
                    newValue = client.getPostalCode();
                    newStatus = newValue != null && !newValue.isEmpty() ? "OK" : "CRITICAL";
                    break;
                case "Mobile Number":
                    newValue = client.getMobileNo();
                    break;
                case "Email":
                    newValue = client.getEmail();
                    break;
                case "Gender":
                    newValue = client.getGender() != null ? client.getGender().name() : null;
                    break;
                case "Account Opened":
                    newValue = client.getActivationDate() != null ? client.getActivationDate().toString() : null;
                    break;
            }
            
            if (newValue != null) {
                field.setFieldValue(newValue);
                field.setStatus(KycField.KycStatus.valueOf(newStatus));
                kycFieldRepository.save(field);
            }
        }
    }

    private void createKycField(Client client, String fieldName, String fineractField, String bureauField, 
                                 String value, String status, String warningNote) {
        KycField field = KycField.builder()
            .client(client)
            .fieldName(fieldName)
            .fineractField(fineractField)
            .bureauField(bureauField)
            .fieldValue(value)
            .status(KycField.KycStatus.valueOf(status))
            .warningNote(warningNote)
            .build();
        kycFieldRepository.save(field);
    }

    private ClientSummaryDto toSummary(Client c) {
        return ClientSummaryDto.builder()
            .id(c.getId())
            .fineractClientId(c.getFineractClientId())
            .fullName(c.getFirstName() + " " + c.getLastName())
            .city(c.getCity())
            .accountStatus(c.getAccountStatus() != null ? c.getAccountStatus().name() : null)
            .activationDate(c.getActivationDate())
            .build();
    }

    private ClientDetailDto toDetailDto(Client c) {
        List<KycField> kycFields = kycFieldRepository.findByClientId(c.getId());
        
        int totalFields = kycFields.size();
        int okFields = (int) kycFields.stream()
            .filter(f -> f.getStatus() == KycField.KycStatus.OK).count();
        
        int completeness = totalFields > 0 ? Math.round((okFields * 100) / totalFields) : 0;
        String readiness = completeness >= 90 ? "HIGH" : completeness >= 65 ? "MEDIUM" : "LOW";
        String bureauReadiness = completeness >= 90 ? "Ready" : completeness >= 65 ? "Partial" : "Not Ready";

        return ClientDetailDto.builder()
            .id(c.getId())
            .fineractClientId(c.getFineractClientId())
            .firstName(c.getFirstName())
            .lastName(c.getLastName())
            .fullName(c.getFirstName() + " " + c.getLastName())
            .dateOfBirth(c.getDateOfBirth())
            .gender(c.getGender() != null ? c.getGender().name() : null)
            .nationalId(c.getNationalId())
            .mobileNo(c.getMobileNo())
            .email(c.getEmail())
            .addressLine1(c.getAddressLine1())
            .addressLine2(c.getAddressLine2())
            .city(c.getCity())
            .state(c.getState())
            .postalCode(c.getPostalCode())
            .country(c.getCountry())
            .activationDate(c.getActivationDate())
            .accountStatus(c.getAccountStatus() != null ? c.getAccountStatus().name() : null)
            .createdAt(c.getCreatedAt())
            .updatedAt(c.getUpdatedAt())
            .kycCompleteness(completeness)
            .kycReadinessLevel(readiness)
            .bureauReadiness(bureauReadiness)
            .build();
    }
}
