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
  templateUrl: 'layout.component.html',
  styleUrls: ['layout.component.scss']
})
export class LayoutComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  user = this.auth.getUser() ?? 'user';
  role = this.auth.getRole() ?? '';

  logout()   { this.auth.logout(); }
  openDocs() { window.open('/swagger-ui.html', '_blank'); }
}
