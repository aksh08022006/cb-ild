import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { BureauMonitorService, BureauMonitorResponse,
         InsightsService, InsightsResponse,
         DisputeService, DisputeDto } from '../shared/services/api.services';

@Component({
  selector: 'app-bureau-monitor',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatChipsModule, MatIconModule,
            MatButtonModule, MatProgressBarModule, MatListModule, MatDividerModule, MatTableModule],
  template: `
    <div class="page-header">
      <div>
        <h2><mat-icon class="header-icon">monitor</mat-icon> Bureau Processing Monitor</h2>
        <p>Module 3 — Bureau Processing and Data Management</p>
      </div>
      <a mat-stroked-button routerLink="/dashboard/clients"><mat-icon>arrow_back</mat-icon> Back</a>
    </div>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <ng-container *ngIf="data">
      <div class="two-col">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{data.clientName}}</mat-card-title>
            <mat-card-subtitle>Bureau Identity Match</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="match-confidence" [class]="'conf-'+data.matchConfidence.toLowerCase()">
              <mat-icon class="conf-icon">{{getConfIcon(data.matchConfidence)}}</mat-icon>
              <div>
                <div class="conf-label">Match Confidence</div>
                <div class="conf-value">{{data.matchConfidence}}</div>
                <div class="conf-score" *ngIf="data.matchScore">Score: {{data.matchScore}}%</div>
              </div>
            </div>
            <mat-divider></mat-divider>
            <mat-list dense>
              <mat-list-item>
                <mat-icon matListItemIcon>fingerprint</mat-icon>
                <span matListItemTitle>Bureau ID</span>
                <span matListItemLine>{{data.bureauId || 'Not assigned'}}</span>
              </mat-list-item>
              <mat-list-item>
                <mat-icon matListItemIcon>flag</mat-icon>
                <span matListItemTitle>Bureau Status</span>
                <mat-chip [color]="getStatusColor(data.bureauStatus)" selected>{{data.bureauStatus}}</mat-chip>
              </mat-list-item>
              <mat-list-item>
                <mat-icon matListItemIcon>calendar_today</mat-icon>
                <span matListItemTitle>Last Reported</span>
                <span matListItemLine>{{data.lastReportedDate || 'Never'}}</span>
              </mat-list-item>
              <mat-list-item>
                <mat-icon matListItemIcon>history</mat-icon>
                <span matListItemTitle>Retention Period</span>
                <span matListItemLine>{{data.retentionYears}} years</span>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar color="warn">feedback</mat-icon>
            <mat-card-title>Bureau Validation Feedback</mat-card-title>
            <mat-card-subtitle>{{data.unresolvedFeedbacks.length}} unresolved issue(s)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="data.unresolvedFeedbacks.length===0" class="no-issues">
              <mat-icon color="primary">check_circle</mat-icon>
              <span>No unresolved bureau feedback</span>
            </div>
            <div *ngFor="let f of data.unresolvedFeedbacks" class="feedback-item"
                 [class]="'sev-'+f.severity.toLowerCase()">
              <div class="fb-header">
                <strong>{{f.errorCode}}</strong>
                <mat-chip color="warn" selected style="font-size:10px">{{f.severity}}</mat-chip>
              </div>
              <div class="fb-category">{{f.errorCategory}}</div>
              <div class="fb-msg">{{f.errorMessage}}</div>
              <small>Affected field: <code>{{f.affectedField}}</code></small>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="retention-card">
        <mat-card-header>
          <mat-card-title>Data Retention and Status Timeline</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="retention-bar">
            <div class="ret-label">Account Status: <strong>{{data.bureauStatus}}</strong></div>
            <div class="ret-track">
              <div class="ret-fill" [style.width]="getRetentionPct()+'%'"
                   [class]="'ret-'+data.bureauStatus.toLowerCase()"></div>
            </div>
            <div class="ret-info">Retention: {{data.retentionYears}} years from last activity</div>
          </div>
        </mat-card-content>
      </mat-card>
    </ng-container>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    .page-header h2 { display:flex; align-items:center; gap:8px; margin:0; color:#1565C0; }
    .page-header p  { margin:4px 0 0; color:#666; }
    .header-icon { font-size:1.5rem; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
    .match-confidence { display:flex; align-items:center; gap:12px; padding:1rem; border-radius:8px; margin-bottom:1rem; }
    .conf-high   { background:#E8F5E9; }
    .conf-medium { background:#FFF8E1; }
    .conf-low    { background:#FFEBEE; }
    .conf-icon   { font-size:2.5rem; }
    .conf-high .conf-icon   { color:#2E7D32; }
    .conf-medium .conf-icon { color:#F57F17; }
    .conf-low .conf-icon    { color:#B71C1C; }
    .conf-label { font-size:12px; color:#666; }
    .conf-value { font-size:1.4rem; font-weight:600; }
    .conf-score { font-size:12px; color:#888; }
    .no-issues  { display:flex; align-items:center; gap:8px; color:#388E3C; padding:1rem; }
    .feedback-item { padding:10px; border-radius:6px; margin-bottom:8px; }
    .sev-error   { background:#FFEBEE; border-left:3px solid #F44336; }
    .sev-warning { background:#FFF3E0; border-left:3px solid #FF9800; }
    .fb-header   { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
    .fb-category { font-size:12px; color:#555; margin-bottom:4px; }
    .fb-msg      { font-size:13px; }
    code         { background:#F5F5F5; padding:1px 4px; border-radius:3px; font-size:11px; }
    .retention-card { margin-top:1rem; }
    .ret-track   { height:12px; background:#E0E0E0; border-radius:6px; overflow:hidden; margin:8px 0; }
    .ret-fill    { height:100%; border-radius:6px; }
    .ret-active  { background:#1565C0; }
    .ret-closed  { background:#9E9E9E; }
    .ret-negative { background:#c62828; }
    .ret-info    { font-size:12px; color:#888; }
  `]
})
export class BureauMonitorComponent implements OnInit {
  @Input() clientId!: string;
  private svc = inject(BureauMonitorService);
  data: BureauMonitorResponse | null = null;
  loading = true;

