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
import { AuthService } from '../../interceptors/auth.interceptor';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule,
            MatListModule, MatIconModule, MatButtonModule, MatBadgeModule, MatTooltipModule],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <span class="logo-text">CB-ILD</span>
          <small>Mifos Credit Bureau</small>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard/clients" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Clients</span>
          </a>
          <a mat-list-item routerLink="/dashboard/submissions" routerLinkActive="active-link">
            <mat-icon matListItemIcon>send</mat-icon>
            <span matListItemTitle>Submissions</span>
          </a>
          <a mat-list-item routerLink="/dashboard/disputes" routerLinkActive="active-link">
            <mat-icon matListItemIcon>gavel</mat-icon>
            <span matListItemTitle>Disputes</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <small>Logged in as</small>
          <strong>{{ user }}</strong>
          <small class="role-badge">{{ role }}</small>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <mat-toolbar color="primary" class="toolbar">
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
