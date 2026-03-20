import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `<div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a;">
    <p style="color: white; font-size: 18px;">Redirecting to dashboard...</p>
  </div>`,
  styles: []
})
export class LoginComponent implements OnInit {
  router = inject(Router);

  ngOnInit() {
    // Auto-login for GSOC demo - bypass authentication
    localStorage.setItem('auth_token', 'demo_token_gsoc');
    localStorage.setItem('user_role', 'ADMIN');
    localStorage.setItem('username', 'admin');
    this.router.navigate(['/dashboard']);
  }
}