  ngOnInit() {
    this.svc.getMonitorData(Number(this.clientId)).subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
  getConfIcon(c: string) {
    return c === 'HIGH' ? 'verified' : c === 'MEDIUM' ? 'help_outline' : 'error_outline';
  }
  getStatusColor(s: string) { return s === 'ACTIVE' ? 'primary' : 'warn'; }
  getRetentionPct() { return this.data ? Math.min(100, (2 / (this.data.retentionYears || 7)) * 100) : 0; }
}

@Component({
  selector: 'app-data-insights',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatChipsModule,
            MatIconModule, MatButtonModule, MatProgressBarModule, MatListModule, MatDividerModule],
  template: `
    <div class="page-header">
      <div>
        <h2><mat-icon class="header-icon">insights</mat-icon> Data Usage and Insights</h2>
        <p>Module 4 — Bureau Data Consumption and Monitoring Alerts</p>
      </div>
      <a mat-stroked-button routerLink="/dashboard/clients"><mat-icon>arrow_back</mat-icon> Back</a>
    </div>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <ng-container *ngIf="data">
      <div class="metrics-grid">
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Hard Inquiries</div>
            <div class="metric-value danger">{{data.hardInquiryCount}}</div>
            <small>Impact credit score</small>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Soft Inquiries</div>
            <div class="metric-value primary">{{data.softInquiryCount}}</div>
            <small>No score impact</small>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Unread Alerts</div>
            <div class="metric-value" [class]="data.unacknowledgedAlerts>0?'danger':'primary'">
              {{data.unacknowledgedAlerts}}
            </div>
            <small>Need attention</small>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="two-col">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Inquiry Log</mat-card-title>
            <mat-card-subtitle>{{data.clientName}}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="data.inquiries" class="full-width">
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let i">
                  <mat-chip [color]="i.inquiryType==='HARD'?'warn':'primary'" selected style="font-size:11px">
                    {{i.inquiryType}}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="source">
                <th mat-header-cell *matHeaderCellDef>Source</th>
                <td mat-cell *matCellDef="let i">{{i.inquirySource}}</td>
              </ng-container>
              <ng-container matColumnDef="purpose">
                <th mat-header-cell *matHeaderCellDef>Purpose</th>
                <td mat-cell *matCellDef="let i">{{i.purpose}}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let i">{{i.inquiryDate}}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="inquiryCols"></tr>
              <tr mat-row *matRowDef="let row; columns: inquiryCols;"></tr>
            </table>
            <div *ngIf="data.inquiries.length===0" class="empty-state">No inquiries on record.</div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Monitoring Alerts</mat-card-title>
            <mat-card-subtitle>{{data.unacknowledgedAlerts}} unacknowledged</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="data.alerts.length===0" class="empty-state">No alerts.</div>
            <div *ngFor="let a of data.alerts" class="alert-item" [class]="'sev-'+a.severity.toLowerCase()">
              <div class="alert-header">
                <mat-icon [color]="a.severity==='HIGH'?'warn':'accent'">
                  {{a.severity==='HIGH'?'priority_high':a.severity==='MEDIUM'?'warning':'info'}}
                </mat-icon>
                <strong>{{a.title}}</strong>
                <mat-chip *ngIf="!a.acknowledged" color="warn" selected style="font-size:10px;margin-left:auto">NEW</mat-chip>
              </div>
              <p>{{a.description}}</p>
              <small>{{a.alertType}} · {{a.createdAt | date:'yyyy-MM-dd'}}</small>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </ng-container>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    .page-header h2 { display:flex; align-items:center; gap:8px; margin:0; color:#1565C0; }
    .page-header p  { margin:4px 0 0; color:#666; }
    .header-icon { font-size:1.5rem; }
    .metrics-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; }
    .metric-card mat-card-content { padding:1rem !important; }
    .metric-label { font-size:12px; color:#666; margin-bottom:6px; }
    .metric-value { font-size:2rem; font-weight:600; }
    .metric-value.primary { color:#1565C0; }
    .metric-value.danger  { color:#c62828; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .full-width { width:100%; }
    .alert-item { padding:10px; border-radius:6px; margin-bottom:8px; }
    .sev-high   { background:#FFEBEE; border-left:3px solid #F44336; }
    .sev-medium { background:#FFF3E0; border-left:3px solid #FF9800; }
    .sev-low    { background:#E8F5E9; border-left:3px solid #4CAF50; }
    .alert-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .alert-item p { margin:4px 0; font-size:13px; color:#555; }
    .alert-item small { color:#999; font-size:11px; }
    .empty-state { color:#999; padding:1rem; text-align:center; }
  `]
})
export class DataInsightsComponent implements OnInit {
  @Input() clientId!: string;
  private svc = inject(InsightsService);
  data: InsightsResponse | null = null;
  loading = true;
  inquiryCols = ['type','source','purpose','date'];

