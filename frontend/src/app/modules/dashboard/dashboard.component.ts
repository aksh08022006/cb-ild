import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { SubmissionService, SubmissionSummaryResponse } from '../../shared/services/api.services';

@Component({
  selector: 'app-submission-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatChipsModule, MatIconModule,
            MatButtonModule, MatProgressBarModule, MatExpansionModule, MatBadgeModule],
  template: `
    <div class="page-header">
      <div>
        <h2><mat-icon class="header-icon">send</mat-icon> Submission Dashboard</h2>
        <p>Module 2 — Data Submission (Institution to Bureau)</p>
      </div>
    </div>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <ng-container *ngIf="summary">
      <div class="metrics-grid">
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Total Submissions</div>
            <div class="metric-value primary">{{summary.totalSubmissions}}</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Accepted</div>
            <div class="metric-value success">{{summary.accepted}}</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Rejected</div>
            <div class="metric-value danger">{{summary.rejected}}</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Partial</div>
            <div class="metric-value warn">{{summary.partial}}</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Last Submitted</div>
            <div class="metric-date">{{summary.lastSubmissionDate}}</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Next Scheduled</div>
            <div class="metric-date">{{summary.nextScheduledDate}}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="cycle-card">
        <mat-card-header>
          <mat-card-title>Reporting Cycle Tracker</mat-card-title>
          <mat-card-subtitle>Monthly default submission schedule</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="cycle-months">
            <div *ngFor="let m of months" class="month-cell"
                 [class.month-submitted]="m.submitted" [class.month-current]="m.current">
              <div class="month-name">{{m.name}}</div>
              <mat-icon>{{m.submitted ? 'check_circle' : m.current ? 'schedule' : 'radio_button_unchecked'}}</mat-icon>
              <div class="month-status">{{m.submitted ? 'Done' : m.current ? 'Due' : 'Pending'}}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Recent Submissions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="summary.recentSubmissions" class="full-width">
            <ng-container matColumnDef="batch">
              <th mat-header-cell *matHeaderCellDef>Batch Reference</th>
              <td mat-cell *matCellDef="let s"><code>{{s.batchReference}}</code></td>
            </ng-container>
            <ng-container matColumnDef="client">
              <th mat-header-cell *matHeaderCellDef>Client</th>
              <td mat-cell *matCellDef="let s">{{s.clientName}}</td>
            </ng-container>
            <ng-container matColumnDef="period">
              <th mat-header-cell *matHeaderCellDef>Period</th>
              <td mat-cell *matCellDef="let s">{{s.reportingPeriod}}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Submitted</th>
              <td mat-cell *matCellDef="let s">{{s.submissionDate | date:'yyyy-MM-dd'}}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let s">
                <mat-chip [color]="getStatusColor(s.status)" selected>{{s.status}}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="accepted">
              <th mat-header-cell *matHeaderCellDef>Accepted</th>
              <td mat-cell *matCellDef="let s">
                <span class="accepted-count">{{s.acceptedRecords}}/{{s.totalRecords}}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card class="rejections-card" *ngIf="rejectedSubmissions.length > 0">
        <mat-card-header>
          <mat-icon mat-card-avatar color="warn">error</mat-icon>
          <mat-card-title>Common Rejection Reasons</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-accordion>
            <mat-expansion-panel *ngFor="let s of rejectedSubmissions">
              <mat-expansion-panel-header>
                <mat-panel-title>{{s.batchReference}}</mat-panel-title>
                <mat-panel-description>{{s.feedbacks?.length || 0}} error(s)</mat-panel-description>
              </mat-expansion-panel-header>
              <div *ngFor="let f of s.feedbacks" class="feedback-item"
                   [class]="'feedback-'+f.severity.toLowerCase()">
                <strong>{{f.errorCode}}</strong> — {{f.errorCategory}}
                <p>{{f.errorMessage}}</p>
                <small>Field: {{f.affectedField}}</small>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card-content>
      </mat-card>
    </ng-container>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    .page-header h2 { display:flex; align-items:center; gap:8px; margin:0; color:#1565C0; }
    .page-header p  { margin:4px 0 0; color:#666; }
    .header-icon { font-size:1.5rem; }
    .metrics-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:1rem; margin-bottom:1.5rem; }
    .metric-card mat-card-content { padding:1rem !important; }
    .metric-label { font-size:12px; color:#666; margin-bottom:6px; }
    .metric-value { font-size:1.8rem; font-weight:600; }
    .metric-value.primary { color:#1565C0; }
    .metric-value.success { color:#2E7D32; }
    .metric-value.danger  { color:#c62828; }
    .metric-value.warn    { color:#E65100; }
    .metric-date { font-size:1rem; font-weight:500; color:#333; }
    .cycle-card { margin-bottom:1rem; }
    .cycle-months { display:flex; gap:8px; flex-wrap:wrap; margin-top:1rem; }
    .month-cell { text-align:center; padding:8px 12px; border-radius:8px; background:#F5F5F5; min-width:60px; }
    .month-submitted { background:#E8F5E9; color:#2E7D32; }
    .month-current   { background:#E3F2FD; color:#1565C0; }
    .month-name   { font-size:11px; font-weight:500; margin-bottom:4px; }
    .month-status { font-size:10px; margin-top:4px; }
    .full-width { width:100%; }
    code { background:#F5F5F5; padding:2px 5px; border-radius:3px; font-size:11px; }
    .accepted-count { font-weight:500; }
    .rejections-card { margin-top:1rem; }
    .feedback-item { padding:8px; border-radius:6px; margin-bottom:8px; font-size:13px; }
    .feedback-error   { background:#FFEBEE; border-left:3px solid #F44336; }
    .feedback-warning { background:#FFF3E0; border-left:3px solid #FF9800; }
    .feedback-item p  { margin:4px 0; color:#555; }
    .feedback-item small { color:#999; }
  `]
})
export class SubmissionDashboardComponent implements OnInit {
  private svc = inject(SubmissionService);
  summary: SubmissionSummaryResponse | null = null;
  loading = true;
  cols = ['batch','client','period','date','status','accepted'];
  months = [
    {name:'Jan',submitted:true,current:false},{name:'Feb',submitted:true,current:false},
    {name:'Mar',submitted:true,current:false},{name:'Apr',submitted:false,current:true},
    {name:'May',submitted:false,current:false},{name:'Jun',submitted:false,current:false},
    {name:'Jul',submitted:false,current:false},{name:'Aug',submitted:false,current:false},
    {name:'Sep',submitted:false,current:false},{name:'Oct',submitted:false,current:false},
    {name:'Nov',submitted:false,current:false},{name:'Dec',submitted:false,current:false},
  ];

  get rejectedSubmissions() {
    return (this.summary?.recentSubmissions || [])
      .filter(s => s.status === 'REJECTED' || s.status === 'PARTIAL');
  }

  ngOnInit() {
    this.svc.getSummary().subscribe({
      next: d => { this.summary = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getStatusColor(s: string): string {
    return s === 'ACCEPTED' ? 'primary' : s === 'REJECTED' ? 'warn' : 'accent';
  }
}