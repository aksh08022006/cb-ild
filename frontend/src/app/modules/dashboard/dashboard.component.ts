import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule,
            MatDividerModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="dashboard-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to CB-ILD — Central Hub for Credit Bureau Information Lifecycle Management</p>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-section">
        <div class="metric-card" routerLink="/dashboard/clients">
          <div class="metric-icon clients-icon">
            <mat-icon>people</mat-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">Total Clients</div>
            <div class="metric-value">1,245</div>
            <small>Active clients in system</small>
          </div>
          <mat-icon class="metric-arrow">arrow_forward</mat-icon>
        </div>

        <div class="metric-card" routerLink="/dashboard/kyc-completeness">
          <div class="metric-icon kyc-icon">
            <mat-icon>verified_user</mat-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">KYC Complete</div>
            <div class="metric-value">89%</div>
            <small>Of total clients</small>
          </div>
          <mat-icon class="metric-arrow">arrow_forward</mat-icon>
        </div>

        <div class="metric-card" routerLink="/dashboard/submission-dashboard">
          <div class="metric-icon submission-icon">
            <mat-icon>upload_file</mat-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">Submissions</div>
            <div class="metric-value">342</div>
            <small>This month</small>
          </div>
          <mat-icon class="metric-arrow">arrow_forward</mat-icon>
        </div>

        <div class="metric-card" routerLink="/dashboard/bureau-monitor">
          <div class="metric-icon bureau-icon">
            <mat-icon>monitoring</mat-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">Bureau Feedback</div>
            <div class="metric-value">12</div>
            <small>Pending review</small>
          </div>
          <mat-icon class="metric-arrow">arrow_forward</mat-icon>
        </div>
      </div>

      <div class="two-col">
        <!-- Quick Stats -->
        <div class="glass-card stats-card">
          <div class="card-header">
            <h2>System Health</h2>
            <mat-icon>info</mat-icon>
          </div>
          <mat-divider class="divider-glass"></mat-divider>

          <div class="stat-item">
            <div class="stat-label">Database Status</div>
            <div class="stat-value success">
              <mat-icon>check_circle</mat-icon> Operational
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-label">API Performance</div>
            <div class="stat-value">
              <div class="stat-bar">
                <div class="stat-fill" style="width: 87%;"></div>
              </div>
              <small>87% uptime</small>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-label">Data Sync Status</div>
            <div class="stat-value info">
              <mat-icon>sync</mat-icon> Last updated 2m ago
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="glass-card activity-card">
          <div class="card-header">
            <h2>Recent Activity</h2>
            <mat-icon>history</mat-icon>
          </div>
          <mat-divider class="divider-glass"></mat-divider>

          <div class="activity-item">
            <div class="activity-icon primary">
              <mat-icon>person_add</mat-icon>
            </div>
            <div class="activity-info">
              <div class="activity-title">New client registered</div>
              <small>Client: John Smith</small>
              <div class="activity-time">2 hours ago</div>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon success">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="activity-info">
              <div class="activity-title">KYC submission approved</div>
              <small>Client ID: CL-2024-001</small>
              <div class="activity-time">4 hours ago</div>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon warning">
              <mat-icon>warning</mat-icon>
            </div>
            <div class="activity-info">
              <div class="activity-title">Bureau feedback received</div>
              <small>12 items pending action</small>
              <div class="activity-time">1 day ago</div>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon info">
              <mat-icon>assessment</mat-icon>
            </div>
            <div class="activity-info">
              <div class="activity-title">Monthly report generated</div>
              <small>All modules included</small>
              <div class="activity-time">2 days ago</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modules Overview -->
      <div class="glass-card modules-card">
        <div class="card-header">
          <h2>Available Modules</h2>
          <p>Click to access each module</p>
        </div>
        <mat-divider class="divider-glass"></mat-divider>

        <div class="modules-grid">
          <a routerLink="/dashboard/kyc-completeness" class="module-tile">
            <mat-icon class="module-icon">verified_user</mat-icon>
            <h3>KYC Completeness</h3>
            <p>Data creation & acquisition</p>
            <span class="module-badge">Module 1</span>
          </a>

          <a routerLink="/dashboard/submission-dashboard" class="module-tile">
            <mat-icon class="module-icon">upload_file</mat-icon>
            <h3>Submission Dashboard</h3>
            <p>Track & manage submissions</p>
            <span class="module-badge">Module 2</span>
          </a>

          <a routerLink="/dashboard/bureau-monitor" class="module-tile">
            <mat-icon class="module-icon">monitoring</mat-icon>
            <h3>Bureau Monitor</h3>
            <p>Feedback & performance tracking</p>
            <span class="module-badge">Module 3</span>
          </a>

          <a routerLink="/dashboard/data-insights" class="module-tile">
            <mat-icon class="module-icon">analytics</mat-icon>
            <h3>Data Insights</h3>
            <p>Analytics & visualization</p>
            <span class="module-badge">Module 4</span>
          </a>

          <a routerLink="/dashboard/dispute-resolution" class="module-tile">
            <mat-icon class="module-icon">gavel</mat-icon>
            <h3>Dispute Resolution</h3>
            <p>Handle disputes & escalations</p>
            <span class="module-badge">Module 5</span>
          </a>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="info-bar">
        <div class="info-item">
          <mat-icon>info</mat-icon>
          <span><strong>CB-ILD</strong> — Mifos Credit Bureau Information Lifecycle Dashboard</span>
        </div>
        <div class="info-item">
          <mat-icon>security</mat-icon>
          <span>Role-based access control enabled</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .page-header p {
      color: #94a3b8;
      margin: 8px 0 0;
      font-size: 1.05rem;
    }

    /* Metrics Section */
    .metrics-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .metric-card:hover {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(79, 70, 229, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
    }

    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .clients-icon {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(99, 102, 241, 0.2));
      color: #a5b4fc;
    }

    .kyc-icon {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.2));
      color: #86efac;
    }

    .submission-icon {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.2));
      color: #93c5fd;
    }

    .bureau-icon {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2));
      color: #fcd34d;
    }

    .metric-info {
      flex: 1;
      min-width: 0;
    }

    .metric-label {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .metric-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .metric-info small {
      color: #64748b;
      font-size: 0.8rem;
      display: block;
      margin-top: 4px;
    }

    .metric-arrow {
      color: #64748b;
      transition: transform 0.3s ease;
    }

    .metric-card:hover .metric-arrow {
      transform: translateX(4px);
      color: #4f46e5;
    }

    /* Glass Card */
    .glass-card {
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .card-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }

    .card-header p {
      color: #94a3b8;
      margin: 4px 0 0;
      font-size: 0.9rem;
    }

    .card-header mat-icon {
      color: #64748b;
    }

    .divider-glass {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent) !important;
      margin: 1rem 0 !important;
    }

    /* Two Column Layout */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    /* Stats */
    .stat-item {
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .stat-value {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f8fafc;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .stat-value.success {
      color: #10b981;
    }

    .stat-value.info {
      color: #06b6d4;
      font-size: 0.95rem;
    }

    .stat-bar {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .stat-fill {
      height: 100%;
      background: linear-gradient(90deg, #4f46e5, #6366f1);
      border-radius: 4px;
    }

    /* Activity */
    .activity-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 20px;
    }

    .activity-icon.primary {
      background: rgba(79, 70, 229, 0.15);
      color: #a5b4fc;
    }

    .activity-icon.success {
      background: rgba(16, 185, 129, 0.15);
      color: #86efac;
    }

    .activity-icon.warning {
      background: rgba(245, 158, 11, 0.15);
      color: #fcd34d;
    }

    .activity-icon.info {
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
    }

    .activity-title {
      color: #f8fafc;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .activity-info small {
      color: #94a3b8;
      display: block;
      margin: 2px 0;
      font-size: 0.8rem;
    }

    .activity-time {
      color: #64748b;
      font-size: 0.75rem;
      margin-top: 4px;
    }

    /* Modules Grid */
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .module-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 1.5rem;
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 14px;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .module-tile::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .module-tile:hover {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(79, 70, 229, 0.15);
    }

    .module-tile:hover::before {
      opacity: 1;
    }

    .module-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #a5b4fc;
      z-index: 1;
    }

    .module-tile h3 {
      margin: 0;
      color: #f8fafc;
      font-size: 1rem;
      font-weight: 700;
      text-align: center;
      z-index: 1;
    }

    .module-tile p {
      margin: 0;
      color: #94a3b8;
      font-size: 0.8rem;
      text-align: center;
      z-index: 1;
    }

    .module-badge {
      display: inline-block;
      background: rgba(79, 70, 229, 0.3);
      color: #c7d2fe;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      z-index: 1;
    }

    /* Info Bar */
    .info-bar {
      display: flex;
      gap: 2rem;
      padding: 1.5rem;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      margin-top: 2rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #cbd5e1;
      font-size: 0.9rem;
    }

    .info-item mat-icon {
      color: #64748b;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .two-col {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .metrics-section {
        grid-template-columns: 1fr;
      }

      .modules-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .info-bar {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  ngOnInit() {
    // Can add data loading here
  }
}