  ngOnInit() {
    this.svc.getInsights(Number(this.clientId)).subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-dispute-resolution',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatCardModule, MatTableModule,
            MatChipsModule, MatIconModule, MatButtonModule, MatProgressBarModule,
            MatListModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="page-header">
      <div>
        <h2><mat-icon class="header-icon">gavel</mat-icon> Dispute Resolution</h2>
        <p>Module 5 — Dispute Case Manager and Audit Trail</p>
      </div>
    </div>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <div class="disputes-layout" *ngIf="!loading">
      <mat-card class="disputes-list-card">
        <mat-card-header>
          <mat-card-title>All Disputes</mat-card-title>
          <mat-card-subtitle>{{disputes.length}} total</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngFor="let d of disputes" class="dispute-row"
               [class.selected]="selectedDispute?.id===d.id"
               (click)="selectDispute(d)">
            <div class="disp-ref">{{d.caseReference}}</div>
            <div class="disp-client">{{d.clientName}}</div>
            <div class="disp-type">{{d.disputeType.replace('_',' ')}}</div>
            <mat-chip [color]="getDisputeColor(d.status)" selected style="font-size:11px">
              {{d.status.replace('_',' ')}}
            </mat-chip>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="selectedDispute" class="dispute-detail">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{selectedDispute.caseReference}}</mat-card-title>
            <mat-card-subtitle>{{selectedDispute.clientName}}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="comparison-grid">
              <div class="comp-side institution">
                <div class="comp-label">Institution Record</div>
                <div class="comp-field">{{selectedDispute.disputedField}}</div>
                <div class="comp-value">{{selectedDispute.institutionValue}}</div>
              </div>
              <div class="comp-vs">
                <mat-icon>compare_arrows</mat-icon>
                <span>vs</span>
              </div>
              <div class="comp-side bureau">
                <div class="comp-label">Bureau Record</div>
                <div class="comp-field">{{selectedDispute.disputedField}}</div>
                <div class="comp-value">{{selectedDispute.bureauValue}}</div>
              </div>
            </div>
            <mat-divider></mat-divider>
            <p class="dispute-desc">{{selectedDispute.description}}</p>
            <div class="resolve-form" *ngIf="selectedDispute.status!=='RESOLVED'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Resolution Notes</mat-label>
                <textarea matInput [(ngModel)]="resolutionNotes" rows="3"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>New Status</mat-label>
                <mat-select [(ngModel)]="newStatus">
                  <mat-option value="UNDER_REVIEW">Under Review</mat-option>
                  <mat-option value="RESOLVED">Resolved</mat-option>
                  <mat-option value="REJECTED">Rejected</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="resolve()" [disabled]="!resolutionNotes">
                Update Dispute
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="audit-card">
          <mat-card-header>
            <mat-card-title>Audit Trail</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngFor="let a of selectedDispute.auditTrail; let i=index" class="audit-item">
              <div class="audit-line" *ngIf="i < selectedDispute.auditTrail.length-1"></div>
              <div class="audit-dot"></div>
              <div class="audit-body">
                <div class="audit-action">{{a.action}}</div>
                <div class="audit-change" *ngIf="a.oldStatus">{{a.oldStatus}} to {{a.newStatus}}</div>
                <div class="audit-notes">{{a.notes}}</div>
                <small>{{a.performedBy}} · {{a.performedAt | date:'yyyy-MM-dd HH:mm'}}</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!selectedDispute" class="no-selection">
        <mat-icon>gavel</mat-icon>
        <p>Select a dispute to view details and audit trail</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    .page-header h2 { display:flex; align-items:center; gap:8px; margin:0; color:#1565C0; }
    .page-header p  { margin:4px 0 0; color:#666; }
    .header-icon { font-size:1.5rem; }
    .disputes-layout { display:grid; grid-template-columns:320px 1fr; gap:1rem; }
    .disputes-list-card mat-card-content { padding:0 !important; }
    .dispute-row { padding:12px 16px; border-bottom:1px solid #F5F5F5; cursor:pointer; }
    .dispute-row:hover { background:#E3F2FD; }
    .dispute-row.selected { background:#BBDEFB; }
    .disp-ref    { font-size:12px; font-weight:600; color:#1565C0; }
    .disp-client { font-size:13px; font-weight:500; }
    .disp-type   { font-size:11px; color:#888; margin-bottom:4px; }
    .comparison-grid { display:grid; grid-template-columns:1fr auto 1fr; gap:1rem; align-items:center; margin:1rem 0; }
    .comp-side { padding:12px; border-radius:8px; text-align:center; }
    .institution { background:#E8F5E9; }
    .bureau      { background:#FFEBEE; }
    .comp-label  { font-size:11px; color:#888; margin-bottom:4px; }
    .comp-field  { font-size:12px; color:#555; }
    .comp-value  { font-size:1rem; font-weight:600; margin-top:4px; }
    .comp-vs     { display:flex; flex-direction:column; align-items:center; color:#888; }
    .dispute-desc { font-size:13px; color:#555; margin:1rem 0; }
    .resolve-form { display:flex; flex-wrap:wrap; gap:12px; align-items:flex-start; background:#F5F5F5; padding:1rem; border-radius:8px; margin-top:1rem; }
    .full-width  { width:100%; }
    .audit-card  { margin-top:1rem; }
    .audit-item  { display:flex; gap:12px; padding:8px 0; position:relative; }
    .audit-dot   { width:12px; height:12px; border-radius:50%; background:#1565C0; flex-shrink:0; margin-top:4px; }
    .audit-line  { position:absolute; left:5px; top:20px; bottom:-8px; width:2px; background:#E0E0E0; }
    .audit-action { font-weight:500; font-size:13px; }
    .audit-change { font-size:12px; color:#555; }
    .audit-notes  { font-size:12px; color:#777; }
    .audit-item small { color:#aaa; font-size:11px; }
    .no-selection { display:flex; flex-direction:column; align-items:center; justify-content:center; color:#BDBDBD; padding:3rem; }
    .no-selection mat-icon { font-size:3rem; height:3rem; width:3rem; }
  `]
})
export class DisputeResolutionComponent implements OnInit {
  private svc = inject(DisputeService);
  disputes: DisputeDto[] = [];
  selectedDispute: DisputeDto | null = null;
  loading = true;
  resolutionNotes = '';
  newStatus = 'UNDER_REVIEW';

  ngOnInit() {
    this.svc.getAllDisputes().subscribe({
      next: d => { this.disputes = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  selectDispute(d: DisputeDto) {
    this.svc.getById(d.id).subscribe(full => {
      this.selectedDispute = full;
      this.resolutionNotes = '';
    });
  }

  resolve() {
    if (!this.selectedDispute || !this.resolutionNotes) return;
    this.svc.resolve(this.selectedDispute.id, {
      resolutionNotes: this.resolutionNotes, newStatus: this.newStatus
    }).subscribe(updated => {
      this.selectedDispute = updated;
      this.disputes = this.disputes.map(d => d.id === updated.id ? updated : d);
    });
  }

  getDisputeColor(s: string): string {
    return s === 'RESOLVED' ? 'primary' : s === 'REJECTED' ? 'warn' : 'accent';
  }
}