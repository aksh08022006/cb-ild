import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { KycService, KycScoreResponse, Metro2PreviewResponse } from '../../shared/services/api.services';

@Component({
  selector: 'app-kyc-completeness',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatProgressBarModule, MatChipsModule,
            MatIconModule, MatButtonModule, MatTableModule, MatDividerModule,
            MatTooltipModule, MatBadgeModule],
  template: `
    <div class="page-header">
      <div>
        <h2>
          <mat-icon class="header-icon">verified_user</mat-icon>
          KYC Completeness & Bureau Readiness
        </h2>
        <p>Module 1 — Data Creation & Acquisition Dashboard</p>
      </div>
      <a mat-stroked-button routerLink="/dashboard/clients">
        <mat-icon>arrow_back</mat-icon> All Clients
      </a>
    </div>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <ng-container *ngIf="score">
      <div class="metrics-grid">
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Completeness Score</div>
            <div class="metric-value" [class]="getScoreClass(score.completenessScore)">
              {{score.completenessScore}}<small>/100</small>
            </div>
            <mat-progress-bar [value]="score.completenessScore"
              [color]="score.completenessScore>=90?'primary':score.completenessScore>=65?'accent':'warn'">
            </mat-progress-bar>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Fields Complete</div>
            <div class="metric-value primary">{{score.okFields}} / {{score.totalFields}}</div>
            <small class="metric-sub">fully verified fields</small>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Critical Gaps</div>
            <div class="metric-value" [class]="score.criticalFields>0?'danger':'primary'">
              {{score.criticalFields}}
            </div>
            <small class="metric-sub">blocks submission</small>
          </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-label">Bureau Readiness</div>
            <mat-chip [color]="getReadinessColor(score.readinessLevel)" selected class="readiness-chip">
              {{score.readinessLevel}}
            </mat-chip>
            <small class="metric-sub">{{score.readinessLabel}}</small>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="two-col">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{score.clientName}}</mat-card-title>
            <mat-card-subtitle>{{score.fineractClientId}}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="field-grid">
              <div *ngFor="let f of score.fields" class="field-item" [class]="'field-'+f.status.toLowerCase()">
                <mat-icon class="field-status-icon">{{getStatusIcon(f.status)}}</mat-icon>
                <div class="field-info">
                  <div class="field-name">{{f.fieldName}}</div>
                  <div class="field-value-text">{{f.fieldValue || '—'}}</div>
                  <div *ngIf="f.warningNote" class="field-warn-note">{{f.warningNote}}</div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div>
          <mat-card class="warnings-card" *ngIf="score.warnings.length>0">
            <mat-card-header>
              <mat-icon mat-card-avatar color="warn">warning</mat-icon>
              <mat-card-title>Data Quality Warnings</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngFor="let w of score.warnings" class="warning-item">
                <mat-icon class="warn-icon">error_outline</mat-icon>
                <span>{{w}}</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card *ngIf="score.warnings.length===0" class="success-card">
            <mat-card-content>
              <mat-icon color="primary">check_circle</mat-icon>
              <span>No data quality issues detected.</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="metro2-card" *ngIf="metro2">
            <mat-card-header>
              <mat-card-title>Metro 2 Field Mapping</mat-card-title>
              <mat-card-subtitle>
                {{metro2.readyCount}} mapped · {{metro2.missingCount}} missing
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="metro2.mappings" class="metro2-table">
                <ng-container matColumnDef="fineract">
                  <th mat-header-cell *matHeaderCellDef>Fineract Field</th>
                  <td mat-cell *matCellDef="let m"><code>{{m.fineractField}}</code></td>
                </ng-container>
                <ng-container matColumnDef="bureau">
                  <th mat-header-cell *matHeaderCellDef>Bureau Field</th>
                  <td mat-cell *matCellDef="let m"><code>{{m.bureauField}}</code></td>
                </ng-container>
                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef>Value</th>
                  <td mat-cell *matCellDef="let m">
                    <span [class]="m.value?'':'empty-val'">{{m.value || '—'}}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let m">
                    <mat-chip [color]="m.status==='mapped'?'primary':m.status==='missing'?'warn':'accent'"
                              selected style="font-size:11px">
                      {{m.status}}
                    </mat-chip>
                    <mat-icon *ngIf="m.required" matTooltip="Required for Metro 2"
                              style="font-size:14px;color:#F57C00;vertical-align:middle">star</mat-icon>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="metro2Cols"></tr>
                <tr mat-row *matRowDef="let row; columns: metro2Cols;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    .page-header h2 { display:flex; align-items:center; gap:8px; margin:0; color:#1565C0; }
    .page-header p  { margin:4px 0 0; color:#666; }
    .header-icon    { font-size:1.5rem; }
    .metrics-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
    .metric-card mat-card-content { padding:1rem !important; }
    .metric-label   { font-size:12px; color:#666; margin-bottom:6px; }
    .metric-value   { font-size:2rem; font-weight:600; line-height:1; }
    .metric-value small { font-size:1rem; color:#888; }
    .metric-value.primary { color:#1565C0; }
    .metric-value.danger  { color:#c62828; }
    .metric-value.warn    { color:#E65100; }
    .metric-sub { color:#999; font-size:12px; display:block; margin-top:4px; }
    .readiness-chip { margin-top:6px !important; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .field-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:1rem; }
    .field-item { display:flex; align-items:flex-start; gap:8px; padding:8px; border-radius:6px; border-left:3px solid transparent; }
    .field-ok       { background:#E8F5E9; border-color:#4CAF50; }
    .field-warn     { background:#FFF3E0; border-color:#FF9800; }
    .field-critical { background:#FFEBEE; border-color:#F44336; }
    .field-missing  { background:#F5F5F5; border-color:#BDBDBD; }
    .field-status-icon { font-size:18px; margin-top:2px; flex-shrink:0; }
    .field-ok .field-status-icon     { color:#4CAF50; }
    .field-warn .field-status-icon   { color:#FF9800; }
    .field-critical .field-status-icon { color:#F44336; }
    .field-missing .field-status-icon  { color:#BDBDBD; }
    .field-name { font-size:13px; font-weight:500; }
    .field-value-text { font-size:12px; color:#555; }
    .field-warn-note  { font-size:11px; color:#E65100; margin-top:2px; }
    .warnings-card { margin-bottom:1rem; }
    .warning-item { display:flex; align-items:flex-start; gap:8px; padding:8px 0; border-bottom:1px solid #F5F5F5; font-size:13px; }
    .warn-icon { color:#F57C00; font-size:18px; }
    .success-card mat-card-content { display:flex; align-items:center; gap:8px; color:#388E3C; }
    .metro2-card { margin-top:1rem; }
    .metro2-table { width:100%; font-size:12px; }
    code { background:#F5F5F5; padding:2px 5px; border-radius:3px; font-size:11px; }
    .empty-val { color:#BDBDBD; }
  `]
})
export class KycCompletenessComponent implements OnInit {
  @Input() clientId!: string;
  private kycService = inject(KycService);
  score: KycScoreResponse | null = null;
  metro2: Metro2PreviewResponse | null = null;
  loading = true;
  metro2Cols = ['fineract','bureau','value','status'];

  ngOnInit() {
    const id = Number(this.clientId);
    this.kycService.getScore(id).subscribe({
      next: d => { this.score = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.kycService.getMetro2Preview(id).subscribe({
      next: d => this.metro2 = d
    });
  }

  getScoreClass(s: number): string {
    return s >= 90 ? 'primary' : s >= 65 ? 'warn' : 'danger';
  }
  getReadinessColor(l: string): string {
    return l === 'HIGH' ? 'primary' : l === 'MEDIUM' ? 'accent' : 'warn';
  }
  getStatusIcon(s: string): string {
    return s === 'OK' ? 'check_circle' : s === 'WARN' ? 'warning' : s === 'CRITICAL' ? 'cancel' : 'radio_button_unchecked';
  }
}