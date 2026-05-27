import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatToolbarModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <main class="login-page">
      <mat-toolbar color="primary">
        <span>Admin Login</span>
      </mat-toolbar>

      <section class="login-panel">
        <h1>Iniciar sesión</h1>

        <form (ngSubmit)="login()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Usuario</mat-label>
            <input matInput name="username" [(ngModel)]="username" required />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" name="password" [(ngModel)]="password" required />
          </mat-form-field>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button mat-flat-button color="primary" type="submit" class="login-button">
            Iniciar sesión
          </button>
        </form>
      </section>
    </main>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f5f7fb;
      }

      .login-panel {
        margin: auto;
        width: min(420px, calc(100% - 2rem));
        padding: 2rem;
        background: #ffffff;
        border-radius: 14px;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
      }

      .login-panel h1 {
        margin: 0 0 1rem;
        font-size: 1.5rem;
      }

      .full-width {
        width: 100%;
      }

      .error-message {
        color: #d32f2f;
        margin: 0.75rem 0 1rem;
      }

      .login-button {
        width: 100%;
      }
    `,
  ],
})
export class AdminLoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  login(): void {
    this.errorMessage = '';

    if (this.auth.login(this.username.trim(), this.password)) {
      this.router.navigate(['/admin']);
      return;
    }

    this.errorMessage = 'Usuario o contraseña incorrectos.';
  }
}
