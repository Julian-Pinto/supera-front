import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-order-disabled-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-shell">
      <h2>👋 ¡Hola! Gracias por visitarnos.</h2>
      <p>
        En este momento no estamos disponibles para recibir pedidos, pero volveremos muy pronto. 😊
      </p>
      <p>
        Agradecemos tu comprensión y te invitamos a intentarlo nuevamente más tarde. ¡Será un gusto atenderte!
      </p>
      <div class="dialog-actions">
        <button mat-flat-button color="primary" (click)="dialogRef.close()">Cerrar</button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-shell {
        display: grid;
        gap: 1rem;
        padding: 1rem;
      }

      h2 {
        margin: 0;
        font-size: 1.15rem;
      }

      p {
        margin: 0;
        color: rgba(0, 0, 0, 0.78);
        line-height: 1.5;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class OrderDisabledDialogComponent {
  constructor(public dialogRef: MatDialogRef<OrderDisabledDialogComponent>) {}
}
