import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../interceptors/auth.interceptor';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-wrap">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-logo">
            <img src="assets/mifos-logo.svg" alt="Mifos" onerror="this.style.display='none'">
            <h1>CB-ILD</h1>
            <p>Credit Bureau Information Lifecycle Dashboard</p>
          </div>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput [(ngModel)]="username" (keyup.enter)="login()">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput [type]="showPass ? 'text' : 'password'" [(ngModel)]="password" (keyup.enter)="login()">
            <mat-icon matSuffix (click)="showPass=!showPass" style="cursor:pointer">
              {{showPass ? 'visibility_off' : 'visibility'}}
            </mat-icon>
          </mat-form-field>
          <div class="error-msg" *ngIf="error">{{error}}</div>
          <button mat-raised-button color="primary" class="full-width login-btn"
                  (click)="login()" [disabled]="loading">
            <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
            {{loading ? 'Signing in…' : 'Sign In'}}
          </button>
          <div class="demo-creds">
            <small>Demo: admin / admin123 &nbsp;|&nbsp; kyc_officer / kyc123</small>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center;
                  background: linear-gradient(135deg,#1565C0 0%,#0D47A1 100%); }
    .login-card { width:400px; padding:2rem; }
    .login-logo { text-align:center; margin-bottom:1.5rem; }
    .login-logo h1 { font-size:2rem; color:#1565C0; margin:0.5rem 0 0; }
    .login-logo p  { color:#666; font-size:0.85rem; margin:0; }
    .full-width  { width:100%; }
    .login-btn   { height:48px; font-size:1rem; margin-top:0.5rem; }
    .error-msg   { color:#c62828; font-size:0.85rem; margin-bottom:0.5rem; }
    .demo-creds  { text-align:center; margin-top:1rem; color:#999; }
  `]
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  username = ''; password = ''; showPass = false;
  loading = false; error = '';

  login(): void {
    if (!this.username || !this.password) { this.error = 'Enter username and password'; return; }
    this.loading = true; this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: () => { this.loading = false; this.error = 'Invalid credentials'; }
    });
  }
}
