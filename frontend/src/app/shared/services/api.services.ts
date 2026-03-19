import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> { success: boolean; message: string; data: T; }

const BASE = environment.apiUrl;

// ─── Shared API helper ───────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  get<T>(path: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${BASE}${path}`).pipe(map(r => r.data));
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${BASE}${path}`, body).pipe(map(r => r.data));
  }
}

// ─── KYC Service ─────────────────────────────────────────────────────────────
export interface KycScoreResponse {
  clientId: number; clientName: string; fineractClientId: string;
  completenessScore: number; totalFields: number; okFields: number;
  warnFields: number; criticalFields: number; missingFields: number;
  readinessLevel: string; readinessLabel: string;
  fields: KycFieldDto[]; warnings: string[];
}
export interface KycFieldDto {
  fieldName: string; fineractField: string; bureauField: string;
  fieldValue: string; status: string; warningNote: string;
}
export interface Metro2PreviewResponse {
  clientId: number; clientName: string;
  mappings: Metro2FieldMapping[]; readyCount: number; missingCount: number;
}
export interface Metro2FieldMapping {
  fineractField: string; bureauField: string; bureauFieldDescription: string;
  value: string; status: string; required: boolean;
}

@Injectable({ providedIn: 'root' })
export class KycService {
  private api = inject(ApiService);
  getScore(clientId: number): Observable<KycScoreResponse> {
    return this.api.get<KycScoreResponse>(`/kyc/${clientId}/score`);
  }
  getMetro2Preview(clientId: number): Observable<Metro2PreviewResponse> {
    return this.api.get<Metro2PreviewResponse>(`/kyc/${clientId}/metro2-preview`);
  }
}

// ─── Submission Service ───────────────────────────────────────────────────────
export interface SubmissionSummaryResponse {
  totalSubmissions: number; accepted: number; rejected: number;
  partial: number; pending: number;
  recentSubmissions: SubmissionDto[];
  nextScheduledDate: string; lastSubmissionDate: string;
}
export interface SubmissionDto {
  id: number; clientName: string; fineractClientId: string;
  batchReference: string; submissionDate: string; reportingPeriod: string;
  status: string; totalRecords: number; acceptedRecords: number; rejectedRecords: number;
  submittedBy: string; feedbacks: BureauFeedbackDto[];
}
export interface BureauFeedbackDto {
  id: number; errorCode: string; errorCategory: string; errorMessage: string;
  affectedField: string; severity: string; resolved: boolean; createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private api = inject(ApiService);
  getSummary(): Observable<SubmissionSummaryResponse> {
    return this.api.get<SubmissionSummaryResponse>('/submissions');
  }
  getByClient(clientId: number): Observable<SubmissionDto[]> {
    return this.api.get<SubmissionDto[]>(`/submissions/client/${clientId}`);
  }
  triggerSubmission(clientId: number): Observable<SubmissionDto> {
    return this.api.post<SubmissionDto>(`/submissions/${clientId}/submit`, {});
  }
}

// ─── Bureau Monitor Service ───────────────────────────────────────────────────
export interface BureauMonitorResponse {
  clientId: number; clientName: string; matchConfidence: string;
  matchScore: number; bureauStatus: string; bureauId: string;
  lastReportedDate: string; retentionYears: number;
  closureDate: string; negativeCountdownMonths: number;
  unresolvedFeedbacks: BureauFeedbackDto[];
}

@Injectable({ providedIn: 'root' })
export class BureauMonitorService {
  private api = inject(ApiService);
  getMonitorData(clientId: number): Observable<BureauMonitorResponse> {
    return this.api.get<BureauMonitorResponse>(`/bureau/monitor/${clientId}`);
  }
}

// ─── Insights Service ─────────────────────────────────────────────────────────
export interface InsightsResponse {
  clientId: number; clientName: string;
  inquiries: InquiryDto[]; hardInquiryCount: number; softInquiryCount: number;
  alerts: AlertDto[]; unacknowledgedAlerts: number;
}
export interface InquiryDto {
  id: number; inquiryType: string; inquirySource: string;
  purpose: string; inquiryDate: string;
}
export interface AlertDto {
  id: number; alertType: string; severity: string;
  title: string; description: string; acknowledged: boolean; createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InsightsService {
  private api = inject(ApiService);
  getInsights(clientId: number): Observable<InsightsResponse> {
    return this.api.get<InsightsResponse>(`/insights/${clientId}`);
  }
}

// ─── Dispute Service ──────────────────────────────────────────────────────────
export interface DisputeDto {
  id: number; clientName: string; fineractClientId: string; caseReference: string;
  disputeType: string; status: string; description: string;
  institutionValue: string; bureauValue: string; disputedField: string;
  resolutionNotes: string; assignedTo: string;
  openedAt: string; resolvedAt: string; auditTrail: DisputeAuditDto[];
}
export interface DisputeAuditDto {
  action: string; oldStatus: string; newStatus: string;
  notes: string; performedBy: string; performedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DisputeService {
  private api = inject(ApiService);
  getAllDisputes(): Observable<DisputeDto[]> {
    return this.api.get<DisputeDto[]>('/disputes');
  }
  getByClient(clientId: number): Observable<DisputeDto[]> {
    return this.api.get<DisputeDto[]>(`/disputes/client/${clientId}`);
  }
  getById(id: number): Observable<DisputeDto> {
    return this.api.get<DisputeDto>(`/disputes/${id}`);
  }
  resolve(id: number, payload: { resolutionNotes: string; newStatus: string }): Observable<DisputeDto> {
    return this.api.post<DisputeDto>(`/disputes/${id}/resolve`, payload);
  }
}

// ─── Client Service ───────────────────────────────────────────────────────────
export interface ClientSummaryDto {
  id: number; fineractClientId: string; fullName: string;
  city: string; accountStatus: string; activationDate: string;
}

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private api = inject(ApiService);
  getAll(): Observable<ClientSummaryDto[]> {
    return this.api.get<ClientSummaryDto[]>('/clients');
  }
  getById(id: number): Observable<ClientSummaryDto> {
    return this.api.get<ClientSummaryDto>(`/clients/${id}`);
  }
}
