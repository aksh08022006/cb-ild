import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ClientApiService, CreateClientRequest, ValidationWarning, ClientDetailDto } from '../../shared/services/api.services';

@Component({
  selector: 'app-add-client',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, MatProgressBarModule, MatChipsModule, MatDividerModule
  ],
  template: `
    <div class="page-header">
      <h2>{{ isEdit ? 'Edit Client' : 'Add New Client' }}</h2>
      <p>{{ isEdit ? 'Update client information and KYC data' : 'Create new client for credit bureau reporting' }}</p>
    </div>

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          
          <!-- Section: Client Identity -->
          <h3 class="section-title">
            <mat-icon>badge</mat-icon> Client Identity
          </h3>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Fineract Client ID</mat-label>
              <input matInput formControlName="fineractClientId" [readonly]="isEdit" placeholder="e.g., FC-10421">
              <mat-icon matSuffix [ngClass]="getFieldStatus('fineractClientId')">{{ getFieldIcon('fineractClientId') }}</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>First Name *</mat-label>
              <input matInput formControlName="firstName" placeholder="e.g., Anjali">
              <mat-icon matSuffix [ngClass]="getFieldStatus('firstName')">{{ getFieldIcon('firstName') }}</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Last Name *</mat-label>
              <input matInput formControlName="lastName" placeholder="e.g., Mehta">
              <mat-icon matSuffix [ngClass]="getFieldStatus('lastName')">{{ getFieldIcon('lastName') }}</mat-icon>
            </mat-form-field>
          </div>

          <!-- Section: Personal Information -->
          <h3 class="section-title">
            <mat-icon>person</mat-icon> Personal Information
          </h3>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Date of Birth *</mat-label>
              <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth">
              <mat-datepicker-toggle matSuffix [for]="dobPicker"></mat-datepicker-toggle>
              <mat-datepicker #dobPicker></mat-datepicker>
              <mat-icon matSuffix [ngClass]="getFieldStatus('dateOfBirth')">{{ getFieldIcon('dateOfBirth') }}</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Gender</mat-label>
              <mat-select formControlName="gender">
                <mat-option value="">Select</mat-option>
                <mat-option value="MALE">Male</mat-option>
                <mat-option value="FEMALE">Female</mat-option>
                <mat-option value="OTHER">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>National ID (PAN/Aadhaar/DL) *</mat-label>
              <input matInput formControlName="nationalId" placeholder="e.g., MHTA8803121F">
              <mat-icon matSuffix [ngClass]="getFieldStatus('nationalId')">{{ getFieldIcon('nationalId') }}</mat-icon>
            </mat-form-field>
          </div>

          <!-- Section: Contact Information -->
          <h3 class="section-title">
            <mat-icon>phone</mat-icon> Contact Information
          </h3>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Mobile Number</mat-label>
              <input matInput formControlName="mobileNo" placeholder="+91-9876543210">
              <mat-icon matSuffix [ngClass]="getFieldStatus('mobileNo')">{{ getFieldIcon('mobileNo') }}</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="email@example.com">
              <mat-icon matSuffix [ngClass]="getFieldStatus('email')">{{ getFieldIcon('email') }}</mat-icon>
            </mat-form-field>
          </div>

          <!-- Section: Address Information -->
          <h3 class="section-title">
            <mat-icon>location_on</mat-icon> Address Information
          </h3>
          
          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>Address Line 1 *</mat-label>
            <input matInput formControlName="addressLine1" placeholder="e.g., 12 MG Road">
            <mat-icon matSuffix [ngClass]="getFieldStatus('addressLine1')">{{ getFieldIcon('addressLine1') }}</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>Address Line 2</mat-label>
            <input matInput formControlName="addressLine2" placeholder="Optional">
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>City *</mat-label>
              <input matInput formControlName="city" placeholder="e.g., Mumbai">
              <mat-icon matSuffix [ngClass]="getFieldStatus('city')">{{ getFieldIcon('city') }}</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>State *</mat-label>
              <input matInput formControlName="state" placeholder="e.g., Maharashtra">
              <mat-icon matSuffix [ngClass]="getFieldStatus('state')">{{ getFieldIcon('state') }}</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Postal Code *</mat-label>
              <input matInput formControlName="postalCode" placeholder="e.g., 400001">
              <mat-icon matSuffix [ngClass]="getFieldStatus('postalCode')">{{ getFieldIcon('postalCode') }}</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Country</mat-label>
              <input matInput formControlName="country" placeholder="IN" value="IN">
            </mat-form-field>
          </div>

          <!-- Section: Account Information -->
          <h3 class="section-title">
            <mat-icon>assignment</mat-icon> Account Information
          </h3>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Activation Date *</mat-label>
              <input matInput [matDatepicker]="activationPicker" formControlName="activationDate">
              <mat-datepicker-toggle matSuffix [for]="activationPicker"></mat-datepicker-toggle>
              <mat-datepicker #activationPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Account Status</mat-label>
              <mat-select formControlName="accountStatus">
                <mat-option value="ACTIVE">Active</mat-option>
                <mat-option value="INACTIVE">Inactive</mat-option>
                <mat-option value="CLOSED">Closed</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- KYC Status Display -->
          <mat-divider class="divider"></mat-divider>
          
          <div *ngIf="kycCompleteness >= 0" class="kyc-status">
            <h3>KYC Completeness Score</h3>
            <div class="score-display">
              <div class="score-circle" [ngClass]="'score-' + getScoreLevel()">
                {{ kycCompleteness }}%
              </div>
              <div class="score-info">
                <p class="score-level">{{ getScoreLevel() }}</p>
                <p class="score-label">{{ getScoreLabel() }}</p>
              </div>
            </div>
            <mat-progress-bar mode="determinate" [value]="kycCompleteness"></mat-progress-bar>
          </div>

          <!-- Validation Warnings -->
          <div *ngIf="warnings && warnings.length > 0" class="warnings-section">
            <h3>Data Quality Warnings</h3>
            <mat-chip-set>
              <mat-chip *ngFor="let w of warnings" [ngClass]="'severity-' + w.severity.toLowerCase()">
                <mat-icon>{{ w.severity === 'HIGH' ? 'error' : 'warning' }}</mat-icon>
                <strong>{{ w.fieldName }}</strong>: {{ w.message }}
                <mat-icon matChipRemove *ngIf="false">close</mat-icon>
              </mat-chip>
            </mat-chip-set>
            <div class="recommendations">
              <p *ngFor="let w of warnings" class="rec-item">
                <mat-icon>info</mat-icon> {{ w.recommendation }}
              </p>
            </div>
          </div>

          <!-- Form Actions -->
          <mat-divider class="divider"></mat-divider>
          
          <div class="form-actions">
            <button mat-raised-button (click)="goBack()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="!form.valid || loading">
              <mat-icon *ngIf="!loading">save</mat-icon>
              <span *ngIf="loading">Saving...</span>
              <span *ngIf="!loading">{{ isEdit ? 'Update Client' : 'Create Client' }}</span>
            </button>
          </div>

          <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-header h2 { margin: 0; font-size: 1.5rem; color: #1565C0; }
    .page-header p { margin: 4px 0 0; color: #666; font-size: 0.95rem; }
    
    mat-card { margin-bottom: 2rem; }
    
    h3.section-title {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 1.1rem; color: #1565C0; margin-top: 1.5rem; margin-bottom: 1rem;
    }
    
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .form-field { width: 100%; }
    .form-field.full-width { grid-column: 1 / -1; }
    
    mat-form-field { width: 100%; }
    
    .kyc-status {
      background: #F0F4F8; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;
      border-left: 4px solid #1565C0;
    }
    .score-display { display: flex; align-items: center; gap: 2rem; margin-bottom: 1rem; }
    .score-circle {
      width: 100px; height: 100px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: bold; color: white;
    }
    .score-HIGH { background: #4CAF50; }
    .score-MEDIUM { background: #FF9800; }
    .score-LOW { background: #F44336; }
    .score-info { flex: 1; }
    .score-level { margin: 0; font-weight: bold; font-size: 1.1rem; color: #1565C0; }
    .score-label { margin: 4px 0 0; color: #666; font-size: 0.9rem; }
    
    .warnings-section {
      background: #FFF3CD; padding: 1.5rem; border-radius: 8px;
      margin: 1.5rem 0; border-left: 4px solid #FF9800;
    }
    .warnings-section h3 { margin-top: 0; color: #F57C00; }
    
    mat-chip-set { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    mat-chip { font-size: 0.85rem !important; }
    .severity-high { background: #FFEBEE !important; color: #C62828 !important; }
    .severity-medium { background: #FFF3E0 !important; color: #E65100 !important; }
    .severity-low { background: #F1F8E9 !important; color: #558B2F !important; }
    
    .recommendations {
      margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.1);
    }
    .rec-item {
      margin: 0.5rem 0; display: flex; align-items: flex-start; gap: 0.5rem;
      color: #666; font-size: 0.9rem;
    }
    .rec-item mat-icon { margin-top: 2px; font-size: 16px; width: 16px; height: 16px; }
    
    .divider { margin: 2rem 0; }
    
    .form-actions {
      display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;
    }
    
    .status-icon { margin-left: auto; }
    .status-ok { color: #4CAF50; }
    .status-warn { color: #FF9800; }
    .status-critical { color: #F44336; }
    .status-missing { color: #999; }
  `]
})
export class AddClientComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientApi = inject(ClientApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  loading = false;
  isEdit = false;
  clientId?: number;
  warnings: ValidationWarning[] = [];
  kycCompleteness = -1;

  ngOnInit() {
    this.initializeForm();
    this.checkIfEdit();
  }

  private initializeForm() {
    this.form = this.fb.group({
      fineractClientId: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: [''],
      gender: [''],
      nationalId: [''],
      mobileNo: [''],
      email: ['', Validators.email],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: [''],
      country: ['IN'],
      activationDate: ['', Validators.required],
      accountStatus: ['ACTIVE']
    });

    this.form.valueChanges.subscribe(() => this.computeKycScore());
  }

  private checkIfEdit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.clientId = +params['id'];
        this.loadClient(this.clientId);
      }
    });
  }

  private loadClient(id: number) {
    this.loading = true;
    this.clientApi.getDetails(id).subscribe({
      next: (client) => {
        this.form.patchValue(client);
        this.kycCompleteness = client.kycCompleteness;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load client');
      }
    });
  }

  private computeKycScore() {
    const controls = this.form.controls;
    
    // CDC (Círculo de Crédito) Mexico Format - Mandatory Fields
    // Score calculation: MANDATORY fields × 15 points each
    const mandatoryFields = ['firstName', 'lastName', 'dateOfBirth', 'nationalId', 
                             'addressLine1', 'city', 'state', 'postalCode'];
    
    // OPTIONAL fields enhance the score
    const optionalFields = ['mobileNo', 'email', 'gender'];
    
    // Count filled mandatory fields (max 105 points)
    let mandatoryPoints = 0;
    for (const field of mandatoryFields) {
      const val = controls[field].value;
      if (val && val.toString().trim() !== '') {
        mandatoryPoints += 15;
      }
    }
    
    // Count filled optional fields (max 25 points)
    let optionalPoints = 0;
    for (const field of optionalFields) {
      const val = controls[field].value;
      if (val && val.toString().trim() !== '') {
        optionalPoints += 5;
      }
    }
    
    // Calculate final score: (points / 130) × 100, capped at 100%
    const maxPoints = 130; // (8 mandatory × 15) + (5 optional × 5)
    const totalPoints = mandatoryPoints + optionalPoints;
    this.kycCompleteness = Math.min(Math.round((totalPoints / maxPoints) * 100), 100);
    
    // Validate after slight delay to avoid ExpressionChangedAfterCheckError
    setTimeout(() => {
      if (this.form.valid) {
        const req = this.form.value as CreateClientRequest;
        if (this.clientId) {
          this.clientApi.validate(this.clientId, req).subscribe(
            w => this.warnings = w,
            () => this.warnings = []
          );
        }
      }
    }, 100);
  }

  submit() {
    if (!this.form.valid) {
      alert('Please fill all required fields');
      return;
    }

    this.loading = true;
    const request = this.form.value as CreateClientRequest;

    const operation = this.isEdit && this.clientId 
      ? this.clientApi.update(this.clientId, request)
      : this.clientApi.create(request);

    operation.subscribe({
      next: (result) => {
        this.loading = false;
        alert(this.isEdit ? 'Client updated successfully' : 'Client created successfully');
        this.router.navigate(['/dashboard/clients']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error details:', err);
        const message = err.error?.message || err.message || 'Operation failed. Please check console for details.';
        alert('Error: ' + message);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/clients']);
  }

  getFieldStatus(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || control.pristine) return '';
    if (control.valid) return 'status-ok';
    return 'status-critical';
  }

  getFieldIcon(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || control.pristine) return '';
    if (control.valid) return 'check_circle';
    return 'error';
  }

  getScoreLevel(): string {
    // CDC Format: HIGH = all 7 mandatory fields (105/130 = 81%), MEDIUM = 5+ mandatory
    if (this.kycCompleteness >= 81) return 'HIGH';
    if (this.kycCompleteness >= 58) return 'MEDIUM';
    return 'LOW';
  }

  getScoreLabel(): string {
    // CDC Círculo de Crédito readiness labels
    if (this.kycCompleteness >= 81) return 'Ready for Círculo de Crédito submission';
    if (this.kycCompleteness >= 58) return 'Incomplete CDC submission - some mandatory fields missing';
    return 'Cannot submit to bureau - critical CDC fields missing';
  }
}
