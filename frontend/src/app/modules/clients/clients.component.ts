import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClientApiService, ClientSummaryDto } from '../../shared/services/api.services';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatButtonModule,
            MatIconModule, MatChipsModule, MatTooltipModule, MatProgressBarModule],
  template: `
    <div class="page-header">
      <h2>Client Registry</h2>
      <p>Select a client to view their credit bureau lifecycle</p>
    </div>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <mat-card>
      <mat-card-content>
        <table mat-table [dataSource]="clients" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>Fineract ID</th>
            <td mat-cell *matCellDef="let c">
              <code>{{c.fineractClientId}}</code>
            </td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let c"><strong>{{c.fullName}}</strong></td>
          </ng-container>
          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef>City</th>
            <td mat-cell *matCellDef="let c">{{c.city}}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let c">
              <mat-chip [color]="c.accountStatus==='ACTIVE'?'primary':'warn'" selected>
                {{c.accountStatus}}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button matTooltip="KYC Score" (click)="go('kyc',c.id)" color="primary">
                <mat-icon>verified_user</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Bureau Monitor" (click)="go('bureau',c.id)" color="accent">
                <mat-icon>monitor</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Insights" (click)="go('insights',c.id)">
                <mat-icon>insights</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Disputes" (click)="go('disputes',c.id)">
                <mat-icon>gavel</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;" class="hover-row"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { margin-bottom:1.5rem; }
    .page-header h2 { margin:0; font-size:1.5rem; color:#1565C0; }
    .page-header p  { margin:4px 0 0; color:#666; }
    .full-width { width:100%; }
    .hover-row:hover { background:#E3F2FD; cursor:pointer; }
    code { background:#F5F5F5; padding:2px 6px; border-radius:4px; font-size:0.85rem; }
  `]
})
export class ClientsComponent implements OnInit {
  private clientApi = inject(ClientApiService);
  private router    = inject(Router);
  clients: ClientSummaryDto[] = [];
  loading = true;
  cols = ['id','name','city','status','actions'];

  ngOnInit() {
    this.clientApi.getAll().subscribe({
      next: d => { this.clients = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  go(module: string, id: number) {
    this.router.navigate([`/dashboard/${module}`, id]);
  }
}
