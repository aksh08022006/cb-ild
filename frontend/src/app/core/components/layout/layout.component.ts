import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../interceptors/auth.interceptor';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule,
            MatListModule, MatIconModule, MatButtonModule, MatBadgeModule, MatTooltipModule, MatDividerModule],
  template: `
    <mat-sidenav-container class="app-container">
      <!-- Sidebar Navigation -->
      <mat-sidenav mode="side" opened class="sidenav glass-dark">
        <div class="sidenav-header">
          <div class="logo-container">
            <div class="logo-badge">
              <mat-icon>credit_card</mat-icon>
            </div>
            <div>
              <span class="logo-text">CB-ILD</span>
              <small>Mifos Credit Bureau</small>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="nav-section">
          <small class="nav-section-title">MODULES</small>
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard/kyc" routerLinkActive="active-link">
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>KYC Completeness</span>
            </a>
            <a mat-list-item routerLink="/dashboard/submissions" routerLinkActive="active-link">
              <mat-icon matListItemIcon>send</mat-icon>
              <span matListItemTitle>Submissions</span>
            </a>
            <a mat-list-item routerLink="/dashboard/bureau" routerLinkActive="active-link">
              <mat-icon matListItemIcon>domain</mat-icon>
              <span matListItemTitle>Bureau Monitor</span>
            </a>
            <a mat-list-item routerLink="/dashboard/insights" routerLinkActive="active-link">
              <mat-icon matListItemIcon>insights</mat-icon>
              <span matListItemTitle>Data Insights</span>
            </a>
            <a mat-list-item routerLink="/dashboard/disputes" routerLinkActive="active-link">
              <mat-icon matListItemIcon>gavel</mat-icon>
              <span matListItemTitle>Disputes</span>
            </a>
          </mat-nav-list>
        </div>

        <mat-divider></mat-divider>

        <div class="nav-section">
          <small class="nav-section-title">TOOLS</small>
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard/clients" routerLinkActive="active-link">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Clients</span>
            </a>
          </mat-nav-list>
        </div>

        <div class="sidenav-footer">
          <small>Logged in as</small>
          <strong>{{ user }}</strong>
          <span class="role-badge">{{ role }}</span>
        </div>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content class="main-content">
        <!-- Header -->
        <mat-toolbar class="toolbar glass-dark">
          <span class="toolbar-title">
            <mat-icon class="title-icon">dashboard</mat-icon>
            Mifos Credit Bureau Dashboard
          </span>
          <span class="spacer"></span>
          <button mat-icon-button matTooltip="API Documentation" 
                  (click)="openSwagger()" class="toolbar-btn">
            <mat-icon>api</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Settings" class="toolbar-btn">
            <mat-icon>settings</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Logout" 
                  (click)="logout()" class="toolbar-btn">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="page-container">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    }

    .sidenav {
      width: 280px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidenav-header {
      padding: 24px 16px;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .logo-badge {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f8fafc;
      display: block;
    }

    .sidenav-header small {
      color: #94a3b8;
      font-size: 0.75rem;
      display: block;
    }

    .nav-section {
      padding: 16px 8px;
      flex: 1;
    }

    .nav-section-title {
      display: block;
      padding: 12px 16px 8px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
    }

    ::ng-deep .nav-section .mat-mdc-list-item {
      border-radius: 12px;
      margin-bottom: 4px;
      color: #cbd5e1;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
      }

      &.active-link {
        background: linear-gradient(135deg, rgba(79, 70, 229, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%);
        color: #c7d2fe;

        mat-icon {
          color: #818cf8;
        }
      }
    }

    .sidenav-footer {
      padding: 24px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;

      strong {
        display: block;
        color: #f8fafc;
        font-size: 0.95rem;
        margin: 8px 0;
      }
    }

    .role-badge {
      display: inline-block;
      background: rgba(79, 70, 229, 0.2);
      color: #818cf8;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 8px;
    }

    .toolbar {
      background: rgba(30, 41, 59, 0.8) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
      color: #f8fafc;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .title-icon {
      color: #818cf8;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .toolbar-btn {
      color: #cbd5e1;
      transition: all 0.3s ease;

      &:hover {
        color: #f8fafc;
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .page-container {
      padding: 32px;
      min-height: calc(100vh - 64px);
    }

    ::ng-deep .mat-mdc-icon {
      margin-right: 8px;
    }
  `]
})
export class LayoutComponent {
  user = 'Admin User';
  role = 'ADMIN';
  router = inject(Router);

  openSwagger() {
    window.open('http://localhost:8080/swagger-ui.html', '_blank');
  }

  logout() {
    // Clear auth and redirect to login
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
          <span class="toolbar-title">Mifos Credit Bureau Information Lifecycle</span>
          <span class="spacer"></span>
          <button mat-icon-button matTooltip="Swagger API Docs"
                  (click)="openDocs()">
            <mat-icon>api</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Logout" (click)="logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-container { height:100vh; }
    .sidenav { width:220px; background:#1565C0; color:#fff; display:flex; flex-direction:column; }
    .sidenav-header { padding:1.5rem 1rem 1rem; border-bottom:1px solid rgba(255,255,255,0.2); }
    .logo-text { font-size:1.5rem; font-weight:700; display:block; }
    .sidenav-header small { font-size:0.7rem; opacity:0.8; }
    mat-nav-list a { color:rgba(255,255,255,0.85) !important; }
    .active-link { background:rgba(255,255,255,0.15) !important; color:#fff !important; }
    .sidenav-footer { margin-top:auto; padding:1rem; border-top:1px solid rgba(255,255,255,0.2); font-size:0.8rem; }
    .sidenav-footer strong { display:block; margin:2px 0; }
    .role-badge { background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:12px; font-size:0.7rem; }
    .toolbar { position:sticky; top:0; z-index:100; }
    .toolbar-title { font-size:1rem; }
    .spacer { flex:1; }
    .main-content { background:#F5F5F5; }
    .content-area { padding:1.5rem; max-width:1400px; }
  `]
})
export class LayoutComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  user = this.auth.getUser() ?? 'user';
  role = this.auth.getRole() ?? '';

  logout()   { this.auth.logout(); }
  openDocs() { window.open('/swagger-ui.html', '_blank'); }
}
