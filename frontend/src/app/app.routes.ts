import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./core/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./core/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'clients', pathMatch: 'full' },
      {
        path: 'clients',
        loadComponent: () => import('./modules/clients/clients.component').then(m => m.ClientsComponent)
      },
      {
        path: 'kyc/:clientId',
        loadComponent: () => import('./modules/kyc-completeness/kyc-completeness.component').then(m => m.KycCompletenessComponent)
      },
      {
        path: 'submissions',
        loadComponent: () => import('./modules/submission-dashboard/submission-dashboard.component').then(m => m.SubmissionDashboardComponent)
      },
      {
        path: 'bureau/:clientId',
        loadComponent: () => import('./modules/bureau-monitor/bureau-monitor.component').then(m => m.BureauMonitorComponent)
      },
      {
        path: 'insights/:clientId',
        loadComponent: () => import('./modules/data-insights/data-insights.component').then(m => m.DataInsightsComponent)
      },
      {
        path: 'disputes',
        loadComponent: () => import('./modules/dispute-resolution/dispute-resolution.component').then(m => m.DisputeResolutionComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
