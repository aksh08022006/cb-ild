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
      <!-- Top metrics row -->
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

      <!-- Client info + warnings -->
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
          <!-- Warnings -->
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

          <!-- Metro 2 preview -->
          <mat-card class="metro2-card" *ngIf="metro2">
            <mat-card-header>
              <mat-card-title>Metro 2® Field Mapping</mat-card-title>
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
    :host { --primary: #4f46e5; --success: #10b981; --warning: #f59e0b; --danger: #ef4444; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding: 0 4px;
    }

    .page-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.02em;
    }

    .page-header p {
      margin: 8px 0 0;
      color: #94a3b8;
      font-size: 0.95rem;
    }

    .header-icon {
      font-size: 2rem;
      color: var(--primary);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    ::ng-deep .metric-card {
      background: rgba(15, 23, 42, 0.5) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 16px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    ::ng-deep .metric-card:hover {
      background: rgba(15, 23, 42, 0.6) !important;
      border-color: rgba(79, 70, 229, 0.3) !important;
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1) !important;
    }

    .metric-card mat-card-content {
      padding: 1.5rem !important;
    }

    .metric-label {
      font-size: 0.875rem;
      color: #94a3b8;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
      margin: 8px 0;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .metric-value small {
      font-size: 1.1rem;
      color: #94a3b8;
      -webkit-text-fill-color: unset;
      background: unset;
      -webkit-background-clip: unset;
      background-clip: unset;
    }

    .metric-value.primary {
      color: var(--primary);
      -webkit-text-fill-color: var(--primary);
    }

    .metric-value.danger {
      color: var(--danger);
      -webkit-text-fill-color: var(--danger);
    }

    .metric-value.warn {
      color: var(--warning);
      -webkit-text-fill-color: var(--warning);
    }

    .metric-sub {
      color: #64748b;
      font-size: 0.8rem;
      display: block;
      margin-top: 8px;
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    ::ng-deep .two-col mat-card {
      background: rgba(15, 23, 42, 0.5) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 16px !important;
    }

    .field-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 1rem;
    }

    .field-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      border-left: 3px solid transparent;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }

    .field-item:hover {
      transform: translateX(2px);
    }

    .field-ok {
      background: rgba(16, 185, 129, 0.1);
      border-color: var(--success);
    }

    .field-warn {
      background: rgba(245, 158, 11, 0.1);
      border-color: var(--warning);
    }

    .field-critical {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--danger);
    }

    .field-missing {
      background: rgba(100, 116, 139, 0.08);
      border-color: rgba(148, 163, 184, 0.3);
    }

    .field-status-icon {
      font-size: 20px;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .field-ok .field-status-icon {
      color: var(--success);
    }

    .field-warn .field-status-icon {
      color: var(--warning);
    }

    .field-critical .field-status-icon {
      color: var(--danger);
    }

    .field-missing .field-status-icon {
      color: #94a3b8;
    }

    .field-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #f1f5f9;
    }

    .field-value-text {
      font-size: 0.85rem;
      color: #cbd5e1;
      margin-top: 2px;
    }

    .field-warn-note {
      font-size: 0.75rem;
      color: var(--warning);
      margin-top: 4px;
      font-weight: 500;
    }

    .warnings-card {
      margin-bottom: 1rem;
    }

    .warning-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.9rem;
      color: #f1f5f9;
    }

    .warn-icon {
      color: var(--warning);
      font-size: 18px;
      flex-shrink: 0;
    }

    .success-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--success);
      font-weight: 500;
    }

    .metro2-card {
      margin-top: 1rem;
    }

    .metro2-table {
      width: 100%;
      font-size: 0.85rem;
    }

    ::ng-deep .metro2-table th {
      background: rgba(79, 70, 229, 0.1);
      color: #e0e7ff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(79, 70, 229, 0.2);
    }

    ::ng-deep .metro2-table td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      padding: 10px;
    }

    code {
      background: rgba(99, 102, 241, 0.15);
      color: #c7d2fe;
      padding: 3px 7px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-family: 'Courier New', monospace;
    }

    .empty-val {
      color: #64748b;
      font-style: italic;
    }

    @media (max-width: 1200px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .field-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .two-col {
        grid-template-columns: 1fr;
      }
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
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
