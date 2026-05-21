import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Order } from '../services/order.service';

@Component({
  selector: 'app-admin-order-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-header">
      <div>
        <h2>Detalle del pedido {{ data.id }}</h2>
        <p class="customer-line">Cliente: {{ data.customer.name }}</p>
        <p class="customer-line">Tel: {{ data.customer.phone || '-' }} · Torre: {{ data.customer.tower || '-' }} · Apto: {{ data.customer.apartment || '-' }}</p>
      </div>
      <button mat-icon-button aria-label="Cerrar" (click)="dialogRef.close()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <section class="dialog-content">
      <table>
        <thead>
          <tr>
            <th>Cant</th>
            <th>Producto</th>
            <th>V/uni</th>
            <th>Sub total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of data.items">
            <td>{{ item.quantity }}</td>
            <td>{{ item.name || ('Producto ' + item.productId) }}</td>
            <td>{{ item.price | currency:'COP':'symbol':'1.0-2' }}</td>
            <td>{{ item.price * item.quantity | currency:'COP':'symbol':'1.0-2' }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <footer class="dialog-footer">
      <span>Total del pedido:</span>
      <strong>{{ data.total ?? calculateTotal() | currency:'COP':'symbol':'1.0-2' }}</strong>
    </footer>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .customer-line {
      margin: 0.25rem 0;
      color: rgba(0, 0, 0, 0.7);
    }

    .dialog-content {
      margin-top: 1rem;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 0.75rem 0.8rem;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    th {
      font-weight: 700;
      color: #1f2a60;
    }

    .dialog-footer {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      font-size: 1rem;
      align-items: center;
    }
  `],
})
export class AdminOrderDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AdminOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order
  ) {}

  calculateTotal(): number {
    return this.data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
