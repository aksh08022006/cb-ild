import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';
import { CanActivateFn } from '@angular/router';

// ─── Auth Service ─────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>('/api/auth/login', { username, password }).pipe(
      tap(res => {
        if (res.data?.token) {
          localStorage.setItem('cbild_token', res.data.token);
          localStorage.setItem('cbild_role',  res.data.role);
          localStorage.setItem('cbild_user',  res.data.username);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('cbild_token');
    localStorage.removeItem('cbild_role');
    localStorage.removeItem('cbild_user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null  { return localStorage.getItem('cbild_token'); }
  getRole(): string | null   { return localStorage.getItem('cbild_role'); }
  getUser(): string | null   { return localStorage.getItem('cbild_user'); }
  isLoggedIn(): boolean      { return !!this.getToken(); }
}

// ─── HTTP Interceptor ─────────────────────────────────────────────────────────
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('cbild_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

// ─── Route Guard ─────────────────────────────────────────────────────────────
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};
