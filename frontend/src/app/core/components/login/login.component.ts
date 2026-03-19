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
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../interceptors/auth.interceptor';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
            MatDividerModule, MatTabsModule],
  template: `
    <div class="login-container">
      <!-- Animated Background -->
      <div class="animated-bg">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <!-- Login Card -->
      <div class="login-wrapper">
        <mat-card class="glass-card login-card">
          <!-- Header -->
          <div class="login-header">
            <div class="logo-badge">
              <mat-icon class="logo-icon">credit_card</mat-icon>
            </div>
            <h1 class="login-title">CB-ILD</h1>
            <p class="login-subtitle">Mifos Credit Bureau Information Lifecycle Dashboard</p>
          </div>

          <mat-divider class="divider-glass"></mat-divider>

          <!-- Login Form -->
          <form (ngSubmit)="login()" class="login-form">
            <mat-form-field appearance="outline" class="full-width form-field">
              <mat-label>Username</mat-label>
              <mat-icon matPrefix class="input-icon">person_outline</mat-icon>
              <input matInput 
                     [(ngModel)]="username" 
                     name="username"
                     placeholder="Enter your username"
                     (keyup.enter)="login()"
                     [disabled]="loading">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width form-field">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix class="input-icon">lock_outline</mat-icon>
              <input matInput 
                     [type]="showPass ? 'text' : 'password'" 
                     [(ngModel)]="password"
                     name="password"
                     placeholder="Enter your password"
                     (keyup.enter)="login()"
                     [disabled]="loading">
              <button mat-icon-button matSuffix (click)="showPass=!showPass" type="button"
                      [disabled]="loading" class="toggle-visibility">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <!-- Error Message -->
            <div class="error-message" *ngIf="error">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <span>{{ error }}</span>
            </div>

            <!-- Sign In Button -->
            <button mat-raised-button 
                    type="submit"
                    class="login-btn"
                    [disabled]="loading">
              <span *ngIf="loading" class="loading-spinner">
                <mat-icon class="spinner-icon">hourglass_empty</mat-icon>
              </span>
              <span class="btn-text">{{ loading ? 'Signing in…' : 'Sign In' }}</span>
            </button>
          </form>

          <mat-divider class="divider-glass"></mat-divider>

          <!-- Demo Credentials -->
          <div class="demo-credentials">
            <p class="demo-title">Demo Accounts</p>
            <div class="demo-list">
              <div class="demo-item">
                <span class="demo-role">Admin</span>
                <code>admin / admin123</code>
              </div>
              <div class="demo-item">
                <span class="demo-role">KYC Officer</span>
                <code>kyc_officer / kyc123</code>
              </div>
              <div class="demo-item">
                <span class="demo-role">Analyst</span>
                <code>analyst / analyst123</code>
              </div>
              <div class="demo-item">
                <span class="demo-role">Compliance</span>
                <code>compliance / comply123</code>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Footer -->
        <div class="login-footer">
          <small>Mifos CB-ILD © 2026 | GSoC Proof of Work</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      background-attachment: fixed;
    }

    .animated-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      overflow: hidden;
    }

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float 10s ease-in-out infinite;
    }

    .orb-1 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      top: -50px;
      right: -50px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 250px;
      height: 250px;
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      bottom: 50px;
      left: -50px;
      animation-delay: 2s;
    }

    .orb-3 {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #8b5cf6, #a78bfa);
      bottom: -50px;
      right: 50px;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(30px, -30px); }
    }

    .login-wrapper {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 500px;
      padding: 24px;
    }

    .login-card {
      background: rgba(15, 23, 42, 0.7) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 24px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                  inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
      padding: 48px !important;
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-badge {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3);
    }

    .logo-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .login-title {
      font-size: 2rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .login-subtitle {
      font-size: 0.9rem;
      color: #94a3b8;
      margin: 8px 0 0;
      letter-spacing: -0.01em;
    }

    .divider-glass {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent) !important;
      margin: 24px 0 !important;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }

    .form-field {
      width: 100%;

      ::ng-deep .mat-mdc-text-field-wrapper {
        padding-bottom: 0 !important;
      }

      ::ng-deep .mat-mdc-form-field-focus-overlay {
        background-color: transparent !important;
      }
    }

    .input-icon {
      color: #64748b;
      margin-right: 8px;
    }

    ::ng-deep .form-field .mat-mdc-form-field-infix {
      border-top: none !important;
    }

    ::ng-deep .form-field .mat-mdc-notched-outline {
      --mdc-notched-outline-leading-width: 0 !important;
    }

    ::ng-deep .form-field .mat-mdc-notched-outline .mdc-notched-outline__leading {
      width: 0 !important;
    }

    ::ng-deep .form-field .mat-mdc-text-field-wrapper {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 16px;
    }

    ::ng-deep .form-field input {
      color: #f8fafc;
      font-size: 1rem;

      &::placeholder {
        color: #64748b;
      }
    }

    ::ng-deep .form-field .mat-mdc-form-field-label {
      color: #94a3b8;
    }

    .toggle-visibility {
      color: #64748b !important;
      margin-right: -8px;

      &:hover {
        color: #cbd5e1 !important;
      }
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fca5a5;
      font-size: 0.9rem;
      margin-top: 8px;
    }

    .error-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .login-btn {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
      color: white !important;
      font-weight: 700;
      font-size: 1rem;
      padding: 14px 24px !important;
      border-radius: 12px !important;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(79, 70, 229, 0.4) !important;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .loading-spinner {
      display: inline-flex;
      align-items: center;
      margin-right: 8px;
    }

    .spinner-icon {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn-text {
      font-weight: 700;
    }

    .demo-credentials {
      padding: 20px;
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 16px;
      margin-top: 24px;
    }

    .demo-title {
      margin: 0 0 12px;
      color: #cbd5e1;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
    }

    .demo-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .demo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .demo-role {
      display: inline-block;
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      min-width: 80px;
      text-align: center;
    }

    code {
      background: rgba(0, 0, 0, 0.2);
      color: #e0e7ff;
      padding: 4px 8px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      flex: 1;
    }

    .login-footer {
      text-align: center;
      margin-top: 24px;
      color: #64748b;
      font-size: 0.85rem;
    }

    @media (max-width: 600px) {
      .login-wrapper {
        padding: 16px;
      }

      .login-card {
        padding: 32px 24px !important;
      }

      .login-title {
        font-size: 1.5rem;
      }

      .orb-1, .orb-2, .orb-3 {
        display: none;
      }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  showPass = false;
  loading = false;
  error = '';
  router = inject(Router);

  login() {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }

    this.loading = true;
    this.error = '';

    // Simulate API call
    setTimeout(() => {
      if ((this.username === 'admin' && this.password === 'admin123') ||
          (this.username === 'kyc_officer' && this.password === 'kyc123') ||
          (this.username === 'analyst' && this.password === 'analyst123') ||
          (this.username === 'compliance' && this.password === 'comply123')) {
        localStorage.setItem('auth_token', 'mock_jwt_token_' + Date.now());
        localStorage.setItem('user_role', this.username);
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Invalid credentials. Please try again.';
      }
      this.loading = false;
    }, 500);
  }
}
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
