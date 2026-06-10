import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    <div class="login-dialog">
      <h2>Acceso administrador</h2>
      <p>Por favor ingresa tus credenciales para continuar.</p>

      <form class="login-form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Usuario</mat-label>
          <input matInput [(ngModel)]="username" name="username" required autocomplete="username" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contraseña</mat-label>
          <input matInput type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" />
        </mat-form-field>

        <div class="actions">
          <button mat-stroked-button type="button" (click)="cancel()">Cancelar</button>
          <button mat-flat-button color="primary" type="submit">Ingresar</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-dialog {
      min-width: 320px;
      max-width: 420px;
    }

    .login-dialog h2 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1.3rem;
    }

    .login-dialog p {
      margin: 0 0 1rem;
      color: rgba(0, 0, 0, 0.7);
    }

    .login-form {
      display: grid;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `],
})
export class AdminLoginDialogComponent {
  username = '';
  password = '';

  private readonly dialogRef = inject(MatDialogRef<AdminLoginDialogComponent>);

  submit(): void {
    const validUser = this.username.trim().toLowerCase() === 'admin';
    const validPassword = this.password === 'admin123';

    if (validUser && validPassword) {
      this.dialogRef.close(true);
      return;
    }

    this.password = '';
    alert('Credenciales incorrectas. Intenta de nuevo.');
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
